import {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeFilename,
  escapeHtml,
} from '@/lib/validation/sanitize';

describe('Sanitization Functions', () => {
  describe('sanitizeHtml', () => {
    it('should allow safe HTML tags', () => {
      const html = '<p>Hello <strong>world</strong></p>';
      const result = sanitizeHtml(html);
      expect(result).toContain('<p>');
      expect(result).toContain('<strong>');
    });

    it('should remove dangerous HTML tags', () => {
      const html = '<script>alert("XSS")</script><p>Safe content</p>';
      const result = sanitizeHtml(html);
      expect(result).not.toContain('<script>');
      expect(result).toContain('Safe content');
    });
  });

  describe('sanitizeText', () => {
    it('should remove all HTML tags', () => {
      const text = '<p>Hello <strong>world</strong></p>';
      const result = sanitizeText(text);
      expect(result).not.toContain('<');
      expect(result).toContain('Hello world');
    });
  });

  describe('sanitizeUrl', () => {
    it('should allow valid HTTP(S) URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
      expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
    });

    it('should block javascript: URIs', () => {
      expect(sanitizeUrl('javascript:alert("XSS")')).toBe('');
    });

    it('should block data: URIs', () => {
      expect(sanitizeUrl('data:text/html,<script>alert("XSS")</script>')).toBe('');
    });

    it('should allow relative URLs', () => {
      expect(sanitizeUrl('/path/to/resource')).toBe('/path/to/resource');
    });
  });

  describe('sanitizeFilename', () => {
    it('should remove path separators', () => {
      expect(sanitizeFilename('../../../etc/passwd')).toBe('etcpasswd');
      expect(sanitizeFilename('..\\..\\windows\\system32')).toBe('windowssystem32');
    });

    it('should remove null bytes', () => {
      expect(sanitizeFilename('file\0.txt')).toBe('file.txt');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const text = '<script>alert("XSS")</script>';
      const result = escapeHtml(text);
      expect(result).toContain('&lt;');
      expect(result).toContain('&gt;');
      expect(result).toContain('&quot;');
    });
  });
});
