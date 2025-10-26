import { z } from 'zod';

/**
 * Email validation schema
 * Ensures student email addresses from NSW universities
 */
export const emailSchema = z
  .string()
  .email('Invalid email address')
  .regex(
    /^[a-zA-Z0-9._%+-]+@(student\.)?(unsw|usyd|uts|mq|wsu|acu|nd|uow|newcastle|une|csu|scu|uon)\.edu\.au$/i,
    'Must be a valid NSW university student email address'
  );

/**
 * Password validation schema
 * Requires strong passwords with minimum requirements
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character');

/**
 * Student ID validation schema
 */
export const studentIdSchema = z.string().regex(/^[a-zA-Z0-9]{6,12}$/, 'Invalid student ID');

/**
 * Review text validation schema
 * Prevents XSS and ensures reasonable length
 */
export const reviewTextSchema = z
  .string()
  .min(50, 'Review must be at least 50 characters')
  .max(2000, 'Review must not exceed 2000 characters')
  .refine(
    (text) => {
      // Prevent script tags and common XSS patterns
      const xssPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
      ];
      return !xssPatterns.some((pattern) => pattern.test(text));
    },
    { message: 'Review contains invalid content' }
  );

/**
 * Review title validation schema
 */
export const reviewTitleSchema = z
  .string()
  .min(10, 'Title must be at least 10 characters')
  .max(100, 'Title must not exceed 100 characters');

/**
 * Rating validation schema (1-5 stars)
 */
export const ratingSchema = z
  .number()
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must not exceed 5');

/**
 * Rating breakdown schema for detailed ratings
 */
export const ratingBreakdownSchema = z.object({
  cleanliness: ratingSchema,
  location: ratingSchema,
  value: ratingSchema,
  amenities: ratingSchema,
  management: ratingSchema,
  safety: ratingSchema,
});

/**
 * Search query validation schema
 */
export const searchQuerySchema = z
  .string()
  .max(200, 'Search query too long')
  .refine(
    (query) => {
      // Prevent SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
        /--/,
        /;/,
        /\/\*/,
        /\*\//,
        /xp_/i,
      ];
      return !sqlPatterns.some((pattern) => pattern.test(query));
    },
    { message: 'Invalid search query' }
  );

/**
 * University selection schema
 */
export const universitySchema = z.enum([
  'UNSW',
  'USYD',
  'UTS',
  'MQ',
  'WSU',
  'ACU',
  'ND',
  'UOW',
  'Newcastle',
  'UNE',
  'CSU',
  'SCU',
  'UON',
]);

/**
 * Complete review submission schema
 */
export const reviewSubmissionSchema = z.object({
  accommodationId: z.string().uuid('Invalid accommodation ID'),
  title: reviewTitleSchema,
  text: reviewTextSchema,
  rating: ratingSchema,
  ratingBreakdown: ratingBreakdownSchema,
  pros: z.array(z.string().max(100)).max(5).optional(),
  cons: z.array(z.string().max(100)).max(5).optional(),
  roomType: z.string().max(50).optional(),
  stayDuration: z.string().max(50).optional(),
});

/**
 * User registration schema
 */
export const userRegistrationSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name too long'),
    university: universitySchema,
    studentId: studentIdSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

/**
 * User login schema
 */
export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Search filters schema
 */
export const searchFiltersSchema = z.object({
  university: universitySchema.optional(),
  location: searchQuerySchema.optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
  type: z.array(z.enum(['apartment', 'house', 'studio', 'shared', 'purpose-built'])).optional(),
  amenities: z.array(z.string()).optional(),
  rating: z.number().min(1).max(5).optional(),
});

/**
 * Pagination schema
 */
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

/**
 * Type exports for TypeScript
 */
export type EmailSchema = z.infer<typeof emailSchema>;
export type PasswordSchema = z.infer<typeof passwordSchema>;
export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type SearchFilters = z.infer<typeof searchFiltersSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
export type University = z.infer<typeof universitySchema>;
