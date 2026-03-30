import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Images for the 10 new accommodations
const accommodationImages: {
  slug: string;
  images: string[];
}[] = [
  {
    slug: 'iglu-broadway',
    images: [
      '/images/accommodations/iglu-broadway-1-exterior.jpg',
      '/images/accommodations/iglu-broadway-2-studio.jpg',
      '/images/accommodations/iglu-broadway-3-rooftop.jpg',
      '/images/accommodations/iglu-broadway-4-gym.jpg',
      '/images/accommodations/iglu-broadway-5-common.jpg',
    ],
  },
  {
    slug: 'iglu-redfern',
    images: [
      '/images/accommodations/iglu-redfern-1-exterior.jpg',
      '/images/accommodations/iglu-redfern-3-terrace.jpg',
      '/images/accommodations/iglu-redfern-4-lounge.jpg',
      '/images/accommodations/iglu-redfern-5-common.jpg',
    ],
  },
  {
    slug: 'iglu-chatswood',
    images: [
      '/images/accommodations/iglu-chatswood-1-lobby.jpg',
      '/images/accommodations/iglu-chatswood-2-studio.jpg',
      '/images/accommodations/iglu-chatswood-3-study.jpg',
      '/images/accommodations/iglu-chatswood-4-communal.jpg',
      '/images/accommodations/iglu-chatswood-5-courtyard.jpg',
    ],
  },
  {
    slug: 'scape-university-of-sydney',
    images: [
      '/images/accommodations/scape-usyd-1-exterior.jpg',
      '/images/accommodations/scape-usyd-2-building.jpg',
      '/images/accommodations/scape-usyd-3-study.jpg',
      '/images/accommodations/scape-usyd-4-room.jpg',
    ],
  },
  {
    slug: 'scape-redfern',
    images: [
      '/images/accommodations/scape-redfern-1-exterior.jpg',
      '/images/accommodations/scape-redfern-2-games.jpg',
      '/images/accommodations/scape-redfern-3-social.jpg',
    ],
  },
  {
    slug: 'scape-darling-square',
    images: [
      '/images/accommodations/scape-darling-square-1-exterior.jpg',
      '/images/accommodations/scape-darling-square-1-building.jpg',
      '/images/accommodations/scape-darling-square-2-studio.jpg',
      '/images/accommodations/scape-darling-square-3-gym.jpg',
      '/images/accommodations/scape-darling-square-4-rooftop.jpg',
    ],
  },
  {
    slug: 'scape-quay',
    images: [
      '/images/accommodations/scape-quay-1-exterior.jpg',
      '/images/accommodations/scape-quay-2-building.jpg',
      '/images/accommodations/scape-quay-3-events.jpg',
    ],
  },
  {
    slug: 'scape-kensington',
    images: [
      '/images/accommodations/scape-kensington-1-exterior.jpg',
      '/images/accommodations/scape-kensington-2-games.jpg',
      '/images/accommodations/scape-kensington-3-social.jpg',
    ],
  },
  {
    slug: 'scape-kingsford',
    images: [
      '/images/accommodations/scape-kingsford-1-exterior.jpg',
      '/images/accommodations/scape-kingsford-2-building.jpg',
      '/images/accommodations/scape-kingsford-3-events.jpg',
    ],
  },
  {
    slug: 'scape-lachlan',
    images: [
      '/images/accommodations/scape-lachlan-1-exterior.jpg',
      '/images/accommodations/scape-lachlan-2-hub.jpg',
      '/images/accommodations/scape-lachlan-3-lounge.jpg',
    ],
  },
];

async function updateAccommodationImages() {
  console.log('Updating images for new accommodations...\n');

  for (const data of accommodationImages) {
    try {
      const result = await prisma.accommodation.updateMany({
        where: { slug: data.slug },
        data: {
          images: data.images,
        },
      });

      if (result.count > 0) {
        console.log(`✅ Updated: ${data.slug}`);
        console.log(`   Images: ${data.images.length} images added`);
      } else {
        console.log(`⚠️  Not found: ${data.slug}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${data.slug}:`, error);
    }
  }

  console.log('\n✅ Done updating accommodation images!');
}

updateAccommodationImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
