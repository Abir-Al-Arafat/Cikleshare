import fs from "fs";
import path from "path";
import ejs from "ejs";
import { IEmailAttachment, IEmailTemplate } from "../interfaces/IEmailData";

const logoAttachment: IEmailAttachment = {
  filename: "logo.png",
  path: path.resolve(__dirname, "../assets/logo.png"),
  cid: "logo",
};

const logoPath = path.resolve(__dirname, "../assets/logo.png");
try {
  fs.readFileSync(logoPath);
  console.log("Logo file is readable:", logoPath);
} catch (err) {
  console.error("Logo file is NOT readable:", logoPath, err);
}

const signupEmail = (
  recipientName: string | undefined,
  code: Number,
  recipientEmail: string
): IEmailTemplate => ({
  email: recipientEmail,
  subject: "Account Activation Email",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background: #fff; color: #222;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2>Dear ${recipientName || "User"},</h2>
        <p>Please enter this two-factor authentication code on the site:</p>
        <div style="font-size: 2em; font-weight: bold; margin: 20px 0; color: #4CAF50;">${code}</div>
        <br/>
        <p>Best regards,<br/>
        <strong>The Cikleshare Team</strong></p>
        <p style="font-size: 1.1em; color: #888;">Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const contactUsPatientEmail = (
  recipientName: string | undefined,
  recipientEmail: string
): IEmailTemplate => ({
  email: recipientEmail,
  subject: "Thank You for Contacting Cikleshare",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background: #fff; color: #222;">
        <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2>Dear ${recipientName || "User"},</h2>
        <p>Thank you for contacting Cikleshare. One of our team members will respond to your query within 72 hours.</p>
        <br/>
             <p>Best regards,<br/>
             <strong>The Cikleshare Team</strong></p>
             <p><a href="mailto:support@cikleshare.com">support@cikleshare.com</a></p>
        <p style="font-size: 1.1em; color: #888;">Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const contactUsClinicEmail = (
  name: string,
  email: string,
  message: string
): IEmailTemplate => ({
  email: email,
  subject: `New Contact Us Query from ${name}`,
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background: #fff; color: #222;">
        <div style="text-align: center; margin-bottom: 30px;">
                <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2>New Contact Us Query</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const paymentConfirmationEmail = (
  patientName: string,
  recipientEmail: string,
  dateTime: string
): IEmailTemplate => ({
  email: recipientEmail,
  subject: "Payment processed successfully",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; color: #222; background: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <p>Dear <strong>${patientName}</strong>,</p>
        <p>Your booking with one of our doctors has been made at <strong>${dateTime}</strong>.</p>
        <p>A video link will be e-mailed to you in a separate e-mail. You will need this to access your appointment. Your video link is also accessible through your personalised patient portal. Once you log into your patient portal, you can also review all your previous consultations and medical notes.</p>
        <p>For any amendments to your booking, please reply to this e-mail.</p>
        <br />
        <p>The Cikleshare Team</p>
        <p style="font-style: italic; color: #007BFF;">Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const paymentAdminNotificationEmail = (
  patientName: string,
  dateTime: string
): IEmailTemplate => ({
  email: "info@cikleshare.com",
  subject: "New Booking & Payment Confirmation",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; color: #222; background: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2 style="color: #007BFF;">New Appointment Booked & Paid</h2>
        <p>A new appointment has been booked and payment has been confirmed.</p>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Date & Time:</strong> ${dateTime}</p>
        <p>Please log in to the admin portal to view the details and manage the booking. You also have a new notification on the website.</p>
        <br />
        <p>Best regards,</p>
        <p><strong>Cikleshare System</strong></p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const twoFactorAuthEmail = (
  recipientName: string | undefined,
  code: string,
  recipientEmail: string
): IEmailTemplate => ({
  email: recipientEmail,
  subject: "Two-Factor Authentication Code",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background: #fff; color: #222;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2>Dear ${recipientName || "User"},</h2>
        <p>Your two-factor authentication code is:</p>
        <div style="font-size: 2em; font-weight: bold; margin: 20px 0; color: #4CAF50;">${code}</div>
        <p>This code is valid for a short time. Please enter it to continue.</p>
        <br/>
        <p>Best regards,<br/>
        <strong>The Cikleshare Team</strong></p>
        <p style="font-size: 1.1em; color: #888;">Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

const recoverPasswordEmail = async (
  recipientName: string | undefined | null,
  code: string,
  recipientEmail: string
): Promise<IEmailTemplate> => {
  const templatePath = path.resolve(__dirname, "./recoverPassword.ejs");
  const html = await ejs.renderFile(templatePath, {
    recipientName,
    code,
  });

  return {
    email: recipientEmail,
    subject: "Password Reset Verification Code",
    html: html,
    attachments: [logoAttachment],
  };
};

const verifyEmailTemplate = (
  recipientName: string | undefined,
  code: string,
  recipientEmail: string
): IEmailTemplate => ({
  email: recipientEmail,
  subject: "Email Verification Code",
  html: `
    <html>
      <body style="font-family: Arial, sans-serif; background: #fff; color: #222;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="cid:logo" alt="Cikleshare Logo" style="width: 220px; margin-bottom: 10px;" />
        </div>
        <h2>Dear ${recipientName || "User"},</h2>
        <p>Please use the following verification code to verify your email address:</p>
        <div style="font-size: 2em; font-weight: bold; margin: 20px 0; color: #4CAF50;">${code}</div>

        <br/>
        <p>Best regards,<br/>
        <strong>The Cikleshare Team</strong></p>
        <p style="font-size: 1.1em; color: #888;">Your global health companion, connecting communities worldwide. Switch between countries instantly and access health guides, communities, wellness tracking, and trusted resources.</p>
      </body>
    </html>
  `,
  attachments: [logoAttachment],
});

export {
  signupEmail,
  logoAttachment,
  contactUsPatientEmail,
  contactUsClinicEmail,
  paymentConfirmationEmail,
  paymentAdminNotificationEmail,
  twoFactorAuthEmail,
  recoverPasswordEmail,
  verifyEmailTemplate,
};
