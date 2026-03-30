#!/usr/bin/env python3
"""
Download accommodation images using Playwright to bypass bot detection.
"""

import os
import asyncio
import requests
from pathlib import Path
from playwright.async_api import async_playwright

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

# Image URLs extracted from browser
IMAGES_TO_DOWNLOAD = {
    'dunmore-lang-college': [
        'https://www.dunmorelangcollege.nsw.edu.au/images/cb5fc575-5673-426f-8773-37290eecc7e3/cropped?width=1600&height=700',  # Join Us
        'https://www.dunmorelangcollege.nsw.edu.au/images/4eafb478-782d-4e14-988c-f25e7aa26186/cropped?width=1800&height=1014',  # All-inclusive fees
        'https://www.dunmorelangcollege.nsw.edu.au/images/36f54307-5d6c-4407-bc45-df123d9f57e5/cropped?width=1800&height=1014',  # Our Rooms
        'https://www.dunmorelangcollege.nsw.edu.au/images/1567dfaf-687d-40d6-ae3d-d0915d55049f/cropped?width=1800&height=1014',  # Scholarships
        'https://www.dunmorelangcollege.nsw.edu.au/images/59b2ef3d-fcb4-46c7-bcf1-9a3d4a4c8687/cropped?width=600&height=338',  # Exchange in Japan
    ],
    'robert-menzies-college': [],
    'macquarie-university-village': []
}

def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

def download_image(url, filepath):
    """Download image from URL."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            f.write(response.content)

        file_size = os.path.getsize(filepath)
        if file_size < 10000:
            os.remove(filepath)
            return False

        print(f"  ✓ Downloaded: {os.path.basename(filepath)} ({file_size:,} bytes)")
        return True
    except Exception as e:
        print(f"  ✗ Error: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return False

async def scrape_with_playwright(accommodation_name, urls):
    """Scrape images using Playwright for a given accommodation."""
    images_found = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        for url in urls:
            try:
                print(f"\n  Visiting: {url}")
                await page.goto(url, wait_until='networkidle', timeout=30000)

                # Extract images
                images = await page.evaluate('''() => {
                    const images = [];
                    document.querySelectorAll('img').forEach(img => {
                        const src = img.src || img.dataset.src || img.dataset.lazySrc;
                        const alt = img.alt || '';
                        const width = img.width || 0;
                        const height = img.height || 0;
                        if (src && width * height > 40000 && !src.includes('data:') &&
                            !src.includes('icon') && !src.includes('logo') && !src.includes('arrow')) {
                            images.push({ src, alt, width, height });
                        }
                    });
                    return images;
                }''')

                for img in images:
                    images_found.append(img['src'])

                print(f"    Found {len(images)} images")

            except Exception as e:
                print(f"    Error: {e}")

        await browser.close()

    return list(set(images_found))[:5]  # Return unique, limit to 5

async def main():
    """Main function."""
    print("Macquarie University Accommodation Image Downloader")
    print("=" * 80)

    ensure_output_dir()

    all_downloaded = []

    # Define accommodations to scrape
    accommodations = {
        'dunmore-lang-college': [
            'https://www.dunmorelangcollege.nsw.edu.au/',
            'https://www.dunmorelangcollege.nsw.edu.au/our-rooms',
            'https://www.dunmorelangcollege.nsw.edu.au/about-us'
        ],
        'robert-menzies-college': [
            'https://rmc.org.au/',
            'https://rmc.org.au/accommodation',
            'https://rmc.org.au/about'
        ],
        'macquarie-university-village': [
            'https://www.mq.edu.au/study/student-life/accommodation/macquarie-university-village'
        ]
    }

    for accom_name, urls in accommodations.items():
        print(f"\n{'='*80}")
        print(f"Scraping: {accom_name.replace('-', ' ').title()}")
        print(f"{'='*80}")

        # Get image URLs using Playwright
        image_urls = await scrape_with_playwright(accom_name, urls)

        # Download images
        print(f"\n  Downloading {len(image_urls)} images...")
        for idx, img_url in enumerate(image_urls, 1):
            ext = '.jpg'
            if '.png' in img_url.lower():
                ext = '.png'
            elif '.webp' in img_url.lower():
                ext = '.webp'

            filename = f"{accom_name}-{idx}{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)

            if download_image(img_url, filepath):
                all_downloaded.append(filepath)

        await asyncio.sleep(2)  # Be polite

    # Summary
    print(f"\n{'='*80}")
    print("DOWNLOAD COMPLETE")
    print(f"{'='*80}")
    print(f"\nTotal images downloaded: {len(all_downloaded)}")
    for path in all_downloaded:
        print(f"  - {path}")

if __name__ == "__main__":
    asyncio.run(main())
