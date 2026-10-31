// Modules/User/user.controller.ts
import { Router } from "express";
import UserService from "./user.servce";
import {
  authentication,
  authorization,
} from "../../Middlewares/authenticaction.middleware";
import { RoleEnum, tokenTypeEnum } from "../../Utils/Enums/User.Enum";

const router = Router();

router.post(
  "/profile",
  authentication({ tokenType: tokenTypeEnum.ACCESS }),
  authorization(
    { accessRole: [RoleEnum.USER, RoleEnum.ADMIN] },
   
  ), UserService.getProfile,
);

export default router;
