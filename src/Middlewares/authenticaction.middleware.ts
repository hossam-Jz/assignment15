import { NextFunction, Request, Response } from "express";
import { userModel, HUserDocument } from "../DB/Modles/User.Model";
// import { tokenModel } from "../DB/Modles/Token.Model";
import {
  RoleEnum,
  signatureEnum,
  tokenTypeEnum,
} from "../Utils/Enums/User.Enum";
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from "../Utils/Response/Error.Response";
import {
  getSignature,
  verifyToken,
  ITokenPayload,
} from "../Utils/Security/token";
import { get, revokeTokenKey } from "../DB/Modles/redis.servce";

declare global {
  namespace Express {
    interface Request {
      user?: HUserDocument;
      decoded?: ITokenPayload;
    }
  }
}

export const decodedToken = async ({
  authorization,
  tokenType = tokenTypeEnum.ACCESS,
}: {
  authorization?: string | undefined;
  tokenType?: tokenTypeEnum;
}): Promise<{ user: HUserDocument; decoded: ITokenPayload }> => {
  if (!authorization)
    throw new UnauthorizedException("Missing authorization header");

  const [Bearer, token] = authorization.split(" ");
  if (!Bearer || !token)
    throw new BadRequestException("Invalid authorization format");

  const signatureLevel =
    Bearer === "ADMIN"
      ? signatureEnum.ADMIN
      : Bearer === "USER"
        ? signatureEnum.USER
        : undefined;
  if (signatureLevel === undefined)
    throw new BadRequestException("Invalid authorization prefix");

  const signature = getSignature({ signatureLevel });
  const decoded = verifyToken({
    token,
    secretKey:
      tokenType === tokenTypeEnum.ACCESS
        ? signature.accessSignature
        : signature.refreshSignature,
  });

  if (signatureLevel === undefined) {
    throw new BadRequestException("Invalid authorization Bearer");
  }
  const isRevoked = await get({
    Key: revokeTokenKey({
      userId: decoded.id,
      jti: decoded.jti,
    }),
  });

  if (isRevoked === undefined) {
    throw new BadRequestException("Redis unavailable");
  }

  if (isRevoked !== null) {
    throw new UnauthorizedException("Token is revoked");
  }


  // same message for "no user" and "bad token": don't reveal which one failed
  const user = await userModel.findById(decoded._id);
  if (!user) throw new UnauthorizedException("Invalid token");

  // credentials changed after this token was issued (password reset, logout-all)
  const changedAt = user.changeCredentialsTime
    ? Math.floor(user.changeCredentialsTime.getTime() / 1000)
    : 0;

  if (changedAt > decoded.iat) {
    throw new UnauthorizedException("Invalid token");
  }

  return { user, decoded };
};

export const authentication = ({
  tokenType = tokenTypeEnum.ACCESS,
}: {
  tokenType?: tokenTypeEnum;
} = {}) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { user, decoded } = await decodedToken({
        authorization: req.headers.authorization,
        tokenType,
      });

      req.user = user;
      req.decoded = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};

interface IAuthorization {
  accessRole?: RoleEnum[];
}

export const authorization = ({ accessRole = [] }: IAuthorization = {}) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedException("User is not authenticated"));
    }

    if (!accessRole.includes(req.user.role)) {
      return next(new ForbiddenException("Unauthorized"));
    }

    next();
  };
};
