import { EventEmitter } from "node:events";
import { Mail } from "nodemailer";
import { template } from "../email/verify.email.template";
import { sendEmail } from "../email/email.send";

export const emailEvents = new EventEmitter();

interface IEmail extends Mail.Options {
  otp: string;
  userName: string;
}

emailEvents.on("confirmEmail", async (data: IEmail) => {
  try {
    data.subject = "Confirm Your Email";
    data.html = template(data.otp, data.userName, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.error("Failed to send email", error);
  }
});
emailEvents.on("forgetPassword", async (data: IEmail) => {
  try {
    data.subject = "reset Your Password";
    data.html = template(data.otp, data.userName, data.subject);
    await sendEmail(data);
  } catch (error) {
    console.error("Failed to send email", error);
  }
});
