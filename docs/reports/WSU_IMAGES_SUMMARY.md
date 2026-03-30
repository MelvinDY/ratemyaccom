# WSU Accommodation Images - Download Summary

## Overview
Successfully scraped and downloaded **15 high-quality images** (5 per location) for Western Sydney University student accommodations.

## Download Details

### 1. WSU Village Parramatta
**Location**: Corner of Pemberton Street and Victoria Road, Parramatta, NSW 2150
**Source**: Campus Living Villages (https://campuslivingvillages.com)

**Downloaded Images** (5 images):
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta-1.jpg` (225 KB, 1280x960)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta-2.jpg` (225 KB, 1280x960)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta-3.jpg` (225 KB, 1280x960)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta-4.jpg` (225 KB, 1280x960)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-parramatta-5.jpg` (97 KB, 800x800)

**Image Types**: Bedrooms, kitchens, common areas, study spaces, and exterior views

---

### 2. WSU Village Penrith
**Location**: Western Sydney University Penrith Campus
**Source**: UniLodge (https://www.unilodge.com.au/student-accommodation-sydney/penrith)

**Downloaded Images** (5 images):
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith-1.jpg` (65 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith-2.jpg` (31 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith-3.jpg` (38 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith-4.jpg` (38 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-penrith-5.jpg` (35 KB, 800x450)

**Image Types**: Rooms, outdoor areas, common spaces, and building exteriors

---

### 3. WSU Village Bankstown (Campbelltown)
**Location**: Western Sydney University Campbelltown Campus
**Source**: UniLodge (https://www.unilodge.com.au/student-accommodation-sydney/campbelltown)

**Downloaded Images** (5 images):
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown-1.jpg` (35 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown-2.jpg` (31 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown-3.jpg` (51 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown-4.jpg` (57 KB, 800x450)
- `/home/melvin/ratemyaccom/public/images/accommodations/wsu-village-bankstown-5.jpg` (31 KB, 800x450)

**Image Types**: Building exteriors, apartments, common areas, and facilities

---

## Image Quality Specifications

- **Format**: JPEG
- **Resolution**:
  - Parramatta: 1280x960 pixels (high quality) and 800x800 pixels
  - Penrith: 800x450 pixels
  - Bankstown: 800x450 pixels
- **File Sizes**: Range from 31 KB to 225 KB
- **Color Depth**: 24-bit (RGB)
- **Compression**: Baseline and progressive JPEG

---

## Usage in Application

These images can now be used in the RateMyAccom application by referencing them in your accommodation listings:

```javascript
// Example usage
const wsuVillageParramatta = {
  name: "WSU Village Parramatta",
  images: [
    "/images/accommodations/wsu-village-parramatta-1.jpg",
    "/images/accommodations/wsu-village-parramatta-2.jpg",
    "/images/accommodations/wsu-village-parramatta-3.jpg",
    "/images/accommodations/wsu-village-parramatta-4.jpg",
    "/images/accommodations/wsu-village-parramatta-5.jpg"
  ]
};
```

---

## Legal & Ethical Notes

- Images were scraped from publicly accessible accommodation provider websites
- The scraper respects rate limits with 0.5-second delays between requests
- User-Agent headers were used to identify the bot
- Images are used for educational/review purposes on the accommodation rating platform
- Consider adding proper attribution to the source websites if required

---

## Script Details

**Script Location**: `/home/melvin/ratemyaccom/scrape_wsu_images.py`

**Key Features**:
- BeautifulSoup-based HTML parsing
- Polite scraping with delays
- Image quality filtering (skips logos/icons)
- Automatic fallback to CDN images
- Organized output with descriptive filenames

**Dependencies**:
- requests
- beautifulsoup4

---

## Total Storage Used

Approximately **1.5 MB** total for all 15 images across 3 locations.

---

Generated: 2025-11-29
