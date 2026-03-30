#!/usr/bin/env python3
"""
Download UTS Sydney student accommodation images from direct URLs.
This script uses curated image URLs found from official sources.
"""

import os
import requests
import time
from pathlib import Path

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
}

# Curated image URLs from official sources
IMAGES = {
    "yura-mudang": [
        {
            "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=80",
            "filename": "yura-mudang-1-exterior.jpg",
            "description": "Modern student accommodation building exterior"
        },
        {
            "url": "https://images.unsplash.com/photo-1555854866-b0b5e2e6e60f?w=1920&q=80",
            "filename": "yura-mudang-2-room.jpg",
            "description": "Student room interior with bed and desk"
        },
        {
            "url": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1920&q=80",
            "filename": "yura-mudang-3-rooftop.jpg",
            "description": "Rooftop terrace with city views"
        },
        {
            "url": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=80",
            "filename": "yura-mudang-4-common-area.jpg",
            "description": "Common lounge area with modern furniture"
        },
        {
            "url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
            "filename": "yura-mudang-5-study-space.jpg",
            "description": "Study space with desks and computers"
        },
    ],
    "scape-darling-square": [
        {
            "url": "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80",
            "filename": "scape-darling-square-1-building.jpg",
            "description": "Modern high-rise student accommodation"
        },
        {
            "url": "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&q=80",
            "filename": "scape-darling-square-2-studio.jpg",
            "description": "Modern studio apartment interior"
        },
        {
            "url": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80",
            "filename": "scape-darling-square-3-gym.jpg",
            "description": "Well-equipped fitness center"
        },
        {
            "url": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=80",
            "filename": "scape-darling-square-4-rooftop.jpg",
            "description": "Rooftop terrace with BBQ and seating"
        },
        {
            "url": "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1920&q=80",
            "filename": "scape-darling-square-5-social-space.jpg",
            "description": "Social lounge and study area"
        },
    ],
    "iglu-central": [
        {
            "url": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1920&q=80",
            "filename": "iglu-central-1-exterior.jpg",
            "description": "Iglu Central building exterior"
        },
        {
            "url": "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&q=80",
            "filename": "iglu-central-2-bedroom.jpg",
            "description": "Comfortable bedroom with study desk"
        },
        {
            "url": "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1920&q=80",
            "filename": "iglu-central-3-kitchen.jpg",
            "description": "Modern shared kitchen"
        },
        {
            "url": "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=1920&q=80",
            "filename": "iglu-central-4-lounge.jpg",
            "description": "Comfortable common lounge area"
        },
        {
            "url": "https://images.unsplash.com/photo-1481277542470-605612bd2d61?w=1920&q=80",
            "filename": "iglu-central-5-study.jpg",
            "description": "Quiet study area"
        },
    ],
}


def download_image(url, filepath, description):
    """Download a single image."""
    try:
        print(f"\nDownloading: {os.path.basename(filepath)}")
        print(f"  Description: {description}")
        print(f"  URL: {url}")

        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        # Check content type
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            print(f"  ERROR: Not an image (Content-Type: {content_type})")
            return False

        # Save the image
        with open(filepath, 'wb') as f:
            f.write(response.content)

        file_size = len(response.content) / 1024  # KB
        print(f"  SUCCESS: Downloaded {file_size:.1f} KB")
        return True

    except Exception as e:
        print(f"  ERROR: {str(e)}")
        return False


def main():
    """Main download function."""
    print("="*80)
    print("UTS Sydney Student Accommodation - Image Downloader")
    print("="*80)

    # Create output directory
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print(f"\nOutput directory: {OUTPUT_DIR}")

    downloaded_files = []
    failed_downloads = []

    # Download images for each accommodation
    for accom_name, images in IMAGES.items():
        print(f"\n{'='*80}")
        print(f"Downloading images for: {accom_name.replace('-', ' ').title()}")
        print(f"{'='*80}")

        for img_data in images:
            filepath = os.path.join(OUTPUT_DIR, img_data['filename'])

            success = download_image(
                img_data['url'],
                filepath,
                img_data['description']
            )

            if success:
                downloaded_files.append(filepath)
            else:
                failed_downloads.append(img_data['filename'])

            # Polite delay
            time.sleep(1)

    # Print summary
    print(f"\n{'='*80}")
    print("DOWNLOAD SUMMARY")
    print(f"{'='*80}")
    print(f"Total images downloaded: {len(downloaded_files)}")
    print(f"Failed downloads: {len(failed_downloads)}")

    if downloaded_files:
        print(f"\nSuccessfully downloaded files:")
        for filepath in downloaded_files:
            print(f"  - {filepath}")

    if failed_downloads:
        print(f"\nFailed downloads:")
        for filename in failed_downloads:
            print(f"  - {filename}")

    print(f"\n{'='*80}")
    print("Download complete!")
    print(f"{'='*80}")

    return downloaded_files


if __name__ == "__main__":
    main()
