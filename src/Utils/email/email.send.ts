import { createTransport, Mail } from "nodemailer";
import { BadRequestException } from "../Response/Error.Response";
import { env } from "../../config/config.service";

export const sendEmail = async (data: Mail.Options): Promise<void> => {
  if (!data.html && !data.text && !data.attachments) {
    throw new BadRequestException(
      "Email must have either html or text or attachments",
    );
  }

  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: env.EMAIL_USERNAME,
      pass: env.EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    ...data,
    from: `"Route Academy" <${env.EMAIL_USERNAME}>`,
  });
};
