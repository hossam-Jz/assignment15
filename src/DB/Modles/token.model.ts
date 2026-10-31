import mongoose, { Schema, Types, model } from "mongoose";

interface IToken {
  jti: string;
  userId: Types.ObjectId;
  expiresIn: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresIn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const tokenModel = model<IToken>("Token", tokenSchema);

export default tokenModel;
