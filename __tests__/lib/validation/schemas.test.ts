import {
  emailSchema,
  passwordSchema,
  reviewTextSchema,
  ratingSchema,
  searchQuerySchema,
  userRegistrationSchema,
} from '@/lib/validation/schemas';

describe('Validation Schemas', () => {
  describe('emailSchema', () => {
    it('should accept valid NSW university emails', () => {
      const validEmails = [
        'student@unsw.edu.au',
        'test@student.usyd.edu.au',
        'john.doe@uts.edu.au',
      ];

      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it('should reject invalid emails', () => {
      const invalidEmails = [
        'not-an-email',
        'test@gmail.com',
        'student@unsw.com',
        'test@invalid.edu.au',
      ];

      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });
  });

  describe('passwordSchema', () => {
    it('should accept strong passwords', () => {
      const validPasswords = ['StrongPass1!', 'MyP@ssw0rd', 'Secure123#'];

      validPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short',
        'nouppercase1!',
        'NOLOWERCASE1!',
        'NoNumbers!',
        'NoSpecial123',
      ];

      weakPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });
  });

  describe('reviewTextSchema', () => {
    it('should accept valid review text', () => {
      const validText =
        'This is a great accommodation with excellent facilities and friendly staff.';
      expect(() => reviewTextSchema.parse(validText)).not.toThrow();
    });

    it('should reject text that is too short', () => {
      const shortText = 'Too short';
      expect(() => reviewTextSchema.parse(shortText)).toThrow();
    });

    it('should reject text with XSS attempts', () => {
      const xssAttempts = [
        '<script>alert("XSS")</script>',
        'Test javascript:alert("XSS")',
        '<iframe src="malicious"></iframe>',
      ];

      xssAttempts.forEach((text) => {
        expect(() => reviewTextSchema.parse(text)).toThrow();
      });
    });
  });

  describe('ratingSchema', () => {
    it('should accept valid ratings (1-5)', () => {
      [1, 2, 3, 4, 5].forEach((rating) => {
        expect(() => ratingSchema.parse(rating)).not.toThrow();
      });
    });

    it('should reject invalid ratings', () => {
      [0, 6, -1, 3.5].forEach((rating) => {
        expect(() => ratingSchema.parse(rating)).toThrow();
      });
    });
  });

  describe('searchQuerySchema', () => {
    it('should accept valid search queries', () => {
      const validQueries = ['accommodation near campus', 'studio apartment', 'UNSW housing'];

      validQueries.forEach((query) => {
        expect(() => searchQuerySchema.parse(query)).not.toThrow();
      });
    });

    it('should reject SQL injection attempts', () => {
      const sqlInjections = [
        "'; DROP TABLE users; --",
        'SELECT * FROM accommodations',
        'UNION SELECT password FROM users',
      ];

      sqlInjections.forEach((query) => {
        expect(() => searchQuerySchema.parse(query)).toThrow();
      });
    });
  });

  describe('userRegistrationSchema', () => {
    it('should accept valid registration data', () => {
      const validData = {
        email: 'student@unsw.edu.au',
        password: 'StrongPass1!',
        confirmPassword: 'StrongPass1!',
        name: 'John Doe',
        university: 'UNSW' as const,
        studentId: 'z1234567',
      };

      expect(() => userRegistrationSchema.parse(validData)).not.toThrow();
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        email: 'student@unsw.edu.au',
        password: 'StrongPass1!',
        confirmPassword: 'DifferentPass1!',
        name: 'John Doe',
        university: 'UNSW' as const,
        studentId: 'z1234567',
      };

      expect(() => userRegistrationSchema.parse(invalidData)).toThrow();
    });
  });
});
