import z from "zod";
import {
  confirmEmailSchema,
  loginSchema,
  signUpSchema,
  ForgetPasswordSchema,
  resetPasswordSchema,
  socialLoginSchema,
} from "./auth.validation";

export type IsignUpDto = z.infer<typeof signUpSchema.body>;
export type IconfirmEmailDto = z.infer<typeof confirmEmailSchema.body>;
export type IloginDto = z.infer<typeof loginSchema.body>;
export type IForegetPassordDto = z.infer<typeof ForgetPasswordSchema.body>;
export type IresetPassordDto = z.infer<typeof resetPasswordSchema.body>;
export type ISocialLoginDto = z.infer<typeof socialLoginSchema.body>;
