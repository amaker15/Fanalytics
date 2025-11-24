#!/usr/bin/env python3
#
# Fanalytics - Sports Reference Data Scraper
#
# This script scrapes Baseball-Reference.com and Basketball-Reference.com
# and formats the data for feeding into Qwen AI analysis.
#
# Installation:
# pip install requests beautifulsoup4 pandas lxml pybaseball
#
# Usage:
# python scrape_sports_refs.py --sport baseball --year 2023 --stat-type batting
# python scrape_sports_refs.py --sport basketball --year 2023 --stat-type per_game
#
# @author Fanalytics Team
# @created November 24, 2025
# @license MIT
#

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import argparse
import json
from typing import Dict, Any, Optional
import sys
import os

class SportsReferenceScraper:
    def __init__(self):
        self.session = requests.Session()
        # Set a reasonable user agent
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def scrape_baseball_stats(self, year: int, stat_type: str = 'batting') -> pd.DataFrame:
        """Scrape baseball statistics from Baseball-Reference.com"""
        try:
            # URL patterns for different stat types
            url_patterns = {
                'batting': f'https://www.baseball-reference.com/leagues/majors/{year}-batting-leaders.shtml',
                'pitching': f'https://www.baseball-reference.com/leagues/majors/{year}-pitching-leaders.shtml',
                'fielding': f'https://www.baseball-reference.com/leagues/majors/{year}-fielding-leaders.shtml'
            }

            if stat_type not in url_patterns:
                raise ValueError(f"Unknown stat_type: {stat_type}. Use 'batting', 'pitching', or 'fielding'")

            url = url_patterns[stat_type]
            print(f"Scraping: {url}")

            response = self.session.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Find the main stats table
            table = soup.find('table', {'id': f'{stat_type}_leaders_standard'})
            if not table:
                # Fallback to any table with stats
                table = soup.find('table', class_='stats_table')

            if not table:
                raise ValueError(f"Could not find stats table for {stat_type}")

            # Extract headers
            headers = []
            header_row = table.find('thead').find('tr')
            for th in header_row.find_all('th'):
                headers.append(th.get_text().strip())

            # Extract data rows
            rows = []
            for tr in table.find('tbody').find_all('tr'):
                if tr.get('class') and 'thead' in tr.get('class'):
                    continue  # Skip header rows

                row_data = []
                for td in tr.find_all('td'):
                    row_data.append(td.get_text().strip())

                if row_data:  # Only add non-empty rows
                    rows.append(row_data)

            # Create DataFrame
            df = pd.DataFrame(rows, columns=headers[1:])  # Skip first empty header
            df['Year'] = year
            df['Stat_Type'] = stat_type

            print(f"Successfully scraped {len(df)} {stat_type} records for {year}")
            return df

        except Exception as e:
            print(f"Error scraping baseball stats: {e}")
            return pd.DataFrame()

    def scrape_basketball_stats(self, year: int, stat_type: str = 'per_game') -> pd.DataFrame:
        """Scrape basketball statistics from Basketball-Reference.com"""
        try:
            # URL patterns for different stat types
            url_patterns = {
                'per_game': f'https://www.basketball-reference.com/leagues/NBA_{year}_per_game.html',
                'totals': f'https://www.basketball-reference.com/leagues/NBA_{year}_totals.html',
                'advanced': f'https://www.basketball-reference.com/leagues/NBA_{year}_advanced.html',
                'standings': f'https://www.basketball-reference.com/leagues/NBA_{year}_standings.html'
            }

            if stat_type not in url_patterns:
                raise ValueError(f"Unknown stat_type: {stat_type}. Use 'per_game', 'totals', 'advanced', or 'standings'")

            url = url_patterns[stat_type]
            print(f"Scraping: {url}")

            response = self.session.get(url)
            response.raise_for_status()

            soup = BeautifulSoup(response.content, 'html.parser')

            # Handle standings differently (it's not a player stats table)
            if stat_type == 'standings':
                return self._scrape_basketball_standings(soup, year)

            # Find the main stats table
            table = soup.find('table', {'id': f'per_game_stats'}) or \
                   soup.find('table', {'id': f'totals_stats'}) or \
                   soup.find('table', {'id': f'advanced_stats'})

            if not table:
                # Fallback to any table with stats
                table = soup.find('table', class_='stats_table')

            if not table:
                raise ValueError(f"Could not find stats table for {stat_type}")

            # Extract headers
            headers = []
            header_row = table.find('thead').find('tr')
            for th in header_row.find_all('th'):
                headers.append(th.get_text().strip())

            # Extract data rows
            rows = []
            tbody = table.find('tbody')
            if tbody:
                for tr in tbody.find_all('tr'):
                    if tr.get('class') and 'thead' in tr.get('class'):
                        continue  # Skip header rows

                    row_data = []
                    for td in tr.find_all('td'):
                        row_data.append(td.get_text().strip())

                    if row_data and len(row_data) > 1:  # Only add non-empty rows with data
                        rows.append(row_data)

            # Create DataFrame
            if rows:
                df = pd.DataFrame(rows, columns=headers[1:])  # Skip first empty header
                df['Year'] = year
                df['Stat_Type'] = stat_type
                print(f"Successfully scraped {len(df)} {stat_type} records for {year}")
                return df
            else:
                print(f"No data found for {stat_type} in {year}")
                return pd.DataFrame()

        except Exception as e:
            print(f"Error scraping basketball stats: {e}")
            return pd.DataFrame()

    def _scrape_basketball_standings(self, soup: BeautifulSoup, year: int) -> pd.DataFrame:
        """Scrape NBA standings specifically"""
        try:
            # Find standings tables
            tables = soup.find_all('table', {'id': lambda x: x and x.endswith('_standings')})

            all_standings = []

            for table in tables:
                # Extract headers
                headers = []
                header_row = table.find('thead').find('tr')
                for th in header_row.find_all('th'):
                    headers.append(th.get_text().strip())

                # Extract team rows
                for tr in table.find('tbody').find_all('tr'):
                    row_data = []
                    for td in tr.find_all('td'):
                        row_data.append(td.get_text().strip())

                    if row_data:
                        all_standings.append(row_data)

            if all_standings:
                df = pd.DataFrame(all_standings, columns=headers[1:])
                df['Year'] = year
                df['Stat_Type'] = 'standings'
                return df
            else:
                return pd.DataFrame()

        except Exception as e:
            print(f"Error scraping standings: {e}")
            return pd.DataFrame()

    def format_for_qwen(self, df: pd.DataFrame, context: str = "") -> str:
        """Format DataFrame data for Qwen AI consumption"""
        if df.empty:
            return "No data available"

        # Limit to top 20 rows to avoid token limits
        df_limited = df.head(20)

        # Convert to string format
        data_str = df_limited.to_string(index=False)

        # Add context
        formatted = f"{context}\n\nData:\n{data_str}"

        # Add summary stats if numerical columns exist
        numeric_cols = df_limited.select_dtypes(include=['number']).columns
        if len(numeric_cols) > 0:
            summary = df_limited[numeric_cols].describe()
            formatted += f"\n\nSummary Statistics:\n{summary.to_string()}"

        return formatted

