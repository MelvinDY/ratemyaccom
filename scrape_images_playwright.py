#!/usr/bin/env python3
"""
Enhanced image scraper using Playwright for UNSW Sydney student accommodations.
Downloads high-quality images for Kensington Colleges, UNSW Village, and Iglu Kensington.
"""

import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright
import aiohttp
import time

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"

async def download_image(session, url, filename):
    """Download an image from URL to filename."""
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
            if response.status == 200:
                content = await response.read()
                filepath = os.path.join(OUTPUT_DIR, filename)
                with open(filepath, 'wb') as f:
                    f.write(content)
                print(f"✓ Downloaded: {filename} ({len(content)} bytes)")
                return filepath
            else:
                print(f"✗ Failed {filename}: HTTP {response.status}")
                return None
    except Exception as e:
        print(f"✗ Failed {filename}: {e}")
        return None

async def scrape_kensington_colleges(page, session):
    """Scrape images from UNSW Kensington Colleges."""
    print("\n=== UNSW Kensington Colleges ===")
    downloaded = []

    college_pages = [
        'https://www.unsw.edu.au/accommodation/colleges/basser-college',
        'https://www.unsw.edu.au/accommodation/colleges/goldstein-college',
        'https://www.unsw.edu.au/accommodation/colleges/philip-baxter-college',
    ]

    image_count = 0
    for college_url in college_pages:
        if image_count >= 5:
            break

        try:
            await page.goto(college_url, wait_until='networkidle', timeout=30000)
            await asyncio.sleep(2)

            # Get gallery images
            images = await page.eval_on_selector_all('img', '''
                imgs => imgs.map(img => ({
                    src: img.src,
                    alt: img.alt || '',
                    width: img.naturalWidth,
                    height: img.naturalHeight
                })).filter(img =>
                    img.width > 600 &&
                    img.height > 400 &&
                    !img.src.includes('logo') &&
                    !img.src.includes('icon') &&
                    (img.src.includes('.jpg') || img.src.includes('.jpeg') || img.src.includes('.png'))
                )
            ''')

            # Download unique images
            for img in images[:2]:  # Max 2 per college
                if image_count >= 5:
                    break
                image_count += 1
                filename = f"unsw-kensington-colleges-{image_count}.jpg"
                filepath = await download_image(session, img['src'], filename)
                if filepath:
                    downloaded.append({
                        'path': filepath,
                        'description': img['alt'] or 'College view'
                    })
                await asyncio.sleep(0.5)

        except Exception as e:
            print(f"✗ Error scraping {college_url}: {e}")

    return downloaded

async def scrape_unsw_village(page, session):
    """Scrape images from UNSW Village / Campus Living Villages."""
    print("\n=== UNSW Village ===")
    downloaded = []

    try:
        await page.goto('https://www.campuslivingvillages.com/student-accommodation-sydney/unsw-village/',
                       wait_until='networkidle', timeout=30000)
        await asyncio.sleep(3)

        # Get images from the page
        images = await page.eval_on_selector_all('img', '''
            imgs => imgs.map(img => ({
                src: img.src,
                alt: img.alt || '',
                width: img.naturalWidth,
                height: img.naturalHeight
            })).filter(img =>
                img.width > 600 &&
                img.height > 400 &&
                !img.src.includes('logo') &&
                !img.src.includes('icon') &&
                (img.src.includes('.jpg') || img.src.includes('.jpeg') || img.src.includes('.png'))
            )
        ''')

        # Download up to 5 images
        for i, img in enumerate(images[:5], 1):
            filename = f"unsw-village-{i}.jpg"
            filepath = await download_image(session, img['src'], filename)
            if filepath:
                downloaded.append({
                    'path': filepath,
                    'description': img['alt'] or f'UNSW Village view {i}'
                })
            await asyncio.sleep(0.5)

    except Exception as e:
        print(f"✗ Error scraping UNSW Village: {e}")

    return downloaded

async def scrape_iglu_kensington(page, session):
    """Scrape images from Iglu student accommodation."""
    print("\n=== Iglu Kensington ===")
    downloaded = []

    try:
        # Try Iglu's general Sydney pages
        urls = [
            'https://www.iglu.com.au/student-accommodation/sydney/',
            'https://www.iglu.com.au/locations/australia/sydney/kensington/',
        ]

        for url in urls:
            try:
                await page.goto(url, wait_until='networkidle', timeout=30000)
                await asyncio.sleep(3)

                # Get images
                images = await page.eval_on_selector_all('img', '''
                    imgs => imgs.map(img => ({
                        src: img.src,
                        alt: img.alt || '',
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    })).filter(img =>
                        img.width > 600 &&
                        img.height > 400 &&
                        !img.src.includes('logo') &&
                        !img.src.includes('icon') &&
                        (img.src.includes('.jpg') || img.src.includes('.jpeg') || img.src.includes('.png'))
                    )
                ''')

                # Download images
                for i in range(min(5 - len(downloaded), len(images))):
                    filename = f"iglu-kensington-{len(downloaded) + 1}.jpg"
                    filepath = await download_image(session, images[i]['src'], filename)
                    if filepath:
                        downloaded.append({
                            'path': filepath,
                            'description': images[i]['alt'] or f'Iglu accommodation view'
                        })
                    await asyncio.sleep(0.5)

                if len(downloaded) >= 5:
                    break

            except Exception as e:
                print(f"✗ Error with {url}: {e}")
                continue

    except Exception as e:
        print(f"✗ Error scraping Iglu: {e}")

    return downloaded

async def main():
    """Main execution function."""
    # Create output directory
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        async with aiohttp.ClientSession() as session:
            all_downloads = []

            # Scrape all accommodations
            kensington = await scrape_kensington_colleges(page, session)
            all_downloads.extend(kensington)

            village = await scrape_unsw_village(page, session)
            all_downloads.extend(village)

            iglu = await scrape_iglu_kensington(page, session)
            all_downloads.extend(iglu)

        await browser.close()

    # Summary
    print(f"\n{'='*60}")
    print(f"DOWNLOAD SUMMARY")
    print(f"{'='*60}")
    print(f"Total images downloaded: {len(all_downloads)}")
    print(f"\nSuccessfully downloaded files:")
    for item in all_downloads:
        print(f"  - {item['path']}")
        print(f"    Description: {item['description']}")

    return all_downloads

if __name__ == "__main__":
    asyncio.run(main())
