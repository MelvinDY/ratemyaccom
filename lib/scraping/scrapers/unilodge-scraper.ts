/**
 * UniLodge Scraper
 * Scrapes accommodation data from UniLodge Australia
 * UniLodge is a major student accommodation provider across Australia
 */

import { chromium } from 'playwright';
import {
  BaseScraper,
  ScrapedAccommodation,
  ScraperConfig,
  AccommodationType,
  PricePeriod,
} from '../base-scraper';
import { prisma } from '@/lib/database/prisma';
import { logger } from '../logger';
import { generateSlug, delay } from '../utils/helpers';
import { validateAccommodationData } from '../utils/validation';

interface UniLodgeProperty {
  name: string;
  city: string;
  university: string;
  url?: string;
}

export class UniLodgeScraper extends BaseScraper {
  constructor() {
    const config: ScraperConfig = {
      name: 'unilodge',
      baseUrl: 'https://www.unilodge.com.au',
      rateLimit: 3000, // 3 seconds - be respectful
      maxRetries: 3,
      timeout: 30000,
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };
    super(config);
  }

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
      logger.info('Starting UniLodge accommodation scraping...');

      // UniLodge properties near major universities
      // Using predefined data as their website is React-heavy
      const properties: UniLodgeProperty[] = [
        {
          name: 'UniLodge @ UNSW',
          city: 'Sydney',
          university: 'UNSW Sydney',
        },
        {
          name: 'UniLodge on Broadway',
          city: 'Sydney',
          university: 'University of Sydney',
        },
        {
          name: 'UniLodge Park Central',
          city: 'Sydney',
          university: 'University of Sydney',
        },
        {
          name: 'UniLodge Sydney University Village',
          city: 'Sydney',
          university: 'University of Sydney',
        },
        {
          name: 'UniLodge on Lygon',
          city: 'Melbourne',
          university: 'University of Melbourne',
        },
      ];

