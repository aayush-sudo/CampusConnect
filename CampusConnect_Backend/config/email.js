import nodemailer from 'nodemailer';
import axios from 'axios';
import sgMail from '@sendgrid/mail';

// Helper to create transporter at runtime so it reads the current environment
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 2525,
    auth: {
      user: process.env.SMTP_USER || "your_mailtrap_user",
      pass: process.env.SMTP_PASS || "your_mailtrap_password"
    }
  });
};

// Sends reset email either via SendGrid, SMTP (nodemailer) or EmailJS (server-side proxy to EmailJS API)
export const sendResetPasswordEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://campus-connect-theta-ruddy.vercel.app'}/reset-password/${resetToken}`;

  // SendGrid provider
  if ((process.env.EMAIL_PROVIDER || '').toLowerCase() === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@campusconnect.com';

    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is missing from environment');
    }

    sgMail.setApiKey(apiKey);

    const msg = {
      to: email,
      from,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    };

    try {
      const response = await sgMail.send(msg);
      console.log('SendGrid response:', response[0].statusCode);
      return;
    } catch (err) {
      console.error('SendGrid send error:', err.response?.body?.errors || err.message || err);
      throw new Error('Failed to send reset email: ' + (err.response?.body?.errors?.[0]?.message || err.message));
    }
  }

  if ((process.env.EMAIL_PROVIDER || '').toLowerCase() === 'emailjs') {
    // Send via EmailJS REST API from the server to avoid exposing any integration details in the client bundle
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const userId = process.env.EMAILJS_USER_ID; // EmailJS user/public id

    if (!serviceId || !templateId || !userId) {
      throw new Error('EmailJS is configured as provider but EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID or EMAILJS_USER_ID is missing');
    }

    const body = {
      service_id: serviceId,
      template_id: templateId,
      user_id: userId,
      template_params: {
        to_email: email,
        reset_url: resetUrl
      }
    };

    try {
      const response = await axios.post('https://api.emailjs.com/api/v1.0/email/send', body, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.status < 200 || response.status >= 300) {
        throw new Error(`EmailJS send failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      // Provide helpful error message and rethrow so caller can handle/log
      console.error('EmailJS send error:', err.response?.data || err.message || err);
      throw err;
    }

    return;
  }

  // Default: use nodemailer SMTP transport
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested to reset your password. Click the link below to reset it:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  };

  const transporter = createTransporter();
  await transporter.sendMail(mailOptions);
};

export default {
  sendResetPasswordEmail
};