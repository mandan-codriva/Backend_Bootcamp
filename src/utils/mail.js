
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,

  port: Number(process.env.MAIL_PORT),

  secure: false,

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const sendEmail = async ({
  to,
  subject,
  html,
}) => {
  try {

    const mailOptions = {
      from: process.env.MAIL_FROM,

      to,

      subject,

      html,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent:", info.messageId);

    return info;

  } catch (error) {

    console.error("Mail Error:", error);

    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;

