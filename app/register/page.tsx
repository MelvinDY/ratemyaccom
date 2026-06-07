'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpRight, Info, Check, X, Eye, EyeOff, ChevronDown } from 'lucide-react';
import OAuthButtons from '@/components/auth/OAuthButtons';
import type { University } from '@/lib/validation/schemas';

const universities: { value: University; label: string }[] = [
  { value: 'UNSW', label: 'University of New South Wales (UNSW)' },
  { value: 'USYD', label: 'University of Sydney (USYD)' },
  { value: 'UTS', label: 'University of Technology Sydney (UTS)' },
  { value: 'MQ', label: 'Macquarie University' },
  { value: 'WSU', label: 'Western Sydney University' },
];

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    university: '' as University | '',
    studentId: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showPasswordHints, setShowPasswordHints] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    clearError();
  };

  const handleUniversityChange = (value: University) => {
    setFormData((prev) => ({ ...prev, university: value }));
    setUniversityDropdownOpen(false);
    if (validationErrors.university) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.university;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name is too long';
    }

    // Email validation
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

    // University validation
    if (!formData.university) {
      errors.university = 'University is required';
    }

    // Student ID validation
    if (!formData.studentId) {
      errors.studentId = 'Student ID is required';
    } else if (!/^[a-zA-Z0-9]{6,12}$/.test(formData.studentId)) {
      errors.studentId = 'Student ID must be 6-12 alphanumeric characters';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one lowercase letter';
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = 'Password must contain at least one uppercase letter';
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one number';
      } else if (!/[^a-zA-Z0-9]/.test(formData.password)) {
        errors.password = 'Password must contain at least one special character';
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        name: formData.name,
        university: formData.university as University,
        studentId: formData.studentId,
      });
      router.push('/');
    } catch (err) {
      // Error is handled by the useAuth hook
      console.error('Registration failed:', err);
    }
  };

  // Password strength indicators
  const passwordChecks = [
    { label: 'At least 8 characters', valid: formData.password.length >= 8 },
    {
      label: 'Uppercase & lowercase',
      valid: /[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password),
    },
    { label: 'Contains a number', valid: /[0-9]/.test(formData.password) },
    { label: 'Special character', valid: /[^a-zA-Z0-9]/.test(formData.password) },
  ];

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-500/[0.07] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-purple-900/10 to-transparent" />

      {/* Floating orbs */}
      <motion.div
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-purple-500/20 blur-[100px]"
        animate={{
          y: [0, -30, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]"
        animate={{
          y: [0, 20, 0],
          scale: [1.1, 1, 1.1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center px-6 sm:px-12 lg:px-20 py-8"
        >
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-2 h-2 rounded-full bg-purple-400 group-hover:bg-purple-300 transition-colors" />
            <span className="text-xs text-neutral-500 uppercase tracking-widest group-hover:text-neutral-400 transition-colors">
              Rate My Accom
            </span>
          </Link>
          <div className="text-xs text-neutral-500 uppercase tracking-widest">
            Join the Community
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-12 lg:px-20 py-8">
          <div className="w-full max-w-5xl">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16 items-start">
              {/* Left column - Typography */}
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-2 lg:sticky lg:top-32"
              >
                {/* Overline */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-purple-500" />
                  <span className="text-sm text-purple-400 uppercase tracking-[0.3em] font-light">
                    Get Started
                  </span>
                </div>

                {/* Main headline */}
                <div className="space-y-2 mb-6">
                  <h1 className="text-5xl sm:text-6xl font-extralight text-white leading-[0.9] tracking-[-0.03em]">
                    Create
                  </h1>
                  <h1 className="text-5xl sm:text-6xl font-extralight leading-[0.9] tracking-[-0.03em]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-purple-400">
                      Account
                    </span>
                  </h1>
                </div>

                {/* Description */}
                <p className="text-base text-neutral-400 leading-relaxed font-light mb-8">
                  Join our community of NSW university students and share your accommodation
                  experiences.
                </p>

                {/* Sign in link */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-neutral-500">Already have an account?</span>
                  <Link href="/login">
                    <motion.span
                      whileHover={{ x: 4 }}
                      className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      Sign in
                      <ArrowUpRight className="w-4 h-4" />
                    </motion.span>
                  </Link>
                </div>
              </motion.div>

              {/* Right column - Form */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="lg:col-span-3"
              >
                <OAuthButtons redirect="/" label="Sign up" />
                <div className="mt-4 p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                      >
                        <p className="text-red-400 text-sm">{error}</p>
                      </motion.div>
                    )}

                    {/* Row 1: Name & Email */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="space-y-2">
                        <label
                          htmlFor="register-name"
                          className="text-xs text-neutral-400 uppercase tracking-wider"
                        >
                          Full Name
                        </label>
                        <input
                          id="register-name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="John Doe"
                          disabled={isLoading}
                          className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border ${
                            validationErrors.name ? 'border-red-500/50' : 'border-white/[0.08]'
                          } text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300`}
                        />
                        {validationErrors.name && (
                          <p className="text-red-400 text-xs">{validationErrors.name}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label
                          htmlFor="register-email"
                          className="text-xs text-neutral-400 uppercase tracking-wider"
                        >
                          University Email
                        </label>
                        <input
                          id="register-email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="name@university.edu.au"
                          disabled={isLoading}
                          className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border ${
                            validationErrors.email ? 'border-red-500/50' : 'border-white/[0.08]'
                          } text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300`}
                        />
                        {validationErrors.email && (
                          <p className="text-red-400 text-xs">{validationErrors.email}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 2: University & Student ID */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* University Dropdown */}
                      <div className="space-y-2">
                        <span className="text-xs text-neutral-400 uppercase tracking-wider block">
                          University
                        </span>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setUniversityDropdownOpen(!universityDropdownOpen)}
                            disabled={isLoading}
                            className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border ${
                              validationErrors.university
                                ? 'border-red-500/50'
                                : 'border-white/[0.08]'
                            } text-left focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300 flex items-center justify-between`}
                          >
                            <span
                              className={formData.university ? 'text-white' : 'text-neutral-600'}
                            >
                              {formData.university
                                ? universities.find((u) => u.value === formData.university)?.label
                                : 'Select university'}
                            </span>
                            <ChevronDown
                              className={`w-4 h-4 text-neutral-400 transition-transform duration-300 ${
                                universityDropdownOpen ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {universityDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-[#151515] border border-white/[0.1] shadow-2xl shadow-black/50"
                            >
                              {universities.map((uni) => (
                                <button
                                  key={uni.value}
                                  type="button"
                                  onClick={() => handleUniversityChange(uni.value)}
                                  className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                                >
                                  {uni.label}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </div>
                        {validationErrors.university && (
                          <p className="text-red-400 text-xs">{validationErrors.university}</p>
                        )}
                      </div>

                      {/* Student ID */}
                      <div className="space-y-2">
                        <label
                          htmlFor="register-studentId"
                          className="text-xs text-neutral-400 uppercase tracking-wider"
                        >
                          Student ID
                        </label>
                        <input
                          id="register-studentId"
                          type="text"
                          name="studentId"
                          value={formData.studentId}
                          onChange={handleChange}
                          placeholder="z5123456"
                          disabled={isLoading}
                          className={`w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border ${
                            validationErrors.studentId ? 'border-red-500/50' : 'border-white/[0.08]'
                          } text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300`}
                        />
                        {validationErrors.studentId && (
                          <p className="text-red-400 text-xs">{validationErrors.studentId}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Password & Confirm Password */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Password */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor="register-password"
                            className="text-xs text-neutral-400 uppercase tracking-wider"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            onMouseEnter={() => setShowPasswordHints(true)}
                            onMouseLeave={() => setShowPasswordHints(false)}
                            className="text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            id="register-password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => setShowPasswordHints(true)}
                            onBlur={() => setShowPasswordHints(false)}
                            placeholder="Create password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-white/[0.03] border ${
                              validationErrors.password
                                ? 'border-red-500/50'
                                : 'border-white/[0.08]'
                            } text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {validationErrors.password && (
                          <p className="text-red-400 text-xs">{validationErrors.password}</p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="space-y-2">
                        <label
                          htmlFor="register-confirmPassword"
                          className="text-xs text-neutral-400 uppercase tracking-wider"
                        >
                          Confirm Password
                        </label>
                        <div className="relative">
                          <input
                            id="register-confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            disabled={isLoading}
                            className={`w-full px-4 py-3.5 pr-12 rounded-xl bg-white/[0.03] border ${
                              validationErrors.confirmPassword
                                ? 'border-red-500/50'
                                : 'border-white/[0.08]'
                            } text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all duration-300`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {validationErrors.confirmPassword && (
                          <p className="text-red-400 text-xs">{validationErrors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Password hints */}
                    {showPasswordHints && formData.password && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-2 gap-2"
                      >
                        {passwordChecks.map((check, index) => (
                          <div
                            key={index}
                            className={`flex items-center gap-2 text-xs ${
                              check.valid ? 'text-green-400' : 'text-neutral-500'
                            }`}
                          >
                            {check.valid ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <X className="w-3 h-3" />
                            )}
                            {check.label}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-white text-black rounded-full font-medium text-sm uppercase tracking-wider hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>

                    {/* Terms */}
                    <p className="text-xs text-neutral-500 text-center">
                      By creating an account, you agree to our{' '}
                      <Link
                        href="/terms"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link
                        href="/privacy"
                        className="text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        Privacy Policy
                      </Link>
                    </p>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="px-6 sm:px-12 lg:px-20 py-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-8">
              {['UNSW', 'Sydney', 'UTS', 'Macquarie', 'WSU'].map((uni) => (
                <span
                  key={uni}
                  className="text-xs text-neutral-600 uppercase tracking-widest hover:text-neutral-400 transition-colors cursor-default"
                >
                  {uni}
                </span>
              ))}
            </div>
            <div className="text-xs text-neutral-600 uppercase tracking-widest">
              Verified Students Only
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
