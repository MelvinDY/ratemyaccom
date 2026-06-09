/**
 * Auth method feature flags.
 *
 * Product decision (2026-06): only Google OAuth sign-in is offered for now.
 * Email/password, passwordless OTP, and Apple sign-in are intentionally
 * disabled in the UI. Flip these flags back on to restore those flows — the
 * underlying API routes and components are left intact.
 */
interface AuthMethods {
  emailPassword: boolean;
  emailOtp: boolean;
  google: boolean;
  apple: boolean;
}

export const AUTH_METHODS: AuthMethods = {
  emailPassword: false,
  emailOtp: false,
  google: true,
  apple: false,
};

/** True when only OAuth (Google/Apple) sign-in is enabled — no email methods. */
export const OAUTH_ONLY = !AUTH_METHODS.emailPassword && !AUTH_METHODS.emailOtp;
