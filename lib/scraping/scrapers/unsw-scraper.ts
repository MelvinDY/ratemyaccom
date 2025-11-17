/**
 * UNSW Accommodation Scraper
 * Scrapes accommodation data from UNSW Sydney housing pages
 */

import { chromium, Page } from 'playwright';
import { BaseScraper, ScrapedAccommodation, ScraperConfig } from '../base-scraper';
import { prisma } from '@/lib/database/prisma';
import { logger } from '../logger';
import {
  extractText,
  extractTextMultiple,
  extractAllText,
  extractImages,
  extractPrice,
  extractPriceRange,
  parseAustralianAddress,
  extractEmail,
  extractPhone,
  cleanText,
  generateSlug,
  waitForSelector,
  delay,
} from '../utils/helpers';
import { validateAccommodationData, validateAmenities } from '../utils/validation';

interface UNSWAccommodationPage {
  name: string;
  url: string;
}

export class UNSWScraper extends BaseScraper {
  private readonly UNIVERSITY_NAME = 'UNSW Sydney';
  private readonly BASE_URL = 'https://www.unsw.edu.au';

  constructor() {
    const config: ScraperConfig = {
      name: 'unsw-accommodation',
      baseUrl: 'https://www.unsw.edu.au',
      rateLimit: 2000, // 2 seconds between requests
      maxRetries: 3,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
    super(config);
  }

  /**
   * Main scraping logic
   */
  protected async scrape(): Promise<{
    found: number;
    imported: number;
    failed: number;
  }> {
    this.browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const stats = {
      found: 0,
      imported: 0,
      failed: 0,
    };

    try {
      logger.info('Starting UNSW accommodation scraping...');

      // UNSW accommodation properties
      const accommodations: UNSWAccommodationPage[] = [
        {
          name: 'UNSW Village',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/unsw-village',
        },
        {
          name: 'Colombo House',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/colombo-house',
        },
        {
          name: 'Goldstein College',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/goldstein-college',
        },
        {
          name: 'Fig Tree Hall',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/fig-tree-hall',
        },
        {
          name: 'Basser College',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/basser-college',
        },
        {
          name: 'Philip Baxter College',
          url: 'https://www.unsw.edu.au/campus-life/accommodation/philip-baxter-college',
        },
      ];

      for (const accom of accommodations) {
        stats.found++;
        logger.info(`Scraping ${accom.name}...`);

        try {
          const data = await this.scrapeAccommodation(accom);

          if (data) {
            // Validate data
            const validation = validateAccommodationData(data);

            if (validation.success && validation.data) {
              // Import to database
              const result = await this.importAccommodation(validation.data);

              if (result.success) {
                stats.imported++;
                await this.logImport('CREATE', 'SUCCESS', data, validation.data, undefined, result.id);
                logger.info(`✅ Imported: ${accom.name}`);
              } else {
                stats.failed++;
                await this.logImport('ERROR', 'FAILED', data, undefined, result.error);
                logger.error(`❌ Import failed: ${accom.name} - ${result.error}`);
              }
            } else {
              stats.failed++;
              const errors = validation.errors?.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
              await this.logImport('SKIP', 'VALIDATION_ERROR', data, undefined, errors);
              logger.error(`❌ Validation failed: ${accom.name} - ${errors}`);
            }
          } else {
            stats.failed++;
            logger.error(`❌ Failed to extract data: ${accom.name}`);
          }

          // Rate limiting
          await delay(this.config.rateLimit);
        } catch (error) {
          stats.failed++;
          logger.error(`❌ Error scraping ${accom.name}:`, error);
        }
      }
    } finally {
      await this.cleanup();
    }

    return stats;
  }

  /**
   * Scrape a single accommodation
   */
  private async scrapeAccommodation(
    accom: UNSWAccommodationPage
  ): Promise<ScrapedAccommodation | null> {
    const page = await this.browser!.newPage({
      userAgent: this.config.userAgent,
    });

    try {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Navigate to page
      await page.goto(accom.url, {
        waitUntil: 'networkidle',
        timeout: this.config.timeout,
      });

      // Wait for content to load
      await waitForSelector(page, 'main, article, .content', 5000);

      // Extract data
      const data = await this.extractAccommodationData(page);

      await page.close();

      return data ? { ...data, name: accom.name } : null;
    } catch (error) {
      logger.error(`Error scraping ${accom.name}:`, error);
      await page.close();
      return null;
    }
  }

  /**
   * Extract accommodation data from page
   */
  protected async extractAccommodationData(page: Page): Promise<ScrapedAccommodation | null> {
    try {
      const url = page.url();

      // Extract basic information
      const name = await extractTextMultiple(page, [
        'h1',
        '.page-title',
        'header h1',
        '.title',
      ]);

      const description = await this.extractDescription(page);
      const images = await this.extractPageImages(page);
      const amenities = await this.extractAmenities(page);
      const roomTypes = await this.extractRoomTypes(page);
      const pricing = await this.extractPricing(page);
      const contactInfo = await this.extractContactInfo(page);

      // UNSW accommodations are on campus in Kensington
      const address = await this.extractAddress(page, name);
      const suburb = 'Kensington';
      const state = 'NSW';
      const postcode = '2033';

      // Determine accommodation type
      const type = this.determineType(name, description);

      // Get capacity
      const capacity = await this.extractCapacity(page);

      const accommodation: ScrapedAccommodation = {
        name: cleanText(name),
        university: this.UNIVERSITY_NAME,
        address,
        suburb,
        state,
        postcode,
        description: cleanText(description),
        type,
        images,
        priceMin: pricing.min,
        priceMax: pricing.max,
        pricePeriod: pricing.period,
        capacity,
        roomTypes,
        contactInfo,
        amenities: validateAmenities(amenities),
        sourceUrl: url,
      };

      return accommodation;
    } catch (error) {
      logger.error('Error extracting accommodation data:', error);
      return null;
    }
  }

  /**
   * Extract description from page
   */
  private async extractDescription(page: Page): Promise<string> {
    // Try multiple selectors for description
    const selectors = [
      '.description',
      '.overview',
      '.about',
      'article p',
      '.content p',
      'main p',
    ];

    const paragraphs: string[] = [];

    for (const selector of selectors) {
      const texts = await extractAllText(page, selector);
      paragraphs.push(...texts);

      if (paragraphs.join(' ').length > 100) break;
    }

    let description = paragraphs.join(' ');

    // Ensure minimum length
    if (description.length < 50) {
      description = `Student accommodation at UNSW Sydney. ${description}`;
    }

    return description.substring(0, 1000); // Limit length
  }

  /**
   * Extract images from page
   */
  private async extractPageImages(page: Page): Promise<string[]> {
    const images = await extractImages(page, 'img');

    // Filter and convert to absolute URLs
    return images
      .map(img => {
        try {
          return new URL(img, this.BASE_URL).toString();
        } catch {
          return null;
        }
      })
      .filter((img): img is string => img !== null)
      .slice(0, 10); // Limit to 10 images
  }

  /**
   * Extract amenities from page
   */
  private async extractAmenities(page: Page): Promise<string[]> {
    const amenities: string[] = [];

    // Try different selectors for amenities
    const selectors = [
      '.amenity',
      '.facility',
      '.feature',
      '.amenities li',
      '.facilities li',
      '.features li',
      '[class*="amenity"] li',
      '[class*="facility"] li',
    ];

    for (const selector of selectors) {
      const items = await extractAllText(page, selector);
      amenities.push(...items);
    }

    // Common UNSW amenities to look for in text
    const contentText = await page.textContent('body') || '';
    const commonAmenities = [
      'WiFi', 'Gym', 'Study Rooms', 'Laundry', 'Common Kitchen',
      'Parking', 'Security', 'Social Events', 'Meal Plans',
      '24/7 Reception', 'Cleaning Service', 'Air Conditioning',
    ];

    for (const amenity of commonAmenities) {
      if (contentText.toLowerCase().includes(amenity.toLowerCase())) {
        amenities.push(amenity);
      }
    }

    return [...new Set(amenities)]; // Remove duplicates
  }

  /**
   * Extract room types from page
   */
  private async extractRoomTypes(page: Page): Promise<string[]> {
    const roomTypes: string[] = [];

    // Try to find room type information
    const selectors = [
      '.room-type',
      '.accommodation-type',
      '.room-option',
      '[class*="room"] li',
    ];

    for (const selector of selectors) {
      const types = await extractAllText(page, selector);
      roomTypes.push(...types);
    }

    // Look for common room type keywords in content
    const contentText = await page.textContent('body') || '';
    const commonTypes = ['Single', 'Twin Share', 'Studio', 'Shared', 'Ensuite', 'Apartment'];

    for (const type of commonTypes) {
      if (contentText.includes(type)) {
        roomTypes.push(type);
      }
    }

    return roomTypes.length > 0 ? [...new Set(roomTypes)] : ['Single'];
  }

  /**
   * Extract pricing information
   */
  private async extractPricing(page: Page): Promise<{
    min: number;
    max: number;
    period: 'WEEK' | 'MONTH' | 'SEMESTER' | 'YEAR';
  }> {
    // Try to find pricing information
    const priceSelectors = ['.price', '.pricing', '.cost', '.fees', '[class*="price"]'];

    let priceText = '';
    for (const selector of priceSelectors) {
      const text = await extractText(page, selector);
      if (text) {
        priceText += ' ' + text;
      }
    }

    // Also check general content
    const bodyText = await page.textContent('body') || '';
    priceText += ' ' + bodyText;

    // Extract price range
    const range = extractPriceRange(priceText);

    // Determine period
    let period: 'WEEK' | 'MONTH' | 'SEMESTER' | 'YEAR' = 'WEEK';
    if (priceText.toLowerCase().includes('semester')) {
      period = 'SEMESTER';
    } else if (priceText.toLowerCase().includes('year')) {
      period = 'YEAR';
    } else if (priceText.toLowerCase().includes('month')) {
      period = 'MONTH';
    }

    // Default pricing if not found (typical UNSW range)
    return {
      min: range?.min || 300,
      max: range?.max || 600,
      period,
    };
  }

  /**
   * Extract contact information
   */
  private async extractContactInfo(page: Page): Promise<{
    phone?: string;
    email?: string;
    website?: string;
  }> {
    const bodyText = await page.textContent('body') || '';

    const email = extractEmail(bodyText);
    const phone = extractPhone(bodyText);

    return {
      phone: phone || undefined,
      email: email || 'accommodation@unsw.edu.au',
      website: this.BASE_URL + '/campus-life/accommodation',
    };
  }

  /**
   * Extract address
   */
  private async extractAddress(page: Page, name: string): Promise<string> {
    const addressSelectors = ['.address', '[class*="address"]', '[itemprop="address"]'];

    for (const selector of addressSelectors) {
      const address = await extractText(page, selector);
      if (address && address.length > 10) {
        return address;
      }
    }

    // Default address based on name
    return `${name}, Kensington Campus, UNSW Sydney`;
  }

  /**
   * Extract capacity
   */
  private async extractCapacity(page: Page): Promise<number> {
    const text = await page.textContent('body') || '';

    // Look for capacity information
    const match = text.match(/(\d+)\s*(beds?|rooms?|residents?|students?)/i);
    if (match) {
      return parseInt(match[1], 10);
    }

    // Default capacity
    return 200;
  }

  /**
   * Determine accommodation type
   */
  private determineType(
    name: string,
    description: string
  ): 'ON_CAMPUS' | 'OFF_CAMPUS' | 'PRIVATE' | 'COLLEGE' {
    const text = (name + ' ' + description).toLowerCase();

    if (text.includes('college')) {
      return 'COLLEGE';
    }

    return 'ON_CAMPUS';
  }

  /**
   * Import accommodation to database
   */
  private async importAccommodation(
    data: ScrapedAccommodation
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      const slug = generateSlug(data.name);

      // Check for duplicates
      const existing = await prisma.accommodation.findFirst({
        where: {
          OR: [
            { slug },
            {
              AND: [
                { name: { equals: data.name, mode: 'insensitive' } },
                { address: { equals: data.address, mode: 'insensitive' } },
              ],
            },
          ],
        },
      });

      if (existing) {
        logger.info(`Duplicate found: ${data.name}`);
        await this.logImport('SKIP', 'DUPLICATE', data, undefined, 'Duplicate accommodation');
        return { success: false, error: 'Duplicate' };
      }

      // Create accommodation
      const accommodation = await prisma.accommodation.create({
        data: {
          name: data.name,
          slug,
          university: data.university,
          address: data.address,
          suburb: data.suburb,
          state: data.state,
          postcode: data.postcode,
          description: data.description,
          type: data.type,
          images: data.images,
          priceMin: Math.round(data.priceMin),
          priceMax: Math.round(data.priceMax),
          pricePeriod: data.pricePeriod,
          capacity: data.capacity || 200,
          roomTypes: data.roomTypes,
          contactInfo: data.contactInfo as any,
          sourceUrl: data.sourceUrl,
          scrapedAt: new Date(),
          verified: false,
          active: true,
        },
      });

      // Link amenities
      if (data.amenities.length > 0) {
        await this.linkAmenities(accommodation.id, data.amenities);
      }

      return { success: true, id: accommodation.id };
    } catch (error) {
      logger.error('Import error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Link amenities to accommodation
   */
  private async linkAmenities(accommodationId: string, amenityNames: string[]): Promise<void> {
    try {
      // Find matching amenities in database
      const amenities = await prisma.amenity.findMany({
        where: {
          name: {
            in: amenityNames,
          },
        },
      });

      // Create links
      for (const amenity of amenities) {
        await prisma.accommodationAmenity.create({
          data: {
            accommodationId,
            amenityId: amenity.id,
            available: true,
          },
        });
      }

      logger.debug(`Linked ${amenities.length} amenities to accommodation`);
    } catch (error) {
      logger.error('Error linking amenities:', error);
    }
  }
}
