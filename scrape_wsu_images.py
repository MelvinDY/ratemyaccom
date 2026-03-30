#!/usr/bin/env python3
"""
Script to scrape high-quality images for WSU accommodation listings.
Downloads 3-5 images per location and saves them with descriptive filenames.
"""

import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urljoin, urlparse
import time
from pathlib import Path

# Create output directory
OUTPUT_DIR = Path("/home/melvin/ratemyaccom/public/images/accommodations")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Headers to mimic a browser
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

def download_image(url, filename):
    """Download an image from URL and save it to the output directory."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        filepath = OUTPUT_DIR / filename
        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f"✓ Downloaded: {filename}")
        return str(filepath)
    except Exception as e:
        print(f"✗ Failed to download {filename}: {e}")
        return None

def scrape_clv_parramatta():
    """Scrape images from Campus Living Villages - Parramatta"""
    print("\n=== WSU Village Parramatta ===")
    url = "https://campuslivingvillages.com/australia/sydney/western-sydney-university-village-parramatta/"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        downloaded = []
        img_count = 0

        # Find all images on the page
        images = soup.find_all('img')

        for img in images:
            if img_count >= 5:
                break

            src = img.get('src') or img.get('data-src')
            if not src:
                continue

            # Skip logos, icons, and small images
            if any(skip in src.lower() for skip in ['logo', 'icon', 'svg', 'marker', 'map-point']):
                continue

            # Look for high-quality accommodation images
            if any(keyword in src.lower() for keyword in ['bedroom', 'apartment', 'studio', 'kitchen', 'lounge', 'wsuv', 'pta']):
                full_url = urljoin(url, src)

                # Try to get higher resolution version
                if 'w=' in full_url and 'h=' in full_url:
                    # Replace size parameters with larger dimensions
                    full_url = full_url.split('w=')[0] + 'w=1920,h=1280'

                filename = f"wsu-village-parramatta-{img_count + 1}.jpg"
                filepath = download_image(full_url, filename)

                if filepath:
                    downloaded.append(filepath)
                    img_count += 1
                    time.sleep(0.5)  # Be polite

        return downloaded
    except Exception as e:
        print(f"Error scraping Parramatta: {e}")
        return []

def scrape_unilodge_penrith():
    """Scrape images from UniLodge - Penrith"""
    print("\n=== WSU Village Penrith ===")
    url = "https://www.unilodge.com.au/student-accommodation-sydney/penrith"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        downloaded = []
        img_count = 0

        # Find all images
        images = soup.find_all('img')

        for img in images:
            if img_count >= 5:
                break

            src = img.get('src') or img.get('data-src')
            if not src:
                continue

            # Skip logos and icons
            if any(skip in src.lower() for skip in ['logo', 'icon', 'svg', 'marker']):
                continue

            # Look for accommodation images
            if any(keyword in src.lower() for keyword in ['bedroom', 'apartment', 'studio', 'kitchen', 'lounge', 'penrith', 'accommodation']):
                full_url = urljoin(url, src)
                filename = f"wsu-village-penrith-{img_count + 1}.jpg"
                filepath = download_image(full_url, filename)

                if filepath:
                    downloaded.append(filepath)
                    img_count += 1
                    time.sleep(0.5)

        return downloaded
    except Exception as e:
        print(f"Error scraping Penrith: {e}")
        return []

def scrape_unilodge_campbelltown():
    """Scrape images from UniLodge - Campbelltown (formerly Bankstown)"""
    print("\n=== WSU Village Campbelltown/Bankstown ===")
    url = "https://www.unilodge.com.au/student-accommodation-sydney/campbelltown"

    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        downloaded = []
        img_count = 0

        # Find all images
        images = soup.find_all('img')

        for img in images:
            if img_count >= 5:
                break

            src = img.get('src') or img.get('data-src')
            if not src:
                continue

            # Skip logos and icons
            if any(skip in src.lower() for skip in ['logo', 'icon', 'svg', 'marker']):
                continue

            # Look for accommodation images
            if any(keyword in src.lower() for keyword in ['bedroom', 'apartment', 'studio', 'kitchen', 'lounge', 'campbelltown', 'accommodation']):
                full_url = urljoin(url, src)
                filename = f"wsu-village-bankstown-{img_count + 1}.jpg"
                filepath = download_image(full_url, filename)

                if filepath:
                    downloaded.append(filepath)
                    img_count += 1
                    time.sleep(0.5)

        return downloaded
    except Exception as e:
        print(f"Error scraping Campbelltown: {e}")
        return []

def manual_download_fallback():
    """Manually download known high-quality images from CDNs"""
    print("\n=== Downloading fallback images from CDNs ===")

    # These are high-quality images from accommodation providers
    images_to_download = [
        # Parramatta
        ("https://campuslivingvillages.com/wp-content/uploads/2023/05/WSUV-Parramatta-Bedroom-1.jpg", "wsu-village-parramatta-1.jpg"),
        ("https://campuslivingvillages.com/wp-content/uploads/2023/05/WSUV-Parramatta-Kitchen-1.jpg", "wsu-village-parramatta-2.jpg"),
        ("https://campuslivingvillages.com/wp-content/uploads/2023/05/WSUV-Parramatta-Common-Area-1.jpg", "wsu-village-parramatta-3.jpg"),
        ("https://campuslivingvillages.com/wp-content/uploads/2023/05/WSUV-Parramatta-Study-Space-1.jpg", "wsu-village-parramatta-4.jpg"),
        ("https://campuslivingvillages.com/wp-content/uploads/2023/05/WSUV-Parramatta-Exterior-1.jpg", "wsu-village-parramatta-5.jpg"),

        # Penrith
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Penrith-Bedroom-1.jpg", "wsu-village-penrith-1.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Penrith-Kitchen-1.jpg", "wsu-village-penrith-2.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Penrith-Common-1.jpg", "wsu-village-penrith-3.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Penrith-Study-1.jpg", "wsu-village-penrith-4.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Penrith-Exterior-1.jpg", "wsu-village-penrith-5.jpg"),

        # Bankstown/Campbelltown
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Campbelltown-Bedroom-1.jpg", "wsu-village-bankstown-1.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Campbelltown-Kitchen-1.jpg", "wsu-village-bankstown-2.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Campbelltown-Common-1.jpg", "wsu-village-bankstown-3.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Campbelltown-Study-1.jpg", "wsu-village-bankstown-4.jpg"),
        ("https://www.unilodge.com.au/wp-content/uploads/2023/03/WSU-Campbelltown-Exterior-1.jpg", "wsu-village-bankstown-5.jpg"),
    ]

    downloaded = []
    for url, filename in images_to_download:
        filepath = download_image(url, filename)
        if filepath:
            downloaded.append(filepath)
        time.sleep(0.5)

    return downloaded

def main():
    print("Starting WSU Accommodation Image Scraper")
    print(f"Output directory: {OUTPUT_DIR}")
    print("=" * 60)

    all_downloaded = []

    # Try scraping from actual websites
    all_downloaded.extend(scrape_clv_parramatta())
    all_downloaded.extend(scrape_unilodge_penrith())
    all_downloaded.extend(scrape_unilodge_campbelltown())

    # If scraping didn't work well, use fallback
    if len(all_downloaded) < 10:
        print("\nNote: Using fallback image sources due to limited scraping results...")
        all_downloaded.extend(manual_download_fallback())

    print("\n" + "=" * 60)
    print(f"\nTotal images downloaded: {len(all_downloaded)}")
    print("\nSuccessfully downloaded images:")
    for filepath in all_downloaded:
        print(f"  - {filepath}")

    print(f"\nAll images saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
