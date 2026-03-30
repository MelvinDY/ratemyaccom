#!/usr/bin/env python3
"""
Download UNSW Village images using direct approach.
"""

import requests
import os

OUTPUT_DIR = "/home/melvin/ratemyaccom/public/images/accommodations"
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

# Using high-quality, royalty-free images from Unsplash that represent student accommodation
# These are properly licensed for use
images = [
    {
        'url': 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
        'filename': 'unsw-village-1.jpg',
        'desc': 'Modern student apartment building exterior'
    },
    {
        'url': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
        'filename': 'unsw-village-2.jpg',
        'desc': 'Contemporary student apartment bedroom'
    },
    {
        'url': 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?w=1200&q=80',
        'filename': 'unsw-village-3.jpg',
        'desc': 'Modern shared kitchen in student accommodation'
    },
    {
        'url': 'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=1200&q=80',
        'filename': 'unsw-village-4.jpg',
        'desc': 'Student common area and lounge'
    },
    {
        'url': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
        'filename': 'unsw-village-5.jpg',
        'desc': 'Gym and fitness facilities'
    },
]

print("=== Downloading UNSW Village Images ===\n")

downloaded = []
for img in images:
    try:
        response = requests.get(img['url'], headers=HEADERS, timeout=15)
        response.raise_for_status()

        filepath = os.path.join(OUTPUT_DIR, img['filename'])
        with open(filepath, 'wb') as f:
            f.write(response.content)

        print(f"✓ Downloaded: {img['filename']} ({len(response.content)} bytes)")
        print(f"  Description: {img['desc']}")
        downloaded.append(filepath)
    except Exception as e:
        print(f"✗ Failed {img['filename']}: {e}")

print(f"\n{'='*60}")
print(f"Successfully downloaded {len(downloaded)} images for UNSW Village")
print(f"{'='*60}")

for path in downloaded:
    print(f"  {path}")
