#!/usr/bin/env python3
"""
Scrape student accommodation data from UNSW colleges, UNSW Village, and Iglu Kensington.
Verify against existing database values.
"""

import requests
from bs4 import BeautifulSoup
import json
import time
from typing import Dict, List, Optional
import re

# Database values to verify against
DB_DATA = {
    "UNSW Kensington Colleges": {
        "weekly_price_min": 450,
        "weekly_price_max": 650,
        "capacity": 550,
        "url": "https://www.unsw.edu.au/accommodation/colleges"
    },
    "UNSW Village": {
        "weekly_price_min": 350,
        "weekly_price_max": 550,
        "capacity": 750,
        "url": "https://www.unswvillage.com.au"
    },
    "Iglu Kensington": {
        "weekly_price_min": 420,
        "weekly_price_max": 680,
        "capacity": 400,
        "url": "https://iglu.com.au/locations/kensington"
    }
}

# List of UNSW colleges to scrape
UNSW_COLLEGES = [
    "basser-college",
    "philip-baxter-college",
    "goldstein-college",
    "fig-tree-hall",
    "colombo-house",
    "unsw-hall",
    "international-house"
]

def scrape_unsw_college(college_slug: str) -> Optional[Dict]:
    """Scrape pricing and details from a specific UNSW college page."""
    url = f"https://www.unsw.edu.au/accommodation/colleges/{college_slug}"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        # Extract college name
        h1 = soup.find('h1')
        college_name = h1.text.strip() if h1 else college_slug.replace('-', ' ').title()

        data = {
            "name": college_name,
            "url": url,
            "room_types": [],
            "prices": [],
            "features": [],
            "contact": {}
        }

        # Find the pricing table
        pricing_table = soup.find('table')
        if pricing_table:
            rows = pricing_table.find_all('tr')[1:]  # Skip header row
            for row in rows:
                cells = row.find_all('td')
                if len(cells) >= 2:
                    room_info = cells[0].get_text(strip=True)

                    # Extract price using regex
                    price_match = re.search(r'\$(\d+(?:\.\d{2})?)\s*p/w', room_info)
                    if price_match:
                        price = float(price_match.group(1))
                        data["prices"].append(price)

                        # Extract room type
                        room_type = room_info.split('$')[0].strip()
                        meals = cells[1].get_text(strip=True) if len(cells) > 1 else ""
                        bathroom = cells[2].get_text(strip=True) if len(cells) > 2 else ""

                        data["room_types"].append({
                            "type": room_type,
                            "price_weekly": price,
                            "meals": meals,
                            "bathroom": bathroom
                        })

        # Extract features
        features_section = soup.find('h3', string=re.compile(r'Features', re.I))
        if features_section:
            features_div = features_section.find_next('div')
            if features_div:
                feature_items = features_div.find_all('li')
                data["features"] = [item.get_text(strip=True) for item in feature_items]

        # Extract contract period info
        contract_info = soup.find(string=re.compile(r'contract period', re.I))
        if contract_info:
            parent = contract_info.find_parent()
            if parent:
                data["contract_info"] = parent.get_text(strip=True)

        # Calculate price range
        if data["prices"]:
            data["price_min"] = min(data["prices"])
            data["price_max"] = max(data["prices"])

        return data

    except Exception as e:
        print(f"Error scraping {college_slug}: {str(e)}")
        return None

def scrape_unsw_village() -> Optional[Dict]:
    """Scrape pricing from UNSW Village website."""
    url = "https://www.unswvillage.com.au"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        data = {
            "name": "UNSW Village",
            "url": url,
            "room_types": [],
            "prices": [],
            "contact": {}
        }

        # Look for pricing information
        # This site may have pricing in various formats, we'll extract what we can
        price_elements = soup.find_all(string=re.compile(r'\$\d+'))
        for elem in price_elements:
            price_match = re.findall(r'\$(\d+)', elem)
            for price in price_match:
                try:
                    data["prices"].append(float(price))
                except:
                    pass

        # Look for contact info
        email = soup.find('a', href=re.compile(r'mailto:'))
        if email:
            data["contact"]["email"] = email.get('href').replace('mailto:', '')

        phone = soup.find(string=re.compile(r'\d{4}\s?\d{3}\s?\d{3}'))
        if phone:
            data["contact"]["phone"] = re.search(r'\d{4}\s?\d{3}\s?\d{3}', phone).group()

        if data["prices"]:
            data["price_min"] = min(data["prices"])
            data["price_max"] = max(data["prices"])

        return data

    except Exception as e:
        print(f"Error scraping UNSW Village: {str(e)}")
        return None

def scrape_iglu_kensington() -> Optional[Dict]:
    """Scrape pricing from Iglu Kensington website."""
    url = "https://iglu.com.au/locations/kensington"

    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }

    try:
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        data = {
            "name": "Iglu Kensington",
            "url": url,
            "room_types": [],
            "prices": [],
            "contact": {}
        }

        # Look for pricing information
        price_elements = soup.find_all(string=re.compile(r'\$\d+'))
        for elem in price_elements:
            # Extract weekly prices
            if 'week' in elem.lower() or 'pw' in elem.lower():
                price_match = re.findall(r'\$(\d+)', elem)
                for price in price_match:
                    try:
                        data["prices"].append(float(price))
                    except:
                        pass

        # Look for contact info
        email = soup.find('a', href=re.compile(r'mailto:'))
        if email:
            data["contact"]["email"] = email.get('href').replace('mailto:', '')

        phone = soup.find(string=re.compile(r'\d{4}\s?\d{3}\s?\d{3}'))
        if phone:
            data["contact"]["phone"] = re.search(r'\d{4}\s?\d{3}\s?\d{3}', phone).group()

        if data["prices"]:
            data["price_min"] = min(data["prices"])
            data["price_max"] = max(data["prices"])

        return data

    except Exception as e:
        print(f"Error scraping Iglu Kensington: {str(e)}")
        return None

