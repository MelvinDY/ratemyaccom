'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import OAuthButtons from '@/components/auth/OAuthButtons';
import styles from '@/components/editorial/editorial.module.css';

type LoginMethod = 'password' | 'otp';
type OtpStep = 'email' | 'verify';

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    requestOtp,
    verifyOtp,
    isLoading,
    error,
    clearError,
    otpSent,
    otpEmail,
    clearOtpState,
  } = useAuth();

  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [otpStep, setOtpStep] = useState<OtpStep>('email');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  useEffect(() => {
    if (otpStep === 'verify' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [otpStep]);

  useEffect(() => {
    if (otpSent && otpEmail) {
      setOtpStep('verify');
      setFormData((prev) => ({ ...prev, email: otpEmail }));
    }
  }, [otpSent, otpEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    clearError();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }
    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    clearError();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      setOtpCode(pastedData.split(''));
      otpInputRefs.current[5]?.focus();
    }
  };

  const validateEmail = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (
      !/^[a-zA-Z0-9._%+-]+@(student\.)?(unsw|usyd|uts|mq|westernsydney)\.edu\.au$/i.test(
        formData.email
      )
    ) {
      errors.email =
        'Must be a valid university student email (UNSW, USYD, UTS, Macquarie, or Western Sydney)';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (
      !/^[a-zA-Z0-9._%+-]+@(student\.)?(unsw|usyd|uts|mq|westernsydney)\.edu\.au$/i.test(
        formData.email
      )
    ) {
      errors.email =
        'Must be a valid university student email (UNSW, USYD, UTS, Macquarie, or Western Sydney)';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) {
      return;
    }
    try {
      await login(formData);
      router.push('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail()) {
      return;
    }
    try {
      await requestOtp(formData.email);
      setOtpStep('verify');
      setCountdown(60);
    } catch (err) {
      console.error('OTP request failed:', err);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpCode.join('');
    if (code.length !== 6) {
      setValidationErrors({ otp: 'Please enter the complete 6-digit code' });
      return;
    }
    try {
      await verifyOtp(formData.email, code);
      router.push('/');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) {
      return;
    }
    try {
      await requestOtp(formData.email);
      setCountdown(60);
      setOtpCode(['', '', '', '', '', '']);
    } catch (err) {
      console.error('OTP resend failed:', err);
    }
  };

  const switchToPassword = () => {
    setLoginMethod('password');
    setOtpStep('email');
    setOtpCode(['', '', '', '', '', '']);
    clearOtpState();
    clearError();
  };

  const switchToOtp = () => {
    setLoginMethod('otp');
    setOtpStep('email');
    clearError();
  };

  const goBackToEmail = () => {
    setOtpStep('email');
    setOtpCode(['', '', '', '', '', '']);
    clearOtpState();
    clearError();
  };

  const inVerify = loginMethod === 'otp' && otpStep === 'verify';

  return (
    <div className={styles.page}>
      <div className={styles.titlebar}>
        {/* Editorial headline rail */}
        <div>
          <div className={styles.kicker}>§ ACCESS — VERIFIED STUDENTS</div>
          <h1 className={styles.h1}>
            {inVerify ? (
              <>
                Enter
                <br />
                code<span className={styles.dot}>.</span>
              </>
            ) : (
              <>
                Sign
                <br />
                in<span className={styles.dot}>.</span>
              </>
            )}
          </h1>
          <p className={styles.lede}>
            {inVerify ? (
              <>
                We sent a six-digit code to <em>{formData.email}</em>. Enter it below to finish
                signing in.
              </>
            ) : (
              <>
                Reviews are <em>verified students only.</em> Sign in with your university email to
                read the full index and post your own.
              </>
            )}
          </p>
        </div>

        {/* Form card */}
        <div className={styles.card}>
          {!inVerify && <OAuthButtons redirect="/" label="Sign in" />}

          {/* Password login */}
          {loginMethod === 'password' && (
            <form onSubmit={handlePasswordLogin}>
              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pw-email">
                  University email
                </label>
                <input
                  id="pw-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="yourname@university.edu.au"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                />
                {validationErrors.email && (
                  <p className={styles.errorText}>{validationErrors.email}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="pw-password">
                  Password
                </label>
                <input
                  id="pw-password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                />
                {validationErrors.password && (
                  <p className={styles.errorText}>{validationErrors.password}</p>
                )}
              </div>

              <div style={{ textAlign: 'right', marginBottom: 18 }}>
                <Link href="/forgot-password" className={styles.link}>
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
                {isLoading ? 'Signing in…' : 'Sign in →'}
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>or</span>
                <span className={styles.dividerLine} />
              </div>

              <button
                type="button"
                onClick={switchToOtp}
                disabled={isLoading}
                className={styles.btnSecondary}
              >
                Email me a sign-in code
              </button>
            </form>
          )}

          {/* OTP — request */}
          {loginMethod === 'otp' && otpStep === 'email' && (
            <form onSubmit={handleRequestOtp}>
              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="otp-email">
                  University email
                </label>
                <input
                  id="otp-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="yourname@university.edu.au"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                />
                {validationErrors.email && (
                  <p className={styles.errorText}>{validationErrors.email}</p>
                )}
              </div>

              <p className={styles.hint}>
                We&apos;ll send a 6-digit code for <em>password-free</em> sign in.
              </p>

              <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
                {isLoading ? 'Sending code…' : 'Send code →'}
              </button>

              <div className={styles.divider}>
                <span className={styles.dividerLine} />
                <span className={styles.dividerText}>or</span>
                <span className={styles.dividerLine} />
              </div>

              <button
                type="button"
                onClick={switchToPassword}
                disabled={isLoading}
                className={styles.btnSecondary}
              >
                Sign in with a password
              </button>
            </form>
          )}

          {/* OTP — verify */}
          {inVerify && (
            <form onSubmit={handleVerifyOtp}>
              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.field}>
                <span className={styles.label} style={{ textAlign: 'center' }}>
                  Enter the 6-digit code
                </span>
                <div className={styles.otpRow} onPaste={handleOtpPaste}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      disabled={isLoading}
                      autoComplete="one-time-code"
                      className={styles.otpInput}
                    />
                  ))}
                </div>
                {validationErrors.otp && (
                  <p className={`${styles.errorText} ${styles.center}`}>{validationErrors.otp}</p>
                )}
              </div>

              <p className={`${styles.hint} ${styles.center}`}>
                Didn&apos;t receive it?{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={styles.resend}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </p>

              <button
                type="submit"
                disabled={isLoading || otpCode.join('').length !== 6}
                className={styles.btnPrimary}
              >
                {isLoading ? 'Verifying…' : 'Verify & sign in →'}
              </button>

              <button
                type="button"
                onClick={goBackToEmail}
                disabled={isLoading}
                className={styles.btnSecondary}
                style={{ marginTop: 10 }}
              >
                ← Use a different email
              </button>
            </form>
          )}

          <div className={styles.switchRow}>
            Don&apos;t have an account?{' '}
            <Link href="/register" className={styles.link}>
              Sign up
            </Link>
          </div>
        </div>
      </div>

      <div className={styles.footerBar}>
        <div className={styles.uniList}>
          {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
            <span key={uni}>{uni}</span>
          ))}
        </div>
        <div>Secure login</div>
      </div>
    </div>
  );
}
