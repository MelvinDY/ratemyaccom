import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Multiple images per accommodation - based on actual files in public/images/accommodations/
const accommodationImages: {
  name: string;
  images: string[];
}[] = [
  {
    name: 'UNSW Kensington Colleges',
    images: [
      '/images/accommodations/unsw-kensington-colleges-1.jpg',
      '/images/accommodations/unsw-kensington-colleges-2.jpg',
      '/images/accommodations/unsw-kensington-colleges-3.jpg',
      '/images/accommodations/unsw-kensington-colleges-4.jpg',
      '/images/accommodations/unsw-kensington-colleges-5.jpg',
    ],
  },
  {
    name: 'UNSW Village',
    images: [
      '/images/accommodations/unsw-village-1.jpg',
      '/images/accommodations/unsw-village-2.jpg',
      '/images/accommodations/unsw-village-3.jpg',
      '/images/accommodations/unsw-village-4.jpg',
      '/images/accommodations/unsw-village-5.jpg',
    ],
  },
  {
    name: 'Iglu Kensington',
    images: [
      '/images/accommodations/iglu-kensington-1.jpg',
      '/images/accommodations/iglu-kensington-2.jpg',
      '/images/accommodations/iglu-kensington-3.jpg',
      '/images/accommodations/iglu-kensington-4.jpg',
      '/images/accommodations/iglu-kensington-5.jpg',
    ],
  },
  {
    name: "St John's College",
    images: [
      '/images/accommodations/st-johns-college-1.jpg',
      '/images/accommodations/st-johns-college-2.jpg',
      '/images/accommodations/st-johns-college-3.jpg',
      '/images/accommodations/st-johns-college-4.jpg',
      '/images/accommodations/st-johns-college-5.jpg',
    ],
  },
  {
    name: 'Queen Mary Building',
    images: [
      '/images/accommodations/queen-mary-building-1.jpg',
      '/images/accommodations/queen-mary-building-2.jpg',
      '/images/accommodations/queen-mary-building-3.jpg',
      '/images/accommodations/queen-mary-building-4.jpg',
      '/images/accommodations/queen-mary-building-5.jpg',
    ],
  },
  {
    name: 'UniLodge on Broadway',
    images: [
      '/images/accommodations/unilodge-broadway-1.jpg',
      '/images/accommodations/unilodge-broadway-2.jpg',
      '/images/accommodations/unilodge-broadway-3.jpg',
      '/images/accommodations/unilodge-broadway-4.jpg',
      '/images/accommodations/unilodge-broadway-5.jpg',
    ],
  },
  {
    name: 'Yura Mudang (UTS Housing)',
    images: [
      '/images/accommodations/yura-mudang-1-exterior.jpg',
      '/images/accommodations/yura-mudang-2-room.jpg',
      '/images/accommodations/yura-mudang-3-rooftop.jpg',
      '/images/accommodations/yura-mudang-4-common-area.jpg',
      '/images/accommodations/yura-mudang-5-study-space.jpg',
    ],
  },
  {
    name: 'Urbanest Darling House',
    images: [
      '/images/accommodations/scape-darling-square-1-building.jpg',
      '/images/accommodations/scape-darling-square-2-studio.jpg',
      '/images/accommodations/scape-darling-square-3-gym.jpg',
      '/images/accommodations/scape-darling-square-4-rooftop.jpg',
      '/images/accommodations/scape-darling-square-5-social-space.jpg',
    ],
  },
  {
    name: 'Iglu Central',
    images: [
      '/images/accommodations/iglu-central-1-exterior.jpg',
      '/images/accommodations/iglu-central-2-bedroom.jpg',
      '/images/accommodations/iglu-central-3-kitchen.jpg',
      '/images/accommodations/iglu-central-4-lounge.jpg',
      '/images/accommodations/iglu-central-5-study.jpg',
    ],
  },
  {
    name: 'Dunmore Lang College',
    images: [
      '/images/accommodations/dunmore-lang-college-1.jpg',
      '/images/accommodations/dunmore-lang-college-2.jpg',
      '/images/accommodations/dunmore-lang-college-3.jpg',
      '/images/accommodations/dunmore-lang-college-4.jpg',
      '/images/accommodations/dunmore-lang-college-5.jpg',
    ],
  },
  {
    name: 'Robert Menzies College',
    images: [
      '/images/accommodations/robert-menzies-college-1.jpg',
      '/images/accommodations/robert-menzies-college-2.webp',
      '/images/accommodations/robert-menzies-college-3.webp',
      '/images/accommodations/robert-menzies-college-4.webp',
      '/images/accommodations/robert-menzies-college-5.webp',
    ],
  },
  {
    name: 'Macquarie University Village',
    images: [
      '/images/accommodations/macquarie-university-village-1.jpg',
      '/images/accommodations/macquarie-university-village-2.jpg',
      '/images/accommodations/macquarie-university-village-3.jpg',
      '/images/accommodations/macquarie-university-village-4.jpg',
      '/images/accommodations/macquarie-university-village-5.jpg',
    ],
  },
  {
    name: 'WSU Village Parramatta',
    images: [
      '/images/accommodations/wsu-village-parramatta-1.jpg',
      '/images/accommodations/wsu-village-parramatta-2.jpg',
      '/images/accommodations/wsu-village-parramatta-3.jpg',
      '/images/accommodations/wsu-village-parramatta-4.jpg',
      '/images/accommodations/wsu-village-parramatta-5.jpg',
    ],
  },
  {
    name: 'UniLodge @ WSU Bankstown',
    images: [
      '/images/accommodations/wsu-village-bankstown-1.jpg',
      '/images/accommodations/wsu-village-bankstown-2.jpg',
      '/images/accommodations/wsu-village-bankstown-3.jpg',
      '/images/accommodations/wsu-village-bankstown-4.jpg',
      '/images/accommodations/wsu-village-bankstown-5.jpg',
    ],
  },
  {
    name: 'WSU Village Penrith',
    images: [
      '/images/accommodations/wsu-village-penrith-1.jpg',
      '/images/accommodations/wsu-village-penrith-2.jpg',
      '/images/accommodations/wsu-village-penrith-3.jpg',
      '/images/accommodations/wsu-village-penrith-4.jpg',
      '/images/accommodations/wsu-village-penrith-5.jpg',
    ],
  },
];

async function updateAccommodationImages() {
  console.log('Updating accommodation images with 5 images per accommodation...\n');

  for (const data of accommodationImages) {
    try {
      const result = await prisma.accommodation.updateMany({
        where: { name: data.name },
        data: {
          images: data.images,
        },
      });

      if (result.count > 0) {
        console.log(`✅ Updated: ${data.name}`);
        console.log(`   Images: ${data.images.length} images added`);
      } else {
        console.log(`⚠️  Not found: ${data.name}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${data.name}:`, error);
    }
  }

  console.log('\n✅ Done updating accommodation images!');
  console.log('All accommodations now have 5 images for the slideshow.');
}

updateAccommodationImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
