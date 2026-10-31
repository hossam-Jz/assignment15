import { redisClient } from "./redis.model";

// Interfaces
interface IRevokeTokenKey {
  userId: string;
}

interface IRevokeToken {
  userId: string;
  jti: string;
}

interface ISet {
  Key: string;
  Value: unknown;
  ttl?: number | null;
}

interface IGet {
  Key: string;
}

interface IDel {
  Key: string;
}

interface IExpire {
  Key: string;
  ttl: number;
}

interface ITtl {
  Key: string;
}

interface IKeys {
  pattern: string;
}

// Generate Keys
export const revokeTokenKeyPrefix = ({ userId }: IRevokeTokenKey): string => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }: IRevokeToken): string => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

// Set
export const set = async ({
  Key,
  Value,
  ttl = null,
}: ISet): Promise<string | null | undefined> => {
  try {
    const data = typeof Value !== "string" ? JSON.stringify(Value) : Value;

    if (data === undefined) {
      throw new Error("Invalid Redis value");
    }

    if (ttl !== null && ttl > 0) {
      return await redisClient.set(Key, data, {
        EX: ttl,
      });
    }

    return await redisClient.set(Key, data);
  } catch (error: unknown) {
    console.error("Redis Set Error:", error);
    return undefined;
  }
};

// Get
export const get = async ({
  Key,
}: IGet): Promise<string | null | undefined> => {
  try {
    return await redisClient.get(Key);
  } catch (error: unknown) {
    console.error("Redis Get Error:", error);
    return undefined;
  }
};

// Update
export const update = async ({
  Key,
  Value,
  ttl = null,
}: ISet): Promise<string | null | boolean | undefined> => {
  try {
    const isExists = await redisClient.exists(Key);

    if (!isExists) return false;

    const data = typeof Value !== "string" ? JSON.stringify(Value) : Value;

    if (data === undefined) {
      throw new Error("Invalid Redis value");
    }

    if (ttl !== null && ttl > 0) {
      return await redisClient.set(Key, data, {
        EX: ttl,
      });
    }

    return await redisClient.set(Key, data);
  } catch (error: unknown) {
    console.error("Redis Update Error:", error);
    return undefined;
  }
};

// Delete
export const del = async ({ Key }: IDel): Promise<number | undefined> => {
  try {
    return await redisClient.del(Key);
  } catch (error: unknown) {
    console.error("Redis Delete Error:", error);
    return undefined;
  }
};

// Expire
export const expire = async ({
  Key,
  ttl,
}: IExpire): Promise<number | undefined> => {
  try {
    return await redisClient.expire(Key, ttl);
  } catch (error: unknown) {
    console.error("Redis Expire Error:", error);
    return undefined;
  }
};

// TTL
export const ttl = async ({ Key }: ITtl): Promise<number | undefined> => {
  try {
    return await redisClient.ttl(Key);
  } catch (error: unknown) {
    console.error("Redis TTL Error:", error);
    return undefined;
  }
};

// Keys
export const Keys = async ({
  pattern,
}: IKeys): Promise<string[] | undefined> => {
  try {
    return await redisClient.keys(pattern);
  } catch (error: unknown) {
    console.error("Redis Keys Error:", error);
    return undefined;
  }
};
