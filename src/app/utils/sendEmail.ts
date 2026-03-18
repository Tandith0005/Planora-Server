import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: any
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // load template
  const templatePath = path.join(
    process.cwd(),
    "src/app/templates",
    `${templateName}.ejs`
  );

  const html = (await ejs.renderFile(templatePath, data)) as string;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};