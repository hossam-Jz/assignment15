
// Modules/User/user.service.ts
import { Request, Response } from "express";
import { decrypt } from "../../Utils/Security/encryption";
import { UnauthorizedException } from "../../Utils/Response/Error.Response";
import { successResponses } from "../../Utils/Response/success.Response";

export class UserService {
  getProfile = async (req: Request, res: Response): Promise<Response> => {
    if (!req.user) throw new UnauthorizedException("Invalid token");

    // plain object: applies the schema's toJSON transform (no password / OTP fields)
    const user = req.user.toJSON();
    if (user.phone) user.phone = decrypt(user.phone);

    return successResponses({ res, message: "Welcome", data: { user } });
  };
}

export default new UserService();