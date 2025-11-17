/**
 * Base Scraper Class
 * Abstract class for implementing web scrapers
 */

import { Browser, Page } from 'playwright';
import { prisma } from '@/lib/database/prisma';
import { Prisma } from '@prisma/client';
import { logger } from '@/lib/scraping/logger';

export interface ScraperConfig {
  name: string;
  baseUrl: string;
  rateLimit: number; // milliseconds between requests
  maxRetries: number;
  timeout: number; // milliseconds
  userAgent?: string;
}

export interface ScrapedAccommodation {
  name: string;
  university: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  description: string;
  type: 'on-campus' | 'off-campus' | 'private' | 'college';
  images: string[];
  priceMin: number;
  priceMax: number;
  pricePeriod: 'week' | 'month' | 'semester' | 'year';
  capacity?: number;
  roomTypes: string[];
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  amenities: string[];
  sourceUrl: string;
}

export abstract class BaseScraper {
  protected config: ScraperConfig;
  protected browser?: Browser;
  protected jobId?: string;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * Initialize browser and start scraping job
   */
  async start(): Promise<void> {
    try {
      // Create scraping job record
      const job = await prisma.scrapingJob.create({
        data: {
          source: this.config.name,
          status: 'RUNNING',
          config: this.config as Prisma.JsonValue,
          startedAt: new Date(),
        },
      });
      this.jobId = job.id;

      logger.info(`Starting scraping job: ${this.config.name} (${this.jobId})`);

      // Run the scraper
      const results = await this.scrape();

      // Update job with results
      await prisma.scrapingJob.update({
        where: { id: this.jobId },
        data: {
          status: 'COMPLETED',
          itemsFound: results.found,
          itemsImported: results.imported,
          itemsFailed: results.failed,
          completedAt: new Date(),
        },
      });

      logger.info(`Scraping job completed: ${results.imported} imported, ${results.failed} failed`);
    } catch (error) {
      logger.error(`Scraping job failed: ${error}`);

      if (this.jobId) {
        await prisma.scrapingJob.update({
          where: { id: this.jobId },
          data: {
            status: 'FAILED',
            errors: { message: error instanceof Error ? error.message : 'Unknown error' },
            completedAt: new Date(),
          },
        });
      }

      throw error;
    }
  }

  /**
   * Main scraping logic - to be implemented by subclasses
   */
  protected abstract scrape(): Promise<{
    found: number;
    imported: number;
    failed: number;
  }>;

  /**
   * Extract data from a single page - to be implemented by subclasses
   */
  protected abstract extractAccommodationData(page: Page): Promise<ScrapedAccommodation | null>;

  /**
   * Validate scraped data
   */
  protected validateData(data: Partial<ScrapedAccommodation>): boolean {
    const required = ['name', 'university', 'address', 'suburb', 'state', 'postcode'];

    for (const field of required) {
      if (!data[field as keyof ScrapedAccommodation]) {
        logger.warn(`Missing required field: ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Normalize scraped data to match database schema
   */
  protected normalizeData(data: ScrapedAccommodation): ScrapedAccommodation {
    return {
      ...data,
      name: this.cleanString(data.name),
      university: this.cleanString(data.university),
      address: this.cleanString(data.address),
      suburb: this.cleanString(data.suburb),
      state: data.state.toUpperCase(),
      postcode: data.postcode.trim(),
      description: this.cleanString(data.description),
      images: data.images.filter(img => this.isValidUrl(img)),
      roomTypes: data.roomTypes.map(rt => this.cleanString(rt)),
    };
  }

  /**
   * Clean string data
   */
  protected cleanString(str: string): string {
    return str
      .replace(/\s+/g, ' ')
      .replace(/[\r\n\t]/g, '')
      .trim();
  }

  /**
   * Validate URL
   */
  protected isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Rate limiting delay
   */
  protected async delay(ms?: number): Promise<void> {
    const delayMs = ms || this.config.rateLimit;
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }

  /**
   * Retry logic for failed operations
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    retries: number = this.config.maxRetries
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        logger.warn(`Retry ${this.config.maxRetries - retries + 1}/${this.config.maxRetries}`);
        await this.delay(2000);
        return this.retry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Log import action
   */
  protected async logImport(
    action: 'CREATE' | 'UPDATE' | 'SKIP' | 'ERROR',
    status: 'SUCCESS' | 'FAILED' | 'DUPLICATE' | 'VALIDATION_ERROR',
    rawData: unknown,
    processedData?: unknown,
    errorMessage?: string,
    entityId?: string
  ): Promise<void> {
    await prisma.dataImportLog.create({
      data: {
        source: this.config.name,
        action,
        entityType: 'accommodation',
        entityId,
        rawData,
        processedData,
        status,
        errorMessage,
      },
    });
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
    }
  }
}
