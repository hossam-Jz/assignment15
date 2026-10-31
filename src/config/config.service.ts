import { resolve } from "node:path";
import { config } from "dotenv";

config({ path: resolve("./config/dev.env") });

export const env = {
  PORT: Number(process.env.PORT) || 7000,
  MODE: process.env.MODE || "DEVELOPMENT",
  MONGO_URI: process.env.MONGO_URI as string,
  APPLICATION_NAME: process.env.APPLICATION_NAME || "SOCIAL_MEDIA",
  SALT: Number(process.env.SALT) || 12,
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME as string,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD as string,
  ACCESS_USER_SIGNATURE: process.env.ACCESS_USER_SIGNATURE as string,
  ACCESS_ADMIN_SIGNATURE: process.env.ACCESS_ADMIN_SIGNATURE as string,
  REFRESH_USER_SIGNATURE: process.env.REFRESH_USER_SIGNATURE as string,
  REFRESH_ADMIN_SIGNATURE: process.env.REFRESH_ADMIN_SIGNATURE as string,
  ACCESS_TOKEN_EXPIRES_IN: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
  REFRESH_TOKEN_EXPIRES_IN: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
  ENCRYPTION_SECRET_KEY: process.env.ENCRYPTION_SECRET_KEY as string,
  WHITE_LIST: process.env.WHITE_LIST as string,
  CLIENT_ID: process.env.CLIENT_ID as string,
  REDIS_URL:process.env.REDIS_URL as string
};

export type ENV = typeof env;
