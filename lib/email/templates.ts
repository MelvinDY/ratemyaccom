/**
 * Email templates for various user communications
 */

interface VerificationEmailProps {
  verificationUrl: string;
  appName: string;
}

interface PasswordResetEmailProps {
  resetUrl: string;
  appName: string;
}

interface WelcomeEmailProps {
  name: string;
  appName: string;
  loginUrl: string;
}

interface PasswordChangedEmailProps {
  appName: string;
  supportUrl: string;
}

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  .container {
    background-color: #ffffff;
    border-radius: 8px;
    padding: 40px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  .header {
    text-align: center;
    margin-bottom: 30px;
  }
  .logo {
    font-size: 28px;
    font-weight: bold;
    color: #8B5CF6;
    margin-bottom: 10px;
  }
  .button {
    display: inline-block;
    padding: 14px 28px;
    background-color: #8B5CF6;
    color: #ffffff;
    text-decoration: none;
    border-radius: 6px;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background-color: #7C3AED;
  }
  .footer {
    text-align: center;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
    color: #6b7280;
    font-size: 14px;
  }
  .warning {
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 12px;
    margin: 20px 0;
    border-radius: 4px;
  }
`;

function verification({ verificationUrl, appName }: VerificationEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${appName}</div>
            <h1>Verify Your Email Address</h1>
          </div>

          <p>Thanks for signing up for ${appName}! We're excited to have you on board.</p>

          <p>To complete your registration and start reviewing accommodations, please verify your email address by clicking the button below:</p>

          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify Email Address</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${verificationUrl}</p>

          <div class="warning">
            <strong>⚠️ Security Note:</strong> This link will expire in 24 hours. If you didn't create an account with ${appName}, you can safely ignore this email.
          </div>

          <div class="footer">
            <p>This email was sent by ${appName}</p>
            <p>If you have any questions, please contact our support team.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function passwordReset({ resetUrl, appName }: PasswordResetEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${appName}</div>
            <h1>Reset Your Password</h1>
          </div>

          <p>We received a request to reset your password for your ${appName} account.</p>

          <p>Click the button below to choose a new password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>

          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>

          <div class="warning">
            <strong>⚠️ Security Note:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
          </div>

          <div class="footer">
            <p>This email was sent by ${appName}</p>
            <p>For security reasons, we cannot reset your password for you. You must click the link above to set a new password.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function welcome({ name, appName, loginUrl }: WelcomeEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${appName}!</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${appName}</div>
            <h1>Welcome aboard, ${name}! 🎉</h1>
          </div>

          <p>Your email has been verified successfully! You now have full access to all ${appName} features.</p>

          <h2>What you can do now:</h2>
          <ul>
            <li>Browse and search thousands of student accommodations</li>
            <li>Read and write honest reviews</li>
            <li>Compare amenities and prices</li>
            <li>Save your favorite properties</li>
            <li>Get personalized recommendations</li>
          </ul>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Get Started</a>
          </div>

          <p>Have questions or need help? Our support team is here to assist you!</p>

          <div class="footer">
            <p>This email was sent by ${appName}</p>
            <p>We're glad you're here! 💜</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

function passwordChanged({ appName, supportUrl }: PasswordChangedEmailProps): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Changed</title>
        <style>${baseStyles}</style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">${appName}</div>
            <h1>Password Changed Successfully</h1>
          </div>

          <p>This email confirms that your ${appName} password was changed successfully.</p>

          <p>If you made this change, no further action is required.</p>

          <div class="warning">
            <strong>⚠️ Didn't change your password?</strong><br>
            If you didn't make this change, your account may be compromised. Please contact our support team immediately and consider changing your password for other accounts that use the same credentials.
          </div>

          <div style="text-align: center;">
            <a href="${supportUrl}" class="button">Contact Support</a>
          </div>

          <h3>Security Tips:</h3>
          <ul>
            <li>Use a unique password for each online account</li>
            <li>Enable two-factor authentication when available</li>
            <li>Never share your password with anyone</li>
            <li>Use a password manager to generate and store strong passwords</li>
          </ul>

          <div class="footer">
            <p>This email was sent by ${appName}</p>
            <p>Your security is our priority.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export const emailTemplates = {
  verification,
  passwordReset,
  welcome,
  passwordChanged,
};
