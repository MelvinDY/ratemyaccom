#!/usr/bin/env python3
"""
Web scraper for UTS Sydney student accommodation images.
Downloads high-quality images for Yura Mudang, Scape Darling Square, and Iglu Central.
"""

import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import time
from pathlib import Path
import mimetypes

# Configuration
OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
}

# Accommodation configurations
ACCOMMODATIONS = {
    "yura-mudang": {
        "urls": [
            "https://www.uts.edu.au/current-students/support/uts-housing-service/campus-accommodation/yura-mudang",
            "https://www.uts.edu.au/about/uts-vision/initiatives/city-campus-master-plan/completed-projects/student-housing-tower-yura-mudang",
        ],
        "keywords": ["yura", "mudang", "student", "housing", "uts", "building", "room", "rooftop", "common", "study", "accommodation"],
        "max_images": 5
    },
    "scape-darling-square": {
        "urls": [
            "https://www.scape.com.au/sydney/scape-darling-square/",
        ],
        "keywords": ["darling", "square", "scape", "building", "room", "studio", "apartment", "gym", "rooftop", "lounge", "study"],
        "max_images": 5
    },
    "iglu-central": {
        "urls": [
            "https://iglu.com.au/properties/sydney/central/",
        ],
        "keywords": ["iglu", "central", "building", "room", "studio", "apartment", "kitchen", "lounge", "study", "bedroom"],
        "max_images": 5
    }
}


def ensure_output_dir():
    """Create output directory if it doesn't exist."""
    Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)
    print(f"Output directory: {OUTPUT_DIR}")


def is_valid_image_url(url):
    """Check if URL points to a valid image."""
    if not url:
        return False

    # Skip data URLs, SVGs, icons, and very small images
    skip_patterns = [
        'data:', 'svg', 'icon', 'logo', 'favicon',
        'sprite', 'arrow', 'button', 'banner',
        'thumbnail', 'avatar', 'profile'
    ]

    url_lower = url.lower()
    if any(pattern in url_lower for pattern in skip_patterns):
        return False

    # Check for common image extensions
    valid_extensions = ['.jpg', '.jpeg', '.png', '.webp']
    return any(url_lower.endswith(ext) for ext in valid_extensions)


def get_image_size(img_tag):
    """Estimate image size from tag attributes."""
    width = img_tag.get('width', '0')
    height = img_tag.get('height', '0')

    try:
        # Try to convert to int, handling various formats
        width = int(str(width).replace('px', '').replace('%', ''))
        height = int(str(height).replace('px', '').replace('%', ''))
        return width * height
    except (ValueError, TypeError):
        return 0


