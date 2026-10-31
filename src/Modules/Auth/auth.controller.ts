import authService from "./auth.service";
import * as validators from "./auth.validation";
import { validation } from "../../Middlewares/Validation.middleware";

import { Router } from "express";
import { authentication } from "../../Middlewares/authenticaction.middleware";
import { tokenTypeEnum } from "../../Utils/Enums/User.Enum";

const router = Router();

router.post("/signup", validation(validators.signUpSchema), authService.signUp);

router.patch(
  "/confirm-email",
  validation(validators.confirmEmailSchema),
  authService.confirmEmail,
);
router.post("/login", validation(validators.loginSchema), authService.login);
router.patch(
  "/forget-Password",
  validation(validators.ForgetPasswordSchema),
  authService.forgetPassword,
);
router.patch(
  "/reset-Password",
  validation(validators.resetPasswordSchema),
  authService.resetPassword,
);
router.post(
  "/social-login",
  validation(validators.socialLoginSchema),
  authService.socialLogin,
);
router.post(
  "/logout",
  authentication({
    tokenType: tokenTypeEnum.ACCESS,
  }),
  authService.logout
);
export default router;
