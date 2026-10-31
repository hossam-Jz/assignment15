import { createClient } from "redis";
import { env } from "../../config/config.service";
import chalk from "chalk";

export const redisClient = createClient({
  url: env.REDIS_URL,
});

export const redisConnection = async (): Promise<void> => {
  try {
    await redisClient.connect();

    console.log(chalk.blue("Redis Connected Successfully"));
  } catch (error: unknown) {
    console.error("Redis connection error:", error);
  }
};
