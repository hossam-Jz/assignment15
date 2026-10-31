import { Request, Response } from "express";
import {
  IconfirmEmailDto,
  IForegetPassordDto,
  IloginDto,
  IresetPassordDto,
  IsignUpDto,
  ISocialLoginDto,
} from "./auth.dto";
import { userModel, HUserDocument } from "../../DB/Modles/User.Model";
import {
  ConflictException,
  NotFoundException,
} from "../../Utils/Response/Error.Response";
import { generateOtp } from "../../Utils/generateOtp";
import { compareHash, generateHash } from "../../Utils/Security/hash";
import { emailEvents } from "../../Utils/events/email.events";
import {
  createLoginCreadential,
  ITokenPayload,
} from "../../Utils/Security/token";
import { OAuth2Client } from "google-auth-library";
import { BadRequestException } from "../../Utils/Response/Error.Response";
import { ProviderEnum } from "../../Utils/Enums/User.Enum";
import { env } from "../../config/config.service";
import { revokeTokenKey, set } from "../../DB/Modles/redis.servce";
import { successResponses } from "../../Utils/Response/success.Response";

const googleClient = new OAuth2Client();
export class AuthService {
  constructor() {}

  signUp = async (req: Request, res: Response): Promise<Response> => {
    const { userName, email, password }: IsignUpDto = req.body;

    const checkUserExists = await userModel.findOne({ email }).select("email");

    if (checkUserExists) throw new ConflictException("user Already Exists");
    const otp = generateOtp();
    const [user] = await userModel.create([
      {
        userName,
        email,
        password: await generateHash(password),
        confirmEmailOTP: await generateHash(otp),
      },
    ]);
    emailEvents.emit("confirmEmail", { to: email, userName, otp });
    return res.status(201).json({ message: "User created successfully", user });
  };

  confirmEmail = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp }: IconfirmEmailDto = req.body;
    const user = await userModel.findOne({
      email,
      confirmEmailOTP: { $exists: true },
      confirmedAt: { $exists: false },
    });

    if (!user || !user.confirmEmailOTP)
      throw new NotFoundException("Invalid email or otp");
    if (!(await compareHash(otp, user.confirmEmailOTP)))
      throw new NotFoundException("Invalid otp");

    await userModel.updateOne(
      { email },
      {
        confirmedAt: new Date(),
        $unset: { confirmEmailOTP: true },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "Email confirmed successfully" });
  };

  login = async (req: Request, res: Response): Promise<Response> => {
    const { email, password }: IloginDto = req.body;
    const user = await userModel.findOne({
      email,
      provider: ProviderEnum.SYSTEM,
      confirmedAt: { $exists: true },
    });
    if (!user || !(await compareHash(password, user.password as string)))
      throw new NotFoundException("Invalid email or password");

    const credentails = createLoginCreadential(user as HUserDocument);
    return res.status(200).json({ message: "Login successful", credentails });
  };

  forgetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email }: IForegetPassordDto = req.body;
    const user = await userModel.findOne({
      email,
      provider: ProviderEnum.SYSTEM,
      confirmedAt: { $exists: true },
    });
    if (!user) throw new NotFoundException("user Not Found");

    const otp = generateOtp();
    await userModel.updateOne(
      { email },
      {
        forgetPasswordOTP: await generateHash(otp),
        resetPasswordOTPExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        $inc: { __v: 1 },
      },
    );

    emailEvents.emit("forgetPassword", {
      to: email,
      userName: user.userName,
      otp,
    });
    return res.status(200).json({ message: "OTP sent successfully" });
  };

  resetPassword = async (req: Request, res: Response): Promise<Response> => {
    const { email, otp, password }: IresetPassordDto = req.body;

    const user = await userModel.findOne({
      email,
      confirmedAt: { $exists: true },
      forgetPasswordOTP: { $exists: true },
      resetPasswordOTPExpiresAt: { $gt: new Date() },
    });
    if (!user || !user.forgetPasswordOTP)
      throw new NotFoundException("Invalid email or otp");

    if (!(await compareHash(otp, user.forgetPasswordOTP)))
      throw new NotFoundException("Invalid otp");

    await userModel.updateOne(
      { email },
      {
        password: await generateHash(password),
        $unset: { forgetPasswordOTP: true, resetPasswordOTPExpiresAt: true },
        $inc: { __v: 1 },
      },
    );

    return res.status(200).json({ message: "Password reset successfully" });
  };
  socialLogin = async (req: Request, res: Response): Promise<Response> => {
    const { idToken }: ISocialLoginDto = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: env.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload?.email || !payload.email_verified)
      throw new BadRequestException("Google account email is not verified");

    const user = await userModel.findOne({ email: payload.email });

    if (user) {
      if (user.provider !== ProviderEnum.GOOGLE)
        throw new ConflictException(
          "Email already exists with another provider",
        );

      const credentails = createLoginCreadential(user as HUserDocument);
      return res.status(200).json({ message: "Login successful", credentails });
    }

    const [newUser] = await userModel.create([
      {
        userName: payload.name ?? payload.email.split("@")[0]!,
        email: payload.email,
        provider: ProviderEnum.GOOGLE,
        confirmedAt: new Date(),
      },
    ]);

    const credentails = createLoginCreadential(newUser as HUserDocument);
    return res
      .status(201)
      .json({ message: "Account created successfully", credentails });
  };

  logout = async (req: Request, res: Response): Promise<Response> => {
    const decoded = req.decoded;
    if (!decoded) throw new BadRequestException("Invalid token");
    const { id, jti, exp }: ITokenPayload = decoded;

    const ttl = exp - Math.floor(Date.now() / 1000);

    if (ttl > 0) {
      const result = await set({
        Key: revokeTokenKey({ userId: id, jti }),
        Value: jti,
        ttl,
      });

      if (result === undefined || result === null) {
        throw new Error("Failed to revoke token");
      }
    }

    return successResponses({
      res,
      message: "Logout Successfully",
      statusCode: 200,
    });
  };
}

export default new AuthService();