def compare_with_db(scraped_data: Dict, db_key: str) -> Dict:
    """Compare scraped data with database values."""
    db_values = DB_DATA.get(db_key, {})

    comparison = {
        "accommodation": db_key,
        "status": "UNKNOWN",
        "database_values": db_values,
        "scraped_values": scraped_data,
        "discrepancies": []
    }

    if scraped_data and "price_min" in scraped_data and "price_max" in scraped_data:
        db_min = db_values.get("weekly_price_min", 0)
        db_max = db_values.get("weekly_price_max", 0)

        scraped_min = scraped_data["price_min"]
        scraped_max = scraped_data["price_max"]

        # Check if prices are within reasonable range (±10%)
        min_diff = abs(scraped_min - db_min) / db_min * 100 if db_min > 0 else 0
        max_diff = abs(scraped_max - db_max) / db_max * 100 if db_max > 0 else 0

        if min_diff > 10:
            comparison["discrepancies"].append(
                f"Minimum price: DB=${db_min}/week, Actual=${scraped_min}/week (diff: {min_diff:.1f}%)"
            )

        if max_diff > 10:
            comparison["discrepancies"].append(
                f"Maximum price: DB=${db_max}/week, Actual=${scraped_max}/week (diff: {max_diff:.1f}%)"
            )

        if len(comparison["discrepancies"]) == 0:
            comparison["status"] = "VERIFIED"
        else:
            comparison["status"] = "DISCREPANCY"
    else:
        comparison["status"] = "NO_DATA"
        comparison["discrepancies"].append("Could not extract pricing information from website")

    return comparison

def main():
    """Main scraping function."""
    print("=" * 80)
    print("STUDENT ACCOMMODATION DATA VERIFICATION - SYDNEY")
    print("=" * 80)
    print()

    results = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "colleges": [],
        "comparisons": []
    }

    # Scrape UNSW Colleges
    print("1. UNSW KENSINGTON COLLEGES")
    print("-" * 80)

    all_college_prices = []
    for college_slug in UNSW_COLLEGES:
        print(f"Scraping {college_slug}...")
        data = scrape_unsw_college(college_slug)
        if data:
            results["colleges"].append(data)
            if data.get("prices"):
                all_college_prices.extend(data["prices"])
            print(f"  ✓ {data['name']}: Found {len(data.get('room_types', []))} room types")
            if data.get("price_min"):
                print(f"    Price range: ${data['price_min']:.2f} - ${data['price_max']:.2f} per week")
        time.sleep(1)  # Polite delay

    # Compare UNSW Colleges aggregate
    if all_college_prices:
        kensington_data = {
            "price_min": min(all_college_prices),
            "price_max": max(all_college_prices),
            "colleges_scraped": len(results["colleges"])
        }
        comparison = compare_with_db(kensington_data, "UNSW Kensington Colleges")
        results["comparisons"].append(comparison)

        print(f"\nKensington Colleges Summary:")
        print(f"  Database: ${DB_DATA['UNSW Kensington Colleges']['weekly_price_min']}-${DB_DATA['UNSW Kensington Colleges']['weekly_price_max']}/week")
        print(f"  Actual:   ${kensington_data['price_min']:.2f}-${kensington_data['price_max']:.2f}/week")
        print(f"  Status:   {comparison['status']}")

    print()

    # Scrape UNSW Village
    print("2. UNSW VILLAGE")
    print("-" * 80)
    village_data = scrape_unsw_village()
    if village_data:
        comparison = compare_with_db(village_data, "UNSW Village")
        results["comparisons"].append(comparison)
        print(f"  Status: {comparison['status']}")
        if village_data.get("price_min"):
            print(f"  Price range: ${village_data['price_min']:.2f} - ${village_data['price_max']:.2f} per week")
    print()

    # Scrape Iglu Kensington
    print("3. IGLU KENSINGTON")
    print("-" * 80)
    iglu_data = scrape_iglu_kensington()
    if iglu_data:
        comparison = compare_with_db(iglu_data, "Iglu Kensington")
        results["comparisons"].append(comparison)
        print(f"  Status: {comparison['status']}")
        if iglu_data.get("price_min"):
            print(f"  Price range: ${iglu_data['price_min']:.2f} - ${iglu_data['price_max']:.2f} per week")
    print()

    # Save results
    output_file = "/home/melvin/ratemyaccom/accommodation_verification.json"
    with open(output_file, 'w') as f:
        json.dump(results, indent=2, fp=f)

    print("=" * 80)
    print(f"Results saved to: {output_file}")
    print("=" * 80)

    # Print summary
    print("\nSUMMARY:")
    print("-" * 80)
    for comp in results["comparisons"]:
        print(f"\n{comp['accommodation']}:")
        print(f"  Status: {comp['status']}")
        if comp["discrepancies"]:
            print("  Discrepancies:")
            for disc in comp["discrepancies"]:
                print(f"    - {disc}")

if __name__ == "__main__":
    main()
