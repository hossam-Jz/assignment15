import { model, Model, Schema, Types } from "mongoose";
import {
  GenderEnum,
  ProviderEnum,
  RoleEnum,
} from "../../Utils/Enums/User.Enum";
import { HydratedDocument } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;

  firstName: string;
  lastName?: string;
  userName?: string;
  email: string;
  password?: string;
  provider: ProviderEnum;
  confirmEmailOTP?: string;
  forgetPasswordOTP?: string;
  resetPasswordOTPExpiresAt?: Date;
  confirmedAt?: Date;
  profilePic?: string;
  phone?: string;
  address?: string;
  gender: GenderEnum;
  role: RoleEnum;
  createdAt: Date;
  updatedAt?: Date;
  changeCredentialsTime?: Date;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },
    lastName: { type: String, maxLength: 25 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: function (this: IUser) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    confirmEmailOTP: { type: String },
    forgetPasswordOTP: { type: String },
    resetPasswordOTPExpiresAt: { type: Date },
    confirmedAt: { type: Date },
    profilePic: { type: String },
    phone: { type: String },
    address: { type: String },

    changeCredentialsTime: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      transform(doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.confirmEmailOTP;
        delete ret.forgetPasswordOTP;
        delete ret.resetPasswordOTPExpiresAt;
        return ret;
      },
    },
  },
);

userSchema
  .virtual("userName")
  .set(function (value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.set({
      firstName,
      lastName: rest.join(" "),
    });
  })
  .get(function (this: IUser) {
    return `${this.firstName} ${this.lastName ?? ""}`.trim();
  });

export const userModel: Model<IUser> = model<IUser>("User", userSchema);

export type HUserDocument = HydratedDocument<IUser>;
