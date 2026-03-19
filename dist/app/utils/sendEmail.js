import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
export const sendEmail = async (to, subject, templateName, data) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
    // load template
    const templatePath = path.join(process.cwd(), "src/app/templates", `${templateName}.ejs`);
    const html = (await ejs.renderFile(templatePath, data));
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};
//# sourceMappingURL=sendEmail.js.map