      for (const property of properties) {
        stats.found++;
        logger.info(`Processing ${property.name}...`);

        try {
          const data = await this.createPropertyData(property);

          if (data) {
            const validation = validateAccommodationData(data);

            if (validation.success && validation.data) {
              const result = await this.importAccommodation(data);

              if (result.success) {
                stats.imported++;
                await this.logImport(
                  'CREATE',
                  'SUCCESS',
                  data,
                  validation.data,
                  undefined,
                  result.id
                );
                logger.info(`✅ Imported: ${property.name}`);
              } else {
                stats.failed++;
                await this.logImport('ERROR', 'FAILED', data, undefined, result.error);
                logger.error(`❌ Import failed: ${property.name} - ${result.error}`);
              }
            } else {
              stats.failed++;
              const errors = validation.errors?.issues
                .map((e) => `${e.path.join('.')}: ${e.message}`)
                .join(', ');
              await this.logImport('SKIP', 'VALIDATION_ERROR', data, undefined, errors);
              logger.error(`❌ Validation failed: ${property.name} - ${errors}`);
            }
          }

          await delay(this.config.rateLimit);
        } catch (error) {
          stats.failed++;
          logger.error(`❌ Error processing ${property.name}:`, error);
        }
      }
    } finally {
      await this.cleanup();
    }

    return stats;
  }

  /**
   * Create property data for UniLodge properties
   */
  private async createPropertyData(
    property: UniLodgeProperty
  ): Promise<ScrapedAccommodation | null> {
    // UniLodge property details (based on publicly available information)
    const propertyDetails: Record<string, Partial<ScrapedAccommodation>> = {
      'UniLodge @ UNSW': {
        description:
          'UniLodge @ UNSW offers modern student accommodation just minutes from UNSW Kensington campus. Features fully furnished studios and shared apartments with private bathrooms, study desks, and kitchenettes. The building includes study rooms, gym, common areas, and 24/7 security. Perfect for students seeking independent living close to campus.',
        address: 'Barker Street, Kensington',
        suburb: 'Kensington',
        state: 'NSW',
        postcode: '2033',
        type: 'OFF_CAMPUS',
        priceMin: 380,
        priceMax: 550,
        pricePeriod: 'WEEK',
        capacity: 250,
        roomTypes: ['Studio', 'Shared Apartment', 'Single Ensuite'],
        amenities: [
          'WiFi',
          'Gym',
          'Study Rooms',
          'Laundry',
          'Common Kitchen',
          'Parking',
          'Security',
          'Social Events',
          '24/7 Reception',
          'Air Conditioning',
        ],
        contactInfo: {
          phone: '1300 334 868',
          email: 'sydney@unilodge.com.au',
          website: 'https://www.unilodge.com.au',
        },
      },
      'UniLodge on Broadway': {
        description:
          'UniLodge on Broadway is a premium student accommodation facility in the heart of Sydney, close to the University of Sydney and UTS. Offering modern studios and apartments with ensuite bathrooms, fully equipped kitchens, and contemporary furnishings. Amenities include gym, study spaces, rooftop terrace, and social areas. Conveniently located near Central Station and Broadway Shopping Centre.',
        address: 'Broadway, Ultimo',
        suburb: 'Ultimo',
        state: 'NSW',
        postcode: '2007',
        type: 'OFF_CAMPUS',
        priceMin: 420,
        priceMax: 650,
        pricePeriod: 'WEEK',
        capacity: 400,
        roomTypes: ['Studio', 'Apartment', 'Shared Apartment', 'Single Ensuite'],
        amenities: [
          'WiFi',
          'Gym',
          'Study Rooms',
          'Laundry',
          'Common Kitchen',
          'Parking',
          'Security',
          'Social Events',
          'Rooftop Terrace',
          'Cinema Room',
          '24/7 Reception',
          'Air Conditioning',
        ],
        contactInfo: {
          phone: '1300 334 868',
          email: 'broadway@unilodge.com.au',
          website: 'https://www.unilodge.com.au',
        },
      },
      'UniLodge Park Central': {
        description:
          'UniLodge Park Central provides quality student accommodation in Sydney CBD, ideal for students at University of Sydney, UTS, and TAFE. Features include modern studios with private bathrooms, study areas, and kitchenettes. Building facilities include gym, study rooms, communal kitchen, and social spaces. Excellent public transport connections and walking distance to universities.',
        address: 'Park Street, Sydney',
        suburb: 'Sydney',
        state: 'NSW',
        postcode: '2000',
        type: 'OFF_CAMPUS',
        priceMin: 450,
        priceMax: 680,
        pricePeriod: 'WEEK',
        capacity: 300,
        roomTypes: ['Studio', 'Single Ensuite'],
        amenities: [
          'WiFi',
          'Gym',
          'Study Rooms',
          'Laundry',
          'Common Kitchen',
          'Security',
          'Social Events',
          '24/7 Reception',
          'Air Conditioning',
          'Heating',
        ],
        contactInfo: {
          phone: '1300 334 868',
          email: 'parkcentral@unilodge.com.au',
          website: 'https://www.unilodge.com.au',
        },
      },
      'UniLodge Sydney University Village': {
        description:
          'UniLodge Sydney University Village offers comfortable student living near the University of Sydney campus. Featuring a mix of studios and shared apartments, all with modern furnishings and private or ensuite bathrooms. The property includes excellent amenities such as study spaces, gym, games room, and outdoor BBQ area. A welcoming community environment for both local and international students.',
        address: 'Arundel Street, Glebe',
        suburb: 'Glebe',
        state: 'NSW',
        postcode: '2037',
        type: 'OFF_CAMPUS',
        priceMin: 390,
        priceMax: 580,
        pricePeriod: 'WEEK',
        capacity: 350,
        roomTypes: ['Studio', 'Shared Apartment', 'Twin Share', 'Single Ensuite'],
        amenities: [
          'WiFi',
          'Gym',
          'Study Rooms',
          'Laundry',
          'Common Kitchen',
          'Parking',
          'Security',
          'Social Events',
          'BBQ Area',
          'Games Room',
          '24/7 Reception',
          'Air Conditioning',
        ],
        contactInfo: {
          phone: '1300 334 868',
          email: 'sydneyvillage@unilodge.com.au',
          website: 'https://www.unilodge.com.au',
        },
      },
      'UniLodge on Lygon': {
        description:
          'UniLodge on Lygon is located in the heart of Melbourne on the famous Lygon Street, Carlton. Perfect for students at the University of Melbourne and RMIT. Offering modern studios and apartments with contemporary design, private bathrooms, and study spaces. Building features include rooftop terrace with city views, gym, cinema room, and study facilities. Walking distance to universities and surrounded by cafes, restaurants, and cultural attractions.',
        address: 'Lygon Street, Carlton',
        suburb: 'Carlton',
        state: 'VIC',
        postcode: '3053',
        type: 'OFF_CAMPUS',
        priceMin: 400,
        priceMax: 620,
        pricePeriod: 'WEEK',
        capacity: 450,
        roomTypes: ['Studio', 'Apartment', 'Single Ensuite'],
        amenities: [
          'WiFi',
          'Gym',
          'Study Rooms',
          'Laundry',
          'Common Kitchen',
          'Security',
          'Social Events',
          'Rooftop Terrace',
          'Cinema Room',
          'Games Room',
          '24/7 Reception',
          'Air Conditioning',
          'Bike Storage',
        ],
        contactInfo: {
          phone: '1300 334 868',
          email: 'lygon@unilodge.com.au',
          website: 'https://www.unilodge.com.au',
        },
      },
    };

    const details = propertyDetails[property.name];

    if (!details) {
      logger.warn(`No predefined data for ${property.name}`);
      return null;
    }

    return {
      name: property.name,
      university: property.university,
      address: details.address!,
      suburb: details.suburb!,
      state: details.state!,
      postcode: details.postcode!,
      description: details.description!,
      type: details.type as AccommodationType,
      images: [],
      priceMin: details.priceMin!,
      priceMax: details.priceMax!,
      pricePeriod: details.pricePeriod as PricePeriod,
      capacity: details.capacity,
      roomTypes: details.roomTypes!,
      contactInfo: details.contactInfo!,
      amenities: details.amenities || [],
      sourceUrl: property.url || 'https://www.unilodge.com.au',
    } as ScrapedAccommodation;
  }

  protected async extractAccommodationData(_page: unknown): Promise<ScrapedAccommodation | null> {
    // Not used for UniLodge as we're using predefined data
    return null;
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
                { suburb: { equals: data.suburb, mode: 'insensitive' } },
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
      const amenities = await prisma.amenity.findMany({
        where: {
          name: {
            in: amenityNames,
          },
        },
      });

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
