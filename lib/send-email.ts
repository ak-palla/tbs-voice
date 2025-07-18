import nodemailer from 'nodemailer';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: parseInt(process.env.SMTP_PORT || '587', 10) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
};

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    console.error('SMTP configuration is missing. Email not sent.');
    // In a real app, you might want to throw an error or handle this differently
    return { success: false, error: 'SMTP configuration is missing.' };
  }

  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    await transporter.verify();
    console.log('SMTP server is ready to take our messages');
  } catch (error) {
    console.error('Error verifying SMTP server:', error);
    return { success: false, error: 'Error verifying SMTP server.' };
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: 'Failed to send email.' };
  }
} 