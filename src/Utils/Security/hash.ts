import { compare, hash } from "bcrypt";
import { env } from "../../config/config.service";

export const generateHash = async (
  plainText: string,
  saltRounds: number = env.SALT,
): Promise<string> => {
  return await hash(plainText, saltRounds);
};

export const compareHash = async (
  plainText: string,
  hashValue: string,
): Promise<boolean> => {
  return await compare(plainText, hashValue);
};
