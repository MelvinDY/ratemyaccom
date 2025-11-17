/**
 * Scraping Helper Utilities
 * Common functions for data extraction and transformation
 */

import { Page } from 'playwright';

/**
 * Generate URL-friendly slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clean and normalize text
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\r\n\t]/g, ' ')
    .trim();
}

/**
 * Extract price from text
 * Handles formats like "$350", "$350/week", "$350 per week", "from $350"
 */
export function extractPrice(text: string): number | null {
  const cleaned = text.replace(/,/g, '');
  const match = cleaned.match(/\$?(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Extract price range from text
 * Returns { min, max } or null
 * Only considers realistic accommodation prices ($100-$2000 per week)
 */
export function extractPriceRange(text: string): { min: number; max: number } | null {
  const prices: number[] = [];
  const matches = text.matchAll(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g);

  for (const match of matches) {
    const price = parseFloat(match[1].replace(/,/g, ''));
    // Filter out unrealistic prices (phone numbers, IDs, etc.)
    // Student accommodation typically ranges from $100 to $2000 per week
    if (!isNaN(price) && price >= 100 && price <= 2000) {
      prices.push(price);
    }
  }

  if (prices.length === 0) return null;

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Parse Australian address into components
 * Format: "123 Street Name, Suburb State Postcode"
 */
export function parseAustralianAddress(address: string): {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
} | null {
  // Clean up the address
  const cleaned = cleanText(address);

  // Match pattern: "Street, Suburb State Postcode"
  const match = cleaned.match(/^(.+?),\s*(.+?)\s+(NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+(\d{4})$/i);

  if (match) {
    return {
      street: match[1].trim(),
      suburb: match[2].trim(),
      state: match[3].toUpperCase(),
      postcode: match[4],
    };
  }

  // Try alternative pattern: "Suburb State Postcode" (no street)
  const altMatch = cleaned.match(/(.+?)\s+(NSW|VIC|QLD|SA|WA|TAS|ACT|NT)\s+(\d{4})$/i);

  if (altMatch) {
    return {
      street: '',
      suburb: altMatch[1].trim(),
      state: altMatch[2].toUpperCase(),
      postcode: altMatch[3],
    };
  }

  return null;
}

/**
 * Extract text content from element
 */
export async function extractText(
  page: Page,
  selector: string,
  defaultValue: string = ''
): Promise<string> {
  try {
    const element = await page.$(selector);
    if (!element) return defaultValue;
    const text = await element.textContent();
    return cleanText(text) || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Extract text from multiple selectors (returns first found)
 */
export async function extractTextMultiple(
  page: Page,
  selectors: string[],
  defaultValue: string = ''
): Promise<string> {
  for (const selector of selectors) {
    const text = await extractText(page, selector);
    if (text) return text;
  }
  return defaultValue;
}

/**
 * Extract attribute from element
 */
export async function extractAttribute(
  page: Page,
  selector: string,
  attribute: string,
  defaultValue: string = ''
): Promise<string> {
  try {
    const element = await page.$(selector);
    if (!element) return defaultValue;
    const value = await element.getAttribute(attribute);
    return value || defaultValue;
  } catch (error) {
    return defaultValue;
  }
}

/**
 * Extract all text from elements matching selector
 */
export async function extractAllText(page: Page, selector: string): Promise<string[]> {
  try {
    return await page.$$eval(selector, elements =>
      elements
        .map(el => el.textContent?.trim())
        .filter((text): text is string => !!text)
    );
  } catch (error) {
    return [];
  }
}

/**
 * Extract image URLs from page
 */
export async function extractImages(
  page: Page,
  selector: string = 'img'
): Promise<string[]> {
  try {
    const images = await page.$$eval(selector, imgs =>
      imgs
        .map(img => (img as HTMLImageElement).src)
        .filter(src => src && !src.includes('data:image'))
    );

    return images.filter(url => isValidImageUrl(url));
  } catch (error) {
    return [];
  }
}

/**
 * Validate image URL
 */
export function isValidImageUrl(url: string): boolean {
  if (!url) return false;

  try {
    new URL(url);
  } catch {
    return false;
  }

  // Check for valid image extensions
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const hasValidExt = validExtensions.some(ext => url.toLowerCase().includes(ext));

  // Exclude common non-accommodation images
  const excludePatterns = ['logo', 'icon', 'favicon', 'avatar', 'placeholder'];
  const hasExcludedPattern = excludePatterns.some(pattern =>
    url.toLowerCase().includes(pattern)
  );

  return hasValidExt && !hasExcludedPattern;
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Convert relative URL to absolute
 */
export function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return url;
  }
}

/**
 * Wait for selector with timeout
 */
export async function waitForSelector(
  page: Page,
  selector: string,
  timeout: number = 10000
): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scroll to load lazy images
 */
export async function scrollToLoadImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    let currentPosition = 0;

    while (currentPosition < scrollHeight) {
      window.scrollTo(0, currentPosition);
      await new Promise(resolve => setTimeout(resolve, 300));
      currentPosition += viewportHeight;
    }

    // Scroll back to top
    window.scrollTo(0, 0);
  });
}

/**
 * Extract email from text or links
 */
export function extractEmail(text: string): string | null {
  const match = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

/**
 * Extract phone number from text
 */
export function extractPhone(text: string): string | null {
  // Australian phone formats: 02 1234 5678, (02) 1234 5678, +61 2 1234 5678, 1300 123 456
  const patterns = [
    /\+61\s*[2-478]\s*\d{4}\s*\d{4}/, // +61 format
    /\(0[2-478]\)\s*\d{4}\s*\d{4}/, // (02) format
    /0[2-478]\s*\d{4}\s*\d{4}/, // 02 format
    /1[38]00\s*\d{3}\s*\d{3}/, // 1300/1800 format
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].replace(/\s+/g, ' ').trim();
  }

  return null;
}

/**
 * Delay execution for rate limiting
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delayMs = baseDelay * Math.pow(2, attempt);
        await delay(delayMs);
      }
    }
  }

  throw lastError;
}

/**
 * Chunk array into smaller arrays
 */
export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Sanitize text for database storage
 */
export function sanitizeForDatabase(text: string): string {
  return text
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Extract accommodation type from text
 */
export function inferAccommodationType(
  text: string,
  universityName?: string
): 'ON_CAMPUS' | 'OFF_CAMPUS' | 'PRIVATE' | 'COLLEGE' {
  const lowerText = text.toLowerCase();

  // Check for college
  if (lowerText.includes('college') || lowerText.includes('residential college')) {
    return 'COLLEGE';
  }

  // Check for on-campus
  if (
    lowerText.includes('on-campus') ||
    lowerText.includes('on campus') ||
    lowerText.includes('university accommodation') ||
    (universityName && lowerText.includes(universityName.toLowerCase()))
  ) {
    return 'ON_CAMPUS';
  }

  // Check for private
  if (lowerText.includes('private') || lowerText.includes('share house')) {
    return 'PRIVATE';
  }

  // Default to off-campus for purpose-built student accommodation
  return 'OFF_CAMPUS';
}
