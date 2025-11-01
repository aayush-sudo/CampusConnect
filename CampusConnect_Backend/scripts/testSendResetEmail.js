import dotenv from 'dotenv';
import crypto from 'crypto';

// Load .env from current working directory (backend folder)
dotenv.config();

import { sendResetPasswordEmail } from '../config/email.js';

const run = async () => {
  const to = 'aayush.hardas@gmail.com';
  const token = crypto.randomBytes(32).toString('hex');

  console.log('Using EMAIL_PROVIDER =', process.env.EMAIL_PROVIDER);
  console.log('EMAILJS_SERVICE_ID =', process.env.EMAILJS_SERVICE_ID ? 'SET' : 'MISSING');
  console.log('EMAILJS_TEMPLATE_ID =', process.env.EMAILJS_TEMPLATE_ID ? 'SET' : 'MISSING');
  console.log('EMAILJS_USER_ID =', process.env.EMAILJS_USER_ID ? 'SET' : 'MISSING');
  console.log('FRONTEND_URL =', process.env.FRONTEND_URL);

  try {
    await sendResetPasswordEmail(to, token);
    console.log('Test email sent (no error thrown). Check recipient inbox.');
  } catch (err) {
    console.error('Test send failed:', err?.response?.data || err.message || err);
    process.exitCode = 1;
  }
};

run();
