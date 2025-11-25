'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Mail, Lock, ArrowLeft, KeyRound } from 'lucide-react';

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
    // Only allow digits
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Auto-focus next input
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal via-charcoal-light to-charcoal-dark py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      <div className="absolute top-0 left-0 w-96 h-96 bg-lyra-purple-start/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-lyra-purple-end/20 rounded-full blur-3xl" />

      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end bg-clip-text text-transparent">
            {loginMethod === 'otp' && otpStep === 'verify' ? 'Enter Code' : 'Sign In'}
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            {loginMethod === 'otp' && otpStep === 'verify'
              ? `We sent a code to ${formData.email}`
              : 'Enter your university email to access your account'}
          </CardDescription>
        </CardHeader>

        {/* Password Login Form */}
        {loginMethod === 'password' && (
          <form onSubmit={handlePasswordLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  University Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@university.edu.au"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${validationErrors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`${validationErrors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="text-sm text-lyra-purple-start hover:text-lyra-purple-end transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90 transition-opacity text-white font-semibold py-2"
                loading={isLoading}
              >
                {!isLoading && <Lock className="w-4 h-4 mr-2" />}
                {isLoading ? 'Signing in...' : 'Sign In with Password'}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={switchToOtp}
                disabled={isLoading}
              >
                <Mail className="w-4 h-4 mr-2" />
                Sign In with Email Code
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-lyra-purple-start hover:text-lyra-purple-end font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {/* OTP Email Step */}
        {loginMethod === 'otp' && otpStep === 'email' && (
          <form onSubmit={handleRequestOtp}>
            <CardContent className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="otp-email" className="text-gray-700">
                  University Email
                </Label>
                <Input
                  id="otp-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="yourname@university.edu.au"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${validationErrors.email ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              <p className="text-sm text-gray-500">
                We&apos;ll send a 6-digit code to your email for secure, password-free sign in.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90 transition-opacity text-white font-semibold py-2"
                loading={isLoading}
              >
                {!isLoading && <Mail className="w-4 h-4 mr-2" />}
                {isLoading ? 'Sending code...' : 'Send Code'}
              </Button>

              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50"
                onClick={switchToPassword}
                disabled={isLoading}
              >
                <Lock className="w-4 h-4 mr-2" />
                Sign In with Password
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/register"
                  className="text-lyra-purple-start hover:text-lyra-purple-end font-semibold transition-colors"
                >
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        )}

        {/* OTP Verify Step */}
        {loginMethod === 'otp' && otpStep === 'verify' && (
          <form onSubmit={handleVerifyOtp}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <Label className="text-gray-700 text-center block">Enter the 6-digit code</Label>

                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpCode.map((digit, index) => (
                    <Input
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
                      className={`w-12 h-14 text-center text-2xl font-bold ${
                        validationErrors.otp ? 'border-red-500' : ''
                      }`}
                      disabled={isLoading}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {validationErrors.otp && (
                  <p className="text-red-500 text-sm text-center">{validationErrors.otp}</p>
                )}
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || isLoading}
                  className={`text-sm font-semibold transition-colors ${
                    countdown > 0
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-lyra-purple-start hover:text-lyra-purple-end'
                  }`}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend code'}
                </button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90 transition-opacity text-white font-semibold py-2"
                loading={isLoading}
                disabled={otpCode.join('').length !== 6}
              >
                {!isLoading && <KeyRound className="w-4 h-4 mr-2" />}
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-600 hover:text-gray-800"
                onClick={goBackToEmail}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Use a different email
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
