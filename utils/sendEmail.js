import nodemailer from "nodemailer";

let transporter;
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          }
        : {
            service: "gmail",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          }
    );
  }
  return transporter;
};

export const sendEmail = async (to, subject, html) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP_USER / SMTP_PASS not set – email not sent:", subject);
    return null;
  }
  return getTransporter().sendMail({
    from: `"${process.env.MAIL_FROM_NAME || "Holy Vision International"}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};
