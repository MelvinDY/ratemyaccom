#!/usr/bin/env python3
"""
Download Macquarie University accommodation images.
Pre-identified high-quality images from each accommodation.
"""

import os
import requests
from pathlib import Path
import time

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
}

# Pre-identified high-quality images from each accommodation
IMAGES = {
    'dunmore-lang-college': [
        'https://www.dunmorelangcollege.nsw.edu.au/images/cb5fc575-5673-426f-8773-37290eecc7e3/cropped?width=1600&height=700',
        'https://www.dunmorelangcollege.nsw.edu.au/images/36f54307-5d6c-4407-bc45-df123d9f57e5/cropped?width=1800&height=1014',
        'https://www.dunmorelangcollege.nsw.edu.au/images/4eafb478-782d-4e14-988c-f25e7aa26186/cropped?width=1800&height=1014',
        'https://www.dunmorelangcollege.nsw.edu.au/GetImage.aspx?IDMF=782f6f81-50d8-4948-aaed-02f1195d7e4b&w=1500&h=750&src=mc',
        'https://www.dunmorelangcollege.nsw.edu.au/images/1567dfaf-687d-40d6-ae3d-d0915d55049f/cropped?width=1800&height=1014',
    ],
    'robert-menzies-college': [
        'https://rmc.org.au/wp-content/uploads/2025/08/RMC_MarletingShoot-324Cr-scaled.jpg',
        'https://rmc.org.au/wp-content/uploads/2025/08/RMC_MarletingShoot-22Cr-scaled.jpg',
        'https://rmc.org.au/wp-content/uploads/2024/05/RMC_MarletingShoot-46-scaled.jpg',
        'https://rmc.org.au/wp-content/uploads/2024/05/RMC_MarletingShoot-112-scaled.jpg',
        'https://rmc.org.au/wp-content/uploads/2024/05/RMC_MarletingShoot-220-scaled.jpg',
    ],
    'macquarie-university-village': [
        'https://www.mq.edu.au/__data/assets/image/0010/1342566/varieties/default.jpg',
        'https://www.mq.edu.au/__data/assets/image/0011/1342567/varieties/default.jpg',
        'https://www.mq.edu.au/__data/assets/image/0003/1342569/varieties/default.jpg',
        'https://www.mq.edu.au/__data/assets/image/0004/1342570/varieties/default.jpg',
        'https://www.mq.edu.au/__data/assets/image/0005/1342571/varieties/default.jpg',
    ]
}

def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}\n")

def download_image(url, filepath):
    """Download an image from URL to filepath."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        # Write to file
        with open(filepath, 'wb') as f:
            f.write(response.content)

        # Check file size
        file_size = os.path.getsize(filepath)
        if file_size < 5000:  # Less than 5KB is probably an error
            os.remove(filepath)
            return False, f"File too small ({file_size} bytes)"

        return True, file_size
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return False, str(e)

def main():
    """Main download function."""
    print("=" * 80)
    print("Macquarie University Accommodation Image Downloader")
    print("=" * 80)
    print()

    ensure_output_dir()

    all_downloaded = []
    total_success = 0
    total_failed = 0

    for accom_name, image_urls in IMAGES.items():
        print(f"\n{'=' * 80}")
        print(f"Downloading: {accom_name.replace('-', ' ').title()}")
        print(f"{'=' * 80}\n")

        for idx, img_url in enumerate(image_urls, 1):
            # Determine file extension
            ext = '.jpg'
            if '.png' in img_url.lower():
                ext = '.png'
            elif '.webp' in img_url.lower():
                ext = '.webp'

            filename = f"{accom_name}-{idx}{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)

            # Skip if already exists
            if os.path.exists(filepath):
                file_size = os.path.getsize(filepath)
                print(f"  [{idx}/{len(image_urls)}] ⏭  {filename} (already exists, {file_size:,} bytes)")
                all_downloaded.append(filepath)
                total_success += 1
                continue

            print(f"  [{idx}/{len(image_urls)}] ⬇  Downloading {filename}...")
            success, result = download_image(img_url, filepath)

            if success:
                print(f"            ✓ Success! ({result:,} bytes)")
                all_downloaded.append(filepath)
                total_success += 1
            else:
                print(f"            ✗ Failed: {result}")
                total_failed += 1

            # Be polite - delay between downloads
            time.sleep(0.5)

        time.sleep(1)  # Delay between accommodations

    # Summary
    print(f"\n{'=' * 80}")
    print("DOWNLOAD COMPLETE")
    print(f"{'=' * 80}\n")
    print(f"Total images downloaded: {total_success}")
    print(f"Total failures: {total_failed}")
    print(f"\nSuccessfully downloaded files:\n")

    for path in sorted(all_downloaded):
        file_size = os.path.getsize(path)
        print(f"  ✓ {path} ({file_size:,} bytes)")

    print()
    return all_downloaded

if __name__ == "__main__":
    main()
