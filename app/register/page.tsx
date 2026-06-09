'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import OAuthButtons from '@/components/auth/OAuthButtons';
import { AUTH_METHODS } from '@/lib/config/auth';
import type { University } from '@/lib/validation/schemas';
import styles from '@/components/editorial/editorial.module.css';

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

  const handleUniversityChange = (value: University) => {
    setFormData((prev) => ({ ...prev, university: value }));
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

    if (!formData.name) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      errors.name = 'Name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      errors.name = 'Name is too long';
    }

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

    if (!formData.university) {
      errors.university = 'University is required';
    }

    if (!formData.studentId) {
      errors.studentId = 'Student ID is required';
    } else if (!/^[a-zA-Z0-9]{6,12}$/.test(formData.studentId)) {
      errors.studentId = 'Student ID must be 6-12 alphanumeric characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
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
      console.error('Registration failed:', err);
    }
  };

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
    <div className={styles.page}>
      <div className={styles.titlebar}>
        {/* Editorial headline rail */}
        <div>
          <div className={styles.kicker}>§ JOIN — THE INDEX</div>
          <h1 className={styles.h1}>
            Sign
            <br />
            up<span className={styles.dot}>.</span>
          </h1>
          <p className={styles.lede}>
            One verified account lets you read every review and <em>post your own.</em> We check the
            university email — <em>no agents, no astroturf.</em>
          </p>
        </div>

        {/* Form card */}
        <div className={styles.card}>
          <OAuthButtons redirect="/" label="Sign up" />

          {AUTH_METHODS.emailPassword && (
            <form onSubmit={handleSubmit}>
              {error && <div className={styles.errorBox}>{error}</div>}

              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.name ? styles.inputError : ''}`}
                />
                {validationErrors.name && (
                  <p className={styles.errorText}>{validationErrors.name}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="email">
                  University email
                </label>
                <input
                  id="email"
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
                <label className={styles.label} htmlFor="university">
                  University
                </label>
                <select
                  id="university"
                  value={formData.university}
                  onChange={(e) => handleUniversityChange(e.target.value as University)}
                  disabled={isLoading}
                  className={`${styles.select} ${validationErrors.university ? styles.inputError : ''}`}
                >
                  <option value="" disabled>
                    Select your university
                  </option>
                  {universities.map((uni) => (
                    <option key={uni.value} value={uni.value}>
                      {uni.label}
                    </option>
                  ))}
                </select>
                {validationErrors.university && (
                  <p className={styles.errorText}>{validationErrors.university}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="studentId">
                  Student ID
                </label>
                <input
                  id="studentId"
                  type="text"
                  name="studentId"
                  placeholder="e.g. z5123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.studentId ? styles.inputError : ''}`}
                />
                {validationErrors.studentId && (
                  <p className={styles.errorText}>{validationErrors.studentId}</p>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordHints(true)}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                />
                {validationErrors.password && (
                  <p className={styles.errorText}>{validationErrors.password}</p>
                )}
                {showPasswordHints && (
                  <ul
                    style={{
                      listStyle: 'none',
                      padding: 0,
                      margin: '10px 0 0',
                      fontFamily: 'var(--ed-mono)',
                      fontSize: 10,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      display: 'grid',
                      gap: 5,
                    }}
                  >
                    {passwordChecks.map((c) => (
                      <li
                        key={c.label}
                        style={{ color: c.valid ? 'var(--blue)' : 'var(--ed-mute-2)' }}
                      >
                        {c.valid ? '✓' : '·'} {c.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirmPassword">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                />
                {validationErrors.confirmPassword && (
                  <p className={styles.errorText}>{validationErrors.confirmPassword}</p>
                )}
              </div>

              <button type="submit" disabled={isLoading} className={styles.btnPrimary}>
                {isLoading ? 'Creating account…' : 'Create account →'}
              </button>
            </form>
          )}

          <div className={styles.switchRow}>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>
              Sign in
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
        <div>Verified students only</div>
      </div>
    </div>
  );
}
