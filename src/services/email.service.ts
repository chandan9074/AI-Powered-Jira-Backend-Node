import nodemailer from 'nodemailer';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // Replace with your SMTP credentials (e.g., Mailtrap or Brevo for testing)
    host: process.env.SMTP_HOST || 'sandbox.smtp.mailtrap.io',
    port: Number(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || '452b3d7771c8d8',
      pass: process.env.SMTP_PASS || '593c38ad52d656',
    },
  });

  static async sendEmail(
    to: string,
    subject: string,
    html: string,
    from = '"Jira Clone Admin" <noreply@jiraclone.com>'
  ) {
    const mailOptions = { from, to, subject, html };
    await this.transporter.sendMail(mailOptions);
  }

  static async sendOtpEmail(
    to: string,
    otp: string,
    options?: { subject?: string; title?: string; expiresInMinutes?: number; from?: string }
  ) {
    const subject = options?.subject || 'Your Registration OTP';
    const title = options?.title || 'Welcome to Jira Clone!';
    const expires = options?.expiresInMinutes ?? 10;
    const from = options?.from;

    const html = `
      <h2>${title}</h2>
      <p>Your One-Time Password (OTP) is:</p>
      <h1 style="letter-spacing: 5px; color: #0052CC;">${otp}</h1>
      <p>This code will expire in ${expires} minutes.</p>
    `;

    await this.sendEmail(to, subject, html, from);
  }
}