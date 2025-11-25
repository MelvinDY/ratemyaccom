'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Info } from 'lucide-react';
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

      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border-white/20 shadow-2xl relative z-10">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end bg-clip-text text-transparent">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center text-gray-600">
            Join the NSW student accommodation community
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-700">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${validationErrors.name ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">
                  University Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university" className="text-gray-700">
                  University
                </Label>
                <Select
                  value={formData.university}
                  onValueChange={handleUniversityChange}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    id="university"
                    className={`${validationErrors.university ? 'border-red-500' : ''}`}
                  >
                    <SelectValue placeholder="Select your university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.value} value={uni.value}>
                        {uni.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.university && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.university}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId" className="text-gray-700">
                  Student ID
                </Label>
                <Input
                  id="studentId"
                  name="studentId"
                  type="text"
                  placeholder="z5123456"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`${validationErrors.studentId ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.studentId && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.studentId}</p>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="password" className="text-gray-700">
                    Password
                  </Label>
                  <Popover open={showPasswordHints} onOpenChange={setShowPasswordHints}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        onMouseEnter={() => setShowPasswordHints(true)}
                        onMouseLeave={() => setShowPasswordHints(false)}
                        onFocus={() => setShowPasswordHints(true)}
                        onBlur={() => setShowPasswordHints(false)}
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-80 p-4 bg-white shadow-lg border border-gray-200"
                      side="top"
                    >
                      <div className="space-y-2">
                        <p className="font-semibold text-sm text-gray-900">
                          Password Requirements:
                        </p>
                        <ul className="space-y-1.5 text-xs text-gray-600">
                          <li className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                            At least 8 characters long
                          </li>
                          <li className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                            Contains uppercase and lowercase letters
                          </li>
                          <li className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                            Contains at least one number
                          </li>
                          <li className="flex items-center gap-2">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${/[^a-zA-Z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-300'}`}
                            />
                            Contains at least one special character
                          </li>
                        </ul>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setShowPasswordHints(true)}
                  onBlur={() => setShowPasswordHints(false)}
                  className={`${validationErrors.password ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.password && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${validationErrors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                  required
                />
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-lyra-purple-start to-lyra-purple-end hover:opacity-90 transition-opacity text-white font-semibold py-2"
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-lyra-purple-start hover:text-lyra-purple-end font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
