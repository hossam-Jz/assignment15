import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/config.service";
import { corsOption } from "./Utils/Cors/Cors";
import { limiter } from "./Middlewares/RateLimiter.middleware";
import {
  globalErrorHandler,
  NotFoundException,
} from "./Utils/Response/Error.Response";
import { authController,userController } from "./Modules/index";
import connectDB from "./DB/Modles/connection";
import { HUserDocument, IUser, userModel } from "./DB/Modles/User.Model";
import { emailEvents } from "./Utils/events/email.events";
import { redisConnection } from "./DB/Modles/redis.model";

export const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  app.use(helmet());
  app.use(cors(corsOption));
  app.use(express.json());
  app.use(limiter);
  await connectDB();
  await redisConnection();
  // const user: HUserDocument = await new userModel({
  //   userName: "ali ali",
  //   email: "ali@gmail.com",
  //   password: "123456789",
  //   confirmPassword: "123456789",
  // });
  // user.save();

  app.use("/api/auth", authController);
  app.use("/api/user",userController)
  app.use((_req: Request, _res: Response) => {
    throw new NotFoundException("Route not found");
  });
  app.use(globalErrorHandler);
  app.listen(env.PORT, () => {
    console.log(`server is Running on http://localhost:${env.PORT}`);
  });
};
