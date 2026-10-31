import { z } from "zod";
import { GenderEnum, RoleEnum } from "../../Utils/Enums/User.Enum";

export const loginSchema = {
  body: z.strictObject({
    email: z.email(),
    password: z
      .string()
      .min(8, { error: "Password must be at least 8 characters long" })
      .max(64, { error: "Password must be at most 64 characters long" }),
  }),
};

export const confirmEmailSchema = {
  body: z.strictObject({
    email: z.email(),
    otp: z.string().regex(/^\d{6}$/, {
      error: "OTP must be a 6-digit number",
    }),
  }),
};

export const ForgetPasswordSchema = {
  body: z.strictObject({
    email: z.email(),
  }),
};
export const resetPasswordSchema = {
  body: loginSchema.body
    .extend({
      otp: z.string().regex(/^\d{6}$/, {
        error: "OTP must be a 6-digit number",
      }),
      confirmPassword: z
        .string({ error: "confirm password is required" })
        .min(8, {
          error: "confirm password must be at least 8 characters long",
        })
        .max(64, {
          error: "confirm password must be at most 64 characters long",
        }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }),
};
export const signUpSchema = {
  body: loginSchema.body
    .extend({
      userName: z
        .string({ error: "User name is required" })
        .min(3, { error: "User name must be at least 3 characters long" })
        .max(25, { error: "User name must be at most 25 characters long" }),
      confirmPassword: z
        .string({ error: "confirm password is required" })
        .min(8, {
          error: "confirm password must be at least 8 characters long",
        })
        .max(64, {
          error: "confirm password must be at most 64 characters long",
        }),
    })
    .superRefine((data, ctx) => {
      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords do not match",
          path: ["confirmPassword"],
        });
      }
    }),
};
export const socialLoginSchema = {
  body: z.strictObject({
    idToken: z.string({ error: "idToken is required" }).min(1),
  }),
};
