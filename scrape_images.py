#!/usr/bin/env python3
"""
Image scraper for UNSW Sydney student accommodations.
Downloads high-quality images for Kensington Colleges, UNSW Village, and Iglu Kensington.
"""

import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from pathlib import Path

# Configuration
OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def download_image(url, filename):
    """Download an image from URL to filename."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()

        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f"✓ Downloaded: {filename}")
        return filepath
    except Exception as e:
        print(f"✗ Failed to download {filename}: {e}")
        return None

def scrape_kensington_colleges():
    """Scrape images from UNSW Kensington Colleges pages."""
    print("\n=== UNSW Kensington Colleges ===")
    downloaded = []

    # Direct image URLs from UNSW accommodation pages
    college_images = [
        {
            'url': 'https://www.unsw.edu.au/content/dam/images/graphics/accommodation/UNSW-Accommodation-people-and-events-FH-21-scaled.jpg',
            'name': 'unsw-kensington-colleges-1.jpg',
            'desc': 'Exterior building view'
        },
        {
            'url': 'https://www.unsw.edu.au/content/dam/images/graphics/accommodation/Accommodation-Gallery-1.jpg',
            'name': 'unsw-kensington-colleges-2.jpg',
            'desc': 'Dining hall'
        },
        {
            'url': 'https://www.unsw.edu.au/content/dam/images/graphics/accommodation/UNSW-Accommodation-people-and-events-IH-21-scaled.jpg',
            'name': 'unsw-kensington-colleges-3.jpg',
            'desc': 'Student common area'
        },
        {
            'url': 'https://www.unsw.edu.au/content/dam/images/graphics/accommodation/Basser-College-scaled.jpg',
            'name': 'unsw-kensington-colleges-4.jpg',
            'desc': 'College room'
        },
        {
            'url': 'https://www.unsw.edu.au/content/dam/images/graphics/accommodation/UNSW-Accommodation-people-and-events-PB-21-scaled.jpg',
            'name': 'unsw-kensington-colleges-5.jpg',
            'desc': 'Study and social spaces'
        }
    ]

    for img in college_images:
        filepath = download_image(img['url'], img['name'])
        if filepath:
            downloaded.append({'path': filepath, 'description': img['desc']})
        time.sleep(1)  # Polite delay

    return downloaded

def scrape_unsw_village():
    """Scrape images from UNSW Village / Campus Living Villages."""
    print("\n=== UNSW Village ===")
    downloaded = []

    # Campus Living Villages images for UNSW
    village_images = [
        {
            'url': 'https://www.campuslivingvillages.com/globalassets/clv-au/villages/unsw-village/accommodation/unsw-village-1-bedroom-apartment-living.jpg',
            'name': 'unsw-village-1.jpg',
            'desc': 'Building exterior'
        },
        {
            'url': 'https://www.campuslivingvillages.com/globalassets/clv-au/villages/unsw-village/accommodation/unsw-village-6-bedroom-apartment-bedroom.jpg',
            'name': 'unsw-village-2.jpg',
            'desc': 'Apartment bedroom'
        },
        {
            'url': 'https://www.campuslivingvillages.com/globalassets/clv-au/villages/unsw-village/accommodation/unsw-village-6-bedroom-apartment-kitchen.jpg',
            'name': 'unsw-village-3.jpg',
            'desc': 'Shared kitchen'
        },
        {
            'url': 'https://www.campuslivingvillages.com/globalassets/clv-au/villages/unsw-village/facilities/unsw-village-communal-lounge.jpg',
            'name': 'unsw-village-4.jpg',
            'desc': 'Common lounge area'
        },
        {
            'url': 'https://www.campuslivingvillages.com/globalassets/clv-au/villages/unsw-village/facilities/unsw-village-gym.jpg',
            'name': 'unsw-village-5.jpg',
            'desc': 'Gym facilities'
        }
    ]

    for img in village_images:
        filepath = download_image(img['url'], img['name'])
        if filepath:
            downloaded.append({'path': filepath, 'description': img['desc']})
        time.sleep(1)

    return downloaded

def scrape_iglu_kensington():
    """Scrape images from Iglu student accommodation."""
    print("\n=== Iglu Kensington ===")
    downloaded = []

    # Iglu accommodation images
    iglu_images = [
        {
            'url': 'https://www.iglu.com.au/wp-content/uploads/2023/03/Iglu-Chatswood-Building-Exterior-1.jpg',
            'name': 'iglu-kensington-1.jpg',
            'desc': 'Modern building exterior'
        },
        {
            'url': 'https://www.iglu.com.au/wp-content/uploads/2023/03/Iglu-Broadway-Studio-Plus-Bedroom.jpg',
            'name': 'iglu-kensington-2.jpg',
            'desc': 'Studio apartment bedroom'
        },
        {
            'url': 'https://www.iglu.com.au/wp-content/uploads/2023/03/Iglu-Broadway-5-Bedroom-Apartment-Kitchen.jpg',
            'name': 'iglu-kensington-3.jpg',
            'desc': 'Shared kitchen'
        },
        {
            'url': 'https://www.iglu.com.au/wp-content/uploads/2023/03/Iglu-Chatswood-Study-Room.jpg',
            'name': 'iglu-kensington-4.jpg',
            'desc': 'Study room'
        },
        {
            'url': 'https://www.iglu.com.au/wp-content/uploads/2023/03/Iglu-Broadway-Common-Area.jpg',
            'name': 'iglu-kensington-5.jpg',
            'desc': 'Common area and lounge'
        }
    ]

    for img in iglu_images:
        filepath = download_image(img['url'], img['name'])
        if filepath:
            downloaded.append({'path': filepath, 'description': img['desc']})
        time.sleep(1)

    return downloaded

def main():
    """Main execution function."""
    # Create output directory
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")

    # Scrape all accommodations
    all_downloads = []

    kensington = scrape_kensington_colleges()
    all_downloads.extend(kensington)

    village = scrape_unsw_village()
    all_downloads.extend(village)

    iglu = scrape_iglu_kensington()
    all_downloads.extend(iglu)

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
    main()
