// const dotenv = require("dotenv");
// const nodemailer = require("nodemailer");

// dotenv.config();

import nodemailer from "nodemailer";

// Brevo SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 2525, // Use 587 for TLS
  secure: false, // `false` for TLS (port 587)
  auth: {
    user: process.env.BREVO_SMTP_USER, // Your Brevo SMTP login email
    pass: process.env.BREVO_SMTP_KEY, // Your Brevo SMTP password/key
  },
});

// Function to send an email
const sendEmail = async (email:string, subject:string, html:string) => {
  try {

    const info = await transporter.sendMail({
      from: `"SOUNDMAC" <noreply@soundmac.co>`, // Must be verified in Brevo
      to: email,
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", info.messageId);
    return info.messageId;
  } catch (error) {
    console.error("Brevo Error:", error);
    return null;
  }
};

export default sendEmail;