def main():
    parser = argparse.ArgumentParser(description='Scrape sports reference data for Qwen AI')
    parser.add_argument('--sport', choices=['baseball', 'basketball'], required=True,
                       help='Sport to scrape')
    parser.add_argument('--year', type=int, required=True,
                       help='Year to scrape')
    parser.add_argument('--stat-type', required=True,
                       help='Type of stats to scrape')
    parser.add_argument('--output', help='Output file path')
    parser.add_argument('--qwen-format', action='store_true',
                       help='Format output for Qwen AI consumption')

    args = parser.parse_args()

    scraper = SportsReferenceScraper()

    if args.sport == 'baseball':
        df = scraper.scrape_baseball_stats(args.year, args.stat_type)
    elif args.sport == 'basketball':
        df = scraper.scrape_basketball_stats(args.year, args.stat_type)
    else:
        print("Invalid sport")
        sys.exit(1)

    if df.empty:
        print("No data scraped")
        sys.exit(1)

    if args.qwen_format:
        context = f"Historical {args.sport} {args.stat_type} statistics for {args.year}"
        output = scraper.format_for_qwen(df, context)
    else:
        output = df.to_csv(index=False)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output)
        print(f"Data saved to {args.output}")
    else:
        print(output)

if __name__ == '__main__':
    main()
