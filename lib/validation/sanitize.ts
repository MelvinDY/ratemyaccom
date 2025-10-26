import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

/**
 * Initialize DOMPurify for server-side sanitization
 * Note: For client-side, DOMPurify can be used directly with window object
 */
const createDOMPurify = () => {
  if (typeof window === 'undefined') {
    // Server-side: Create a virtual DOM
    const window = new JSDOM('').window;
    return DOMPurify(window as unknown as Window);
  }
  // Client-side: Use the real DOM
  return DOMPurify;
};

const purify = createDOMPurify();

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes all potentially dangerous tags and attributes
 */
export const sanitizeHtml = (html: string): string => {
  return purify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize plain text by stripping all HTML tags
 * Use this for user inputs that should not contain any HTML
 */
export const sanitizeText = (text: string): string => {
  return purify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Sanitize review content
 * Allows basic formatting but removes dangerous content
 */
export const sanitizeReviewContent = (content: string): string => {
  return purify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
};

/**
 * Escape special characters for safe display
 */
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || '');
};

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export const sanitizeUrl = (url: string): string => {
  const trimmedUrl = url.trim();

  // Block javascript: and data: URIs
  if (
    trimmedUrl.startsWith('javascript:') ||
    trimmedUrl.startsWith('data:') ||
    trimmedUrl.startsWith('vbscript:')
  ) {
    return '';
  }

  // Only allow http, https, and mailto protocols
  if (
    !trimmedUrl.startsWith('http://') &&
    !trimmedUrl.startsWith('https://') &&
    !trimmedUrl.startsWith('mailto:') &&
    !trimmedUrl.startsWith('/')
  ) {
    return '';
  }

  return trimmedUrl;
};

/**
 * Sanitize filename to prevent path traversal attacks
 */
export const sanitizeFilename = (filename: string): string => {
  // Remove directory separators and null bytes
  return filename.replace(/[/\\]/g, '').replace(/\0/g, '').replace(/\.\./g, '').trim();
};

/**
 * Rate limit key sanitization
 * Prevents injection in rate limiter keys
 */
export const sanitizeRateLimitKey = (key: string): string => {
  return key.replace(/[^a-zA-Z0-9:-]/g, '_');
};

/**
 * Validate and sanitize email addresses
 */
export const sanitizeEmail = (email: string): string => {
  return email.toLowerCase().trim();
};

/**
 * Sanitize search query
 * Removes SQL injection patterns and limits length
 */
export const sanitizeSearchQuery = (query: string): string => {
  return query
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[;'"]/g, '') // Remove quotes and semicolons
    .trim()
    .slice(0, 200); // Limit length
};
