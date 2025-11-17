/**
 * University Website Scraper
 * Scrapes accommodation data from university websites
 */

import { chromium, Page } from 'playwright';
import { BaseScraper, ScrapedAccommodation, ScraperConfig } from '../base-scraper';
import { accommodationRepository } from '@/lib/database/repositories/accommodation.repository';
import { logger } from '../logger';

export class UniversityScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'university-websites',
      baseUrl: '',
      rateLimit: 2000, // 2 seconds between requests
      maxRetries: 3,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
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
      // List of university accommodation pages to scrape
      const universityPages = [
        {
          name: 'University of Sydney',
          url: 'https://www.sydney.edu.au/campus-life/accommodation.html',
        },
        {
          name: 'UNSW Sydney',
          url: 'https://www.unsw.edu.au/life-at-unsw/campus-living',
        },
        {
          name: 'Macquarie University',
          url: 'https://www.mq.edu.au/study/admissions/student-life/accommodation',
        },
        // Add more universities as needed
      ];

      for (const uni of universityPages) {
        logger.info(`Scraping ${uni.name}...`);

        try {
          const page = await this.browser.newPage({
            userAgent: this.config.userAgent,
          });

          await page.setViewportSize({ width: 1920, height: 1080 });

          // Navigate to page with retry logic
          await this.retry(async () => {
            await page.goto(uni.url, {
              waitUntil: 'networkidle',
              timeout: this.config.timeout,
            });
          });

          // Extract accommodation listings
          const accommodations = await this.extractAccommodationListings(page, uni.name);
          stats.found += accommodations.length;

          // Process each accommodation
          for (const accom of accommodations) {
            await this.delay();

            try {
              if (this.validateData(accom)) {
                const normalized = this.normalizeData(accom);
                const result = await this.importAccommodation(normalized);

                if (result.success) {
                  stats.imported++;
                  await this.logImport('CREATE', 'SUCCESS', accom, normalized, undefined, result.id);
                } else {
                  stats.failed++;
                  await this.logImport('ERROR', 'FAILED', accom, undefined, result.error);
                }
              } else {
                stats.failed++;
                await this.logImport('SKIP', 'VALIDATION_ERROR', accom, undefined, 'Validation failed');
              }
            } catch (error) {
              stats.failed++;
              logger.error(`Failed to import ${accom.name}:`, error);
              await this.logImport(
                'ERROR',
                'FAILED',
                accom,
                undefined,
                error instanceof Error ? error.message : 'Unknown error'
              );
            }
          }

          await page.close();
        } catch (error) {
          logger.error(`Failed to scrape ${uni.name}:`, error);
        }
      }
    } finally {
      await this.cleanup();
    }

    return stats;
  }

  /**
   * Extract accommodation listings from a university page
   */
  private async extractAccommodationListings(
    page: Page,
    universityName: string
  ): Promise<ScrapedAccommodation[]> {
    const accommodations: ScrapedAccommodation[] = [];

    // This is a generic implementation - you'll need to customize for each university
    const listings = await page.$$('.accommodation-listing, .residence-card, article');

    for (const listing of listings) {
      try {
        const data = await this.extractAccommodationData(page);
        if (data) {
          accommodations.push({ ...data, university: universityName });
        }
      } catch (error) {
        logger.warn('Failed to extract listing:', error);
      }
    }

    return accommodations;
  }

  /**
   * Extract accommodation data from page
   * This is a template - needs customization per site
   */
  protected async extractAccommodationData(page: Page): Promise<ScrapedAccommodation | null> {
    try {
      // Generic selectors - customize for each university website
      const data: Partial<ScrapedAccommodation> = {
        name: await this.extractText(page, 'h1, .title, .accommodation-name'),
        description: await this.extractText(page, '.description, .about, p'),
        address: await this.extractText(page, '.address, [itemprop="address"]'),
        sourceUrl: page.url(),
        images: await this.extractImages(page),
        contactInfo: {
          phone: await this.extractText(page, '.phone, [href^="tel:"]'),
          email: await this.extractText(page, '.email, [href^="mailto:"]'),
          website: await this.extractText(page, '.website, [href^="http"]'),
        },
        amenities: await this.extractAmenities(page),
        roomTypes: await this.extractRoomTypes(page),
        type: 'on-campus',
        priceMin: 0,
        priceMax: 0,
        pricePeriod: 'week',
        suburb: '',
        state: '',
        postcode: '',
      };

      // Extract pricing
      const priceText = await this.extractText(page, '.price, .pricing, .cost');
      if (priceText) {
        const prices = this.extractPricing(priceText);
        data.priceMin = prices.min;
        data.priceMax = prices.max;
      }

      // Parse address components
      if (data.address) {
        const addressParts = this.parseAddress(data.address);
        data.suburb = addressParts.suburb;
        data.state = addressParts.state;
        data.postcode = addressParts.postcode;
      }

      return data as ScrapedAccommodation;
    } catch (error) {
      logger.error('Failed to extract accommodation data:', error);
      return null;
    }
  }

  /**
   * Helper: Extract text from page
   */
  private async extractText(page: Page, selector: string): Promise<string> {
    try {
      const element = await page.$(selector);
      if (!element) return '';
      return (await element.textContent()) || '';
    } catch {
      return '';
    }
  }

  /**
   * Helper: Extract images from page
   */
  private async extractImages(page: Page): Promise<string[]> {
    try {
      const images = await page.$$eval(
        '.gallery img, .slider img, .accommodation-image',
        (imgs) => imgs.map((img) => (img as HTMLImageElement).src)
      );
      return images.filter(src => this.isValidUrl(src));
    } catch {
      return [];
    }
  }

  /**
   * Helper: Extract amenities
   */
  private async extractAmenities(page: Page): Promise<string[]> {
    try {
      return await page.$$eval(
        '.amenity, .facility, .feature',
        (items) => items.map((item) => item.textContent?.trim() || '')
      );
    } catch {
      return [];
    }
  }

  /**
   * Helper: Extract room types
   */
  private async extractRoomTypes(page: Page): Promise<string[]> {
    try {
      return await page.$$eval(
        '.room-type, .accommodation-type',
        (items) => items.map((item) => item.textContent?.trim() || '')
      );
    } catch {
      return ['Single'];
    }
  }

  /**
   * Helper: Extract pricing from text
   */
  private extractPricing(text: string): { min: number; max: number } {
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return { min: 0, max: 0 };
    }

    const prices = numbers.map(n => parseInt(n, 10));
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }

  /**
   * Helper: Parse address into components
   */
  private parseAddress(address: string): {
    suburb: string;
    state: string;
    postcode: string;
  } {
    // Australian address format: "Street, Suburb State Postcode"
    const match = address.match(/,?\s*([A-Za-z\s]+)\s+(NSW|VIC|QLD|SA|WA|TAS|NT|ACT)\s+(\d{4})/i);

    if (match) {
      return {
        suburb: match[1].trim(),
        state: match[2].toUpperCase(),
        postcode: match[3],
      };
    }

    return {
      suburb: '',
      state: 'NSW',
      postcode: '2000',
    };
  }

  /**
   * Import accommodation into database
   */
  private async importAccommodation(
    data: ScrapedAccommodation
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    try {
      // Check for duplicates
      const existing = await accommodationRepository.findDuplicates(data.name, data.address);

      if (existing) {
        logger.info(`Duplicate found: ${data.name}`);
        return { success: false, error: 'Duplicate' };
      }

      // Generate slug
      const slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Create accommodation
      const accommodation = await accommodationRepository.create({
        name: data.name,
        slug,
        university: data.university,
        address: data.address,
        suburb: data.suburb,
        state: data.state,
        postcode: data.postcode,
        description: data.description,
        type: this.mapAccommodationType(data.type),
        images: data.images,
        priceMin: data.priceMin,
        priceMax: data.priceMax,
        pricePeriod: data.pricePeriod.toUpperCase() as any,
        capacity: data.capacity || 100,
        roomTypes: data.roomTypes,
        contactInfo: data.contactInfo as any,
        sourceUrl: data.sourceUrl,
        scrapedAt: new Date(),
      });

      logger.info(`Imported: ${accommodation.name} (${accommodation.id})`);
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
   * Helper: Map accommodation type
   */
  private mapAccommodationType(type: string): any {
    const mapping: Record<string, string> = {
      'on-campus': 'ON_CAMPUS',
      'off-campus': 'OFF_CAMPUS',
      'private': 'PRIVATE',
      'college': 'COLLEGE',
    };
    return mapping[type] || 'OFF_CAMPUS';
  }
}
