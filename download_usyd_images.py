#!/usr/bin/env python3
"""
Download high-quality images for University of Sydney accommodations.
"""

import os
import requests
from pathlib import Path

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
}

# Curated image URLs from manual inspection
IMAGES = {
    "st-johns-college": [
        "https://www.stjohnscollege.edu.au/wp-content/uploads/2018/06/Hintze_StJohns_Hero_1740x1200.jpg",
        "https://www.stjohnscollege.edu.au/wp-content/uploads/2018/06/Bedroom_StJohns_1350x750-1280x640.jpg",
        "https://www.stjohnscollege.edu.au/wp-content/uploads/2018/06/Dining_2_StJohns_1350x750-1280x640.jpg",
        "https://www.stjohnscollege.edu.au/wp-content/uploads/2018/06/Chapel_StJohns_Hero_1740x1200-1280x640.jpg",
        "https://www.stjohnscollege.edu.au/wp-content/uploads/2018/06/Football_StJohns_Hero_1740x1200-1280x640.jpg",
    ],
    "queen-mary-building": [
        "https://image-tc.galaxy.tf/wijpeg-43hcb8t3fkcxmbc4jrdwcpgtf/university-of-sydney-queen-mary-building_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-i9tg4k1wwffr7e4z6s4zl6h/qmb-external_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-40danm2vsba406f64zsf9zso4/qmb-room_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-5pqxfxoq2wfju7onfc7et13yd/qmb-lounge_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-84ktkkcbae29w6yfaahigemg0/qmb-common-kitchens_standard.jpg",
    ],
    "unilodge-broadway": [
        "https://image-tc.galaxy.tf/wijpeg-6os3hk9rfk5aq7jfxhriafohu/unilodge-ultimo_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-6p55rh9svm1t2s7hychbmzl99/common-area_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-c69me0z9yk7n3l3al1f8al24o/ultimo_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-bkxv9sh3xr55s69avp7ix4o29/studio-twin_standard.jpg",
        "https://image-tc.galaxy.tf/wijpeg-207j8ave5ek9367ocl6r77blw/studio-single_standard.jpg",
    ]
}


def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)


def download_image(url, filepath):
    """Download an image from URL to filepath."""
    try:
        print(f"Downloading: {url}")
        response = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        response.raise_for_status()

        with open(filepath, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        file_size = os.path.getsize(filepath)
        print(f"  Saved: {filepath} ({file_size:,} bytes)")
        return True

    except Exception as e:
        print(f"  Error: {e}")
        if os.path.exists(filepath):
            os.remove(filepath)
        return False


def main():
    ensure_output_dir()
    downloaded = []

    print("=" * 80)
    print("Downloading University of Sydney Accommodation Images")
    print("=" * 80)

    for accom_name, urls in IMAGES.items():
        print(f"\n{accom_name.replace('-', ' ').title()}:")
        print("-" * 40)

        for idx, url in enumerate(urls, 1):
            ext = ".jpg" if url.endswith(".jpg") else ".png"
            filename = f"{accom_name}-{idx}{ext}"
            filepath = os.path.join(OUTPUT_DIR, filename)

            if download_image(url, filepath):
                downloaded.append(filepath)

    print("\n" + "=" * 80)
    print(f"Download Complete: {len(downloaded)} images")
    print("=" * 80)

    for path in downloaded:
        print(f"  {path}")

    return downloaded


if __name__ == "__main__":
    main()