def fetch_page(url):
    """Fetch page content with error handling."""
    try:
        print(f"\nFetching: {url}")
        response = requests.get(url, headers=HEADERS, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None


def extract_images_from_page(url, keywords):
    """Extract image URLs from a webpage."""
    html_content = fetch_page(url)
    if not html_content:
        return []

    soup = BeautifulSoup(html_content, 'html.parser')
    image_urls = []

    # Find all img tags
    for img in soup.find_all('img'):
        src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
        if not src:
            continue

        # Make URL absolute
        full_url = urljoin(url, src)

        if not is_valid_image_url(full_url):
            continue

        # Check if image alt text or nearby text matches keywords
        alt_text = (img.get('alt', '') or '').lower()
        img_class = ' '.join(img.get('class', [])).lower()

        # Get parent text for context
        parent_text = img.parent.get_text().lower() if img.parent else ''

        # Calculate relevance score
        score = 0
        for keyword in keywords:
            if keyword in alt_text:
                score += 3
            if keyword in img_class:
                score += 2
            if keyword in parent_text:
                score += 1

        # Add estimated size to score
        size = get_image_size(img)
        if size > 100000:  # Prefer larger images
            score += 5

        image_urls.append({
            'url': full_url,
            'alt': img.get('alt', ''),
            'score': score,
            'size': size
        })

    # Also check for background images in style attributes
    for element in soup.find_all(style=True):
        style = element.get('style', '')
        if 'background-image' in style or 'background:' in style:
            # Extract URL from style
            import re
            urls = re.findall(r'url\(["\']?([^"\'()]+)["\']?\)', style)
            for bg_url in urls:
                full_url = urljoin(url, bg_url)
                if is_valid_image_url(full_url):
                    image_urls.append({
                        'url': full_url,
                        'alt': 'background-image',
                        'score': 2,
                        'size': 0
                    })

    # Sort by score and size
    image_urls.sort(key=lambda x: (x['score'], x['size']), reverse=True)

    return image_urls


def download_image(url, output_path):
    """Download an image from URL to output path."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=15, stream=True)
        response.raise_for_status()

        # Check content type
        content_type = response.headers.get('content-type', '')
        if 'image' not in content_type:
            print(f"  Skipping (not an image): {content_type}")
            return False

        # Check file size (skip very small images)
        content_length = int(response.headers.get('content-length', 0))
        if content_length > 0 and content_length < 10000:  # Less than 10KB
            print(f"  Skipping (too small): {content_length} bytes")
            return False

        # Download and save
        with open(output_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        # Verify file size after download
        file_size = os.path.getsize(output_path)
        if file_size < 10000:
            os.remove(output_path)
            print(f"  Deleted (too small): {file_size} bytes")
            return False

        print(f"  Downloaded: {output_path} ({file_size:,} bytes)")
        return True

    except Exception as e:
        print(f"  Error downloading {url}: {e}")
        if os.path.exists(output_path):
            os.remove(output_path)
        return False


def scrape_accommodation(name, config):
    """Scrape images for a single accommodation."""
    print(f"\n{'='*80}")
    print(f"Scraping: {name.replace('-', ' ').title()}")
    print(f"{'='*80}")

    all_images = []
    downloaded_images = []

    # Collect images from all URLs
    for url in config['urls']:
        images = extract_images_from_page(url, config['keywords'])
        print(f"Found {len(images)} potential images from {url}")
        all_images.extend(images)

    # Remove duplicates
    unique_images = {}
    for img in all_images:
        url = img['url']
        if url not in unique_images or img['score'] > unique_images[url]['score']:
            unique_images[url] = img

    all_images = list(unique_images.values())
    all_images.sort(key=lambda x: (x['score'], x['size']), reverse=True)

    print(f"\nTotal unique images found: {len(all_images)}")
    print(f"Attempting to download top {config['max_images']} images...")

    # Download top images
    downloaded_count = 0
    attempt_count = 0
    max_attempts = min(len(all_images), config['max_images'] * 3)  # Try up to 3x the target

    while downloaded_count < config['max_images'] and attempt_count < max_attempts:
        img_data = all_images[attempt_count]
        attempt_count += 1

        # Generate filename
        ext = '.jpg'  # default
        url_path = urlparse(img_data['url']).path
        if url_path:
            guessed_ext = mimetypes.guess_extension(mimetypes.guess_type(url_path)[0] or '')
            if guessed_ext in ['.jpg', '.jpeg', '.png', '.webp']:
                ext = guessed_ext

        filename = f"{name}-{downloaded_count + 1}{ext}"
        output_path = os.path.join(OUTPUT_DIR, filename)

        print(f"\n[{attempt_count}/{max_attempts}] Downloading image {downloaded_count + 1}/{config['max_images']}...")
        print(f"  URL: {img_data['url']}")
        print(f"  Alt: {img_data['alt'][:50]}..." if len(img_data['alt']) > 50 else f"  Alt: {img_data['alt']}")
        print(f"  Score: {img_data['score']}")

        if download_image(img_data['url'], output_path):
            downloaded_images.append(output_path)
            downloaded_count += 1

        # Be polite - delay between downloads
        time.sleep(1)

    print(f"\n{name}: Successfully downloaded {len(downloaded_images)}/{config['max_images']} images")
    return downloaded_images


def main():
    """Main scraping function."""
    print("UTS Sydney Student Accommodation Image Scraper")
    print("=" * 80)

    ensure_output_dir()

    all_downloaded = []

    for name, config in ACCOMMODATIONS.items():
        try:
            images = scrape_accommodation(name, config)
            all_downloaded.extend(images)
        except Exception as e:
            print(f"\nError scraping {name}: {e}")
            import traceback
            traceback.print_exc()

        # Delay between accommodations
        time.sleep(2)

    # Print summary
    print("\n" + "=" * 80)
    print("SCRAPING COMPLETE")
    print("=" * 80)
    print(f"\nTotal images downloaded: {len(all_downloaded)}")
    print("\nDownloaded files:")
    for path in all_downloaded:
        print(f"  - {path}")

    return all_downloaded


if __name__ == "__main__":
    main()
