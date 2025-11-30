'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Mail, Lock, ArrowLeft, KeyRound, ArrowUpRight } from 'lucide-react';

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [countdown]);

  // Focus first OTP input when entering verify step
  useEffect(() => {
    if (otpStep === 'verify' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [otpStep]);

  // Sync with auth state
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
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
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

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{ y: [0, -30, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"
        animate={{ y: [0, 20, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col pt-24">
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Back link */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-neutral-500 hover:text-white transition-colors mb-10"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-xs uppercase tracking-widest">Back to Home</span>
              </Link>
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-10"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-purple-500" />
                <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                  Welcome Back
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extralight text-white mb-4">
                {loginMethod === 'otp' && otpStep === 'verify' ? (
                  <>
                    Enter{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                      Code
                    </span>
                  </>
                ) : (
                  <>
                    Sign{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400">
                      In
                    </span>
                  </>
                )}
              </h1>
              <p className="text-neutral-400 font-light">
                {loginMethod === 'otp' && otpStep === 'verify'
                  ? `We sent a code to ${formData.email}`
                  : 'Enter your university email to access your account'}
              </p>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm p-8"
            >
              {/* Password Login Form */}
              {loginMethod === 'password' && (
                <form onSubmit={handlePasswordLogin} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="password-login-email"
                      className="text-xs text-neutral-400 uppercase tracking-widest"
                    >
                      University Email
                    </label>
                    <input
                      id="password-login-email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="yourname@university.edu.au"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-5 py-4 rounded-2xl bg-white/[0.03] border ${
                        validationErrors.email ? 'border-red-500/50' : 'border-white/10'
                      } text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors`}
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password-login-password"
                      className="text-xs text-neutral-400 uppercase tracking-widest"
                    >
                      Password
                    </label>
                    <input
                      id="password-login-password"
                      type="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-5 py-4 rounded-2xl bg-white/[0.03] border ${
                        validationErrors.password ? 'border-red-500/50' : 'border-white/10'
                      } text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors`}
                    />
                    {validationErrors.password && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      'Signing in...'
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Sign In with Password
                      </>
                    )}
                  </motion.button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-[#0a0a0a] text-neutral-600 uppercase tracking-widest">
                        or
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={switchToOtp}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 transition-all text-sm uppercase tracking-wider"
                  >
                    <Mail className="w-4 h-4" />
                    Sign In with Email Code
                  </motion.button>
                </form>
              )}

              {/* OTP Email Step */}
              {loginMethod === 'otp' && otpStep === 'email' && (
                <form onSubmit={handleRequestOtp} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label
                      htmlFor="otp-email"
                      className="text-xs text-neutral-400 uppercase tracking-widest"
                    >
                      University Email
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
                      className={`w-full px-5 py-4 rounded-2xl bg-white/[0.03] border ${
                        validationErrors.email ? 'border-red-500/50' : 'border-white/10'
                      } text-white placeholder-neutral-600 focus:outline-none focus:border-purple-500/50 transition-colors`}
                    />
                    {validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <p className="text-sm text-neutral-500 font-light">
                    We&apos;ll send a 6-digit code to your email for secure, password-free sign in.
                  </p>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      'Sending code...'
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        Send Code
                      </>
                    )}
                  </motion.button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-4 bg-[#0a0a0a] text-neutral-600 uppercase tracking-widest">
                        or
                      </span>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={switchToPassword}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-full border border-neutral-700 text-white hover:border-neutral-500 hover:bg-white/5 transition-all text-sm uppercase tracking-wider"
                  >
                    <Lock className="w-4 h-4" />
                    Sign In with Password
                  </motion.button>
                </form>
              )}

              {/* OTP Verify Step */}
              {loginMethod === 'otp' && otpStep === 'verify' && (
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <p className="text-xs text-neutral-400 uppercase tracking-widest text-center">
                      Enter the 6-digit code
                    </p>

                    <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
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
                          className={`w-12 h-14 text-center text-2xl font-light rounded-2xl bg-white/[0.03] border ${
                            validationErrors.otp ? 'border-red-500/50' : 'border-white/10'
                          } text-white focus:outline-none focus:border-purple-500/50 transition-colors`}
                        />
                      ))}
                    </div>

                    {validationErrors.otp && (
                      <p className="text-red-400 text-xs text-center">{validationErrors.otp}</p>
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm text-neutral-500 mb-2">Didn&apos;t receive the code?</p>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className={`text-sm font-medium transition-colors ${
                        countdown > 0
                          ? 'text-neutral-600 cursor-not-allowed'
                          : 'text-purple-400 hover:text-purple-300'
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                    </button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading || otpCode.join('').length !== 6}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full group flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      'Verifying...'
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        Verify & Sign In
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={goBackToEmail}
                    disabled={isLoading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 text-neutral-500 hover:text-white transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Use a different email
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Sign up link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-center"
            >
              <p className="text-neutral-500 text-sm">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-purple-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                >
                  Sign up
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </p>
            </motion.div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors cursor-default hidden sm:block"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="text-xs text-neutral-600 uppercase tracking-widest">Secure Login</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
