/**
 * Accommodation Data Importer
 * Handles importing accommodation data from various sources with validation
 */

import { prisma } from '@/lib/database/prisma';
import { accommodationRepository } from '@/lib/database/repositories/accommodation.repository';
import { Prisma, AccommodationType, PricePeriod } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const AccommodationImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  university: z.string().min(1, 'University is required'),
  address: z.string().min(1, 'Address is required'),
  suburb: z.string().min(1, 'Suburb is required'),
  state: z.string().length(3, 'State must be 3 characters (NSW, VIC, etc)'),
  postcode: z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  type: z.enum(['on-campus', 'off-campus', 'private', 'college']),
  images: z.array(z.string().url()).default([]),
  priceMin: z.number().positive('Price must be positive'),
  priceMax: z.number().positive('Price must be positive'),
  pricePeriod: z.enum(['week', 'month', 'semester', 'year']).default('week'),
  capacity: z.number().positive().optional(),
  roomTypes: z.array(z.string()).default([]),
  contactInfo: z
    .object({
      phone: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().url().optional(),
    })
    .default({}),
  amenities: z.array(z.string()).default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  sourceUrl: z.string().url().optional(),
});

export type AccommodationImportData = z.infer<typeof AccommodationImportSchema>;

export interface ImportResult {
  success: boolean;
  action: 'created' | 'updated' | 'skipped' | 'error';
  id?: string;
  errors?: string[];
  message?: string;
}

export class AccommodationImporter {
  /**
   * Import single accommodation
   */
  async importOne(data: AccommodationImportData): Promise<ImportResult> {
    try {
      // Validate data
      const validationResult = AccommodationImportSchema.safeParse(data);

      if (!validationResult.success) {
        const errors = validationResult.error.issues.map(
          (e: any) => `${e.path.join('.')}: ${e.message}`
        );
        await this.logImport('ERROR', 'VALIDATION_ERROR', data, undefined, errors.join(', '));
        return {
          success: false,
          action: 'error',
          errors,
        };
      }

      const validated = validationResult.data;

      // Check for duplicates
      const existing = await accommodationRepository.findDuplicates(
        validated.name,
        validated.address
      );

      if (existing) {
        await this.logImport('SKIP', 'DUPLICATE', data, undefined, 'Duplicate found');
        return {
          success: false,
          action: 'skipped',
          message: 'Duplicate accommodation found',
        };
      }

      // Generate slug
      const slug = this.generateSlug(validated.name);

      // Prepare data for database
      const accommodationData: Prisma.AccommodationCreateInput = {
        name: validated.name,
        slug,
        university: validated.university,
        address: validated.address,
        suburb: validated.suburb,
        state: validated.state,
        postcode: validated.postcode,
        ...(validated.latitude !== undefined ? { latitude: validated.latitude } : {}),
        ...(validated.longitude !== undefined ? { longitude: validated.longitude } : {}),
        description: validated.description,
        type: this.mapAccommodationType(validated.type),
        images: validated.images,
        priceMin: validated.priceMin,
        priceMax: validated.priceMax,
        pricePeriod: validated.pricePeriod.toUpperCase() as PricePeriod,
        capacity: validated.capacity || 100,
        roomTypes: validated.roomTypes,
        contactInfo: validated.contactInfo as any,
        ...(validated.sourceUrl ? { sourceUrl: validated.sourceUrl } : {}),
        scrapedAt: new Date(),
      };

      // Create accommodation
      const accommodation = await accommodationRepository.create(accommodationData);

      // Create amenities if provided
      if (validated.amenities.length > 0) {
        await this.createAmenities(accommodation.id, validated.amenities);
      }

      await this.logImport(
        'CREATE',
        'SUCCESS',
        data,
        accommodationData,
        undefined,
        accommodation.id
      );

      return {
        success: true,
        action: 'created',
        id: accommodation.id,
        message: `Successfully imported ${accommodation.name}`,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logImport('ERROR', 'FAILED', data, undefined, errorMessage);

      return {
        success: false,
        action: 'error',
        errors: [errorMessage],
      };
    }
  }

  /**
   * Import multiple accommodations
   */
  async importMany(dataArray: AccommodationImportData[]): Promise<{
    total: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    results: ImportResult[];
  }> {
    const results: ImportResult[] = [];
    const stats = {
      total: dataArray.length,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      results,
    };

    for (const data of dataArray) {
      const result = await this.importOne(data);
      results.push(result);

      switch (result.action) {
        case 'created':
          stats.created++;
          break;
        case 'updated':
          stats.updated++;
          break;
        case 'skipped':
          stats.skipped++;
          break;
        case 'error':
          stats.failed++;
          break;
      }

      // Add delay to avoid overwhelming the database
      await this.delay(100);
    }

    return stats;
  }

  /**
   * Import from JSON file
   */
  async importFromJSON(
    filePath: string
  ): Promise<ReturnType<typeof this.importMany> | ImportResult> {
    const fs = await import('fs/promises');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    if (Array.isArray(data)) {
      return this.importMany(data);
    } else {
      return this.importOne(data);
    }
  }

  /**
   * Import from CSV file
   */
  async importFromCSV(_filePath: string): Promise<ReturnType<typeof this.importMany>> {
    // TODO: Implement CSV parsing
    // You can use libraries like 'csv-parse' or 'papaparse'
    throw new Error('CSV import not yet implemented');
  }

  /**
   * Create amenities for accommodation
   */
  private async createAmenities(accommodationId: string, amenityNames: string[]): Promise<void> {
    for (const amenityName of amenityNames) {
      // Find or create amenity
      let amenity = await prisma.amenity.findFirst({
        where: {
          name: {
            equals: amenityName,
            mode: 'insensitive',
          },
        },
      });

      if (!amenity) {
        amenity = await prisma.amenity.create({
          data: {
            name: amenityName,
          },
        });
      }

      // Create junction record
      await prisma.accommodationAmenity
        .create({
          data: {
            accommodationId,
            amenityId: amenity.id,
            available: true,
          },
        })
        .catch(() => {
          // Ignore if already exists
        });
    }
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Map accommodation type to Prisma enum
   */
  private mapAccommodationType(type: string): AccommodationType {
    const mapping: Record<string, AccommodationType> = {
      'on-campus': 'ON_CAMPUS',
      'off-campus': 'OFF_CAMPUS',
      private: 'PRIVATE',
      college: 'COLLEGE',
    };
    return mapping[type] || 'OFF_CAMPUS';
  }

  /**
   * Log import action
   */
  private async logImport(
    action: 'CREATE' | 'UPDATE' | 'SKIP' | 'ERROR',
    status: 'SUCCESS' | 'FAILED' | 'DUPLICATE' | 'VALIDATION_ERROR',
    rawData: unknown,
    processedData?: unknown,
    errorMessage?: string,
    entityId?: string
  ): Promise<void> {
    await prisma.dataImportLog.create({
      data: {
        source: 'manual-import',
        action,
        entityType: 'accommodation',
        ...(entityId ? { entityId } : {}),
        rawData: rawData as any,
        processedData: processedData as any,
        status,
        ...(errorMessage ? { errorMessage } : {}),
      },
    });
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const accommodationImporter = new AccommodationImporter();
