import { Resend } from 'resend';
import { emailTemplates } from './templates';

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@ratemyaccom.com';
const APP_NAME = 'RateMyAccom';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend or log to console in development
 */
async function sendEmail({ to, subject, html, text }: SendEmailOptions): Promise<void> {
  // In development or when RESEND_API_KEY is not set, log to console
  if (!resend || process.env.NODE_ENV === 'development') {
    console.log('\n=== Email (Development Mode) ===');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('HTML Preview:', html.substring(0, 200) + '...');
    if (text) {
      console.log('Text:', text);
    }
    console.log('================================\n');
    return;
  }

  try {
    const emailData: { from: string; to: string; subject: string; html: string; text?: string } = {
      from: FROM_EMAIL,
      to,
      subject,
      html,
    };

    if (text) {
      emailData.text = text;
    }

    await resend.emails.send(emailData);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  email: string,
  verificationToken: string
): Promise<void> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/verify?token=${verificationToken}`;

  const html = emailTemplates.verification({
    verificationUrl,
    appName: APP_NAME,
  });

  await sendEmail({
    to: email,
    subject: `Verify your ${APP_NAME} account`,
    html,
    text: `Welcome to ${APP_NAME}! Please verify your email by clicking this link: ${verificationUrl}`,
  });
}

/**
 * Send password reset email to user
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`;

  const html = emailTemplates.passwordReset({
    resetUrl,
    appName: APP_NAME,
  });

  await sendEmail({
    to: email,
    subject: `Reset your ${APP_NAME} password`,
    html,
    text: `Reset your password by clicking this link: ${resetUrl}. This link will expire in 1 hour.`,
  });
}

/**
 * Send welcome email after email verification
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const html = emailTemplates.welcome({
    name,
    appName: APP_NAME,
    loginUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
  });

  await sendEmail({
    to: email,
    subject: `Welcome to ${APP_NAME}!`,
    html,
    text: `Welcome to ${APP_NAME}, ${name}! Your account has been verified successfully.`,
  });
}

/**
 * Send email when password is changed
 */
export async function sendPasswordChangedEmail(email: string): Promise<void> {
  const html = emailTemplates.passwordChanged({
    appName: APP_NAME,
    supportUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/support`,
  });

  await sendEmail({
    to: email,
    subject: `Your ${APP_NAME} password was changed`,
    html,
    text: `Your password was successfully changed. If you didn't make this change, please contact support immediately.`,
  });
}

/**
 * Send OTP code for email sign-in
 */
export async function sendOtpEmail(email: string, name: string, otpCode: string): Promise<void> {
  const html = emailTemplates.otpLogin({
    name,
    appName: APP_NAME,
    otpCode,
    expiryMinutes: 10,
  });

  await sendEmail({
    to: email,
    subject: `${otpCode} is your ${APP_NAME} login code`,
    html,
    text: `Hi ${name}, your ${APP_NAME} login code is: ${otpCode}. This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`,
  });
}

/**
 * Send email when account is locked due to failed login attempts
 * KAN-24: Account Lockout
 */
export async function sendAccountLockedEmail(
  email: string,
  name: string,
  lockedUntil: Date
): Promise<void> {
  const unlockTime = lockedUntil.toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const remainingMinutes = Math.ceil((lockedUntil.getTime() - Date.now()) / (1000 * 60));

  const html = emailTemplates.accountLocked({
    name,
    appName: APP_NAME,
    unlockTime,
    remainingMinutes,
    supportUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/support`,
  });

  await sendEmail({
    to: email,
    subject: `${APP_NAME} account locked due to failed login attempts`,
    html,
    text: `Hi ${name}, your ${APP_NAME} account has been temporarily locked due to multiple failed login attempts. You can try logging in again at ${unlockTime}. If you didn't attempt to log in, please contact our support team immediately.`,
  });
}
