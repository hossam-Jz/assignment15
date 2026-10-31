import { JwtPayload, sign, SignOptions, verify } from "jsonwebtoken";
import { HUserDocument } from "../../DB/Modles/User.Model";
import { RoleEnum, signatureEnum } from "../Enums/User.Enum";
import { env } from "../../config/config.service";
import { randomUUID } from "node:crypto";

export interface ITokenPayload extends JwtPayload {
  _id: string;
  jti: string;
  iat: number;
  exp: number;
}
// Generate Token
export const generateToken = ({
  payload,
  secretKey,
  option,
}: {
  payload: object;
  secretKey: string;
  option: SignOptions;
}): string => {
  return sign(payload, secretKey, option);
};

// Verify Token
export const verifyToken = ({
  token,
  secretKey,
}: {
  token: string;
  secretKey: string;
}): ITokenPayload => {
  const decoded = verify(token, secretKey);

  if (typeof decoded === "string" || !decoded._id || !decoded.jti) {
    throw new Error("Invalid token payload");
  }

  return decoded as ITokenPayload;
};

interface ISignature {
  accessSignature: string;
  refreshSignature: string;
}

interface IGetSignature {
  signatureLevel?: signatureEnum;
}

export const getSignature = ({
  signatureLevel = signatureEnum.USER,
}: IGetSignature = {}): ISignature => {
  let signature: ISignature;

  switch (signatureLevel) {
    case signatureEnum.ADMIN:
      signature = {
        accessSignature: env.ACCESS_ADMIN_SIGNATURE,
        refreshSignature: env.REFRESH_ADMIN_SIGNATURE,
      };
      break;

    case signatureEnum.USER:
    default:
      signature = {
        accessSignature: env.ACCESS_USER_SIGNATURE,
        refreshSignature: env.REFRESH_USER_SIGNATURE,
      };
      break;
  }

  return signature;
};

export const createLoginCreadential = (
  user: HUserDocument,
): { accessToken: string; refreshToken: string } => {
  const isAdmin = user.role === RoleEnum.ADMIN;

  const accessSecret = isAdmin
    ? env.ACCESS_ADMIN_SIGNATURE
    : env.ACCESS_USER_SIGNATURE;

  const refreshSecret = isAdmin
    ? env.REFRESH_ADMIN_SIGNATURE
    : env.REFRESH_USER_SIGNATURE;

  const accessToken = generateToken({
    payload: { _id: user._id },
    secretKey: accessSecret,
    option: {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
      jwtid: randomUUID(),
    },
  });

  const refreshToken = generateToken({
    payload: { _id: user.id },
    secretKey: refreshSecret,
    option: {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
      jwtid: randomUUID(),
    },
  });

  return { accessToken, refreshToken };
};
