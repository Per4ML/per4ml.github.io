import argparse
import csv
import json
import re
from pathlib import Path
from html import unescape
from datetime import datetime


CSV_FILE = Path("../contents/news.csv")
JSON_FILE = Path("../contents/news.json")


CATEGORY_MAP = {
    "Paper": "Publication",
    "Publication": "Publication",
    "Grants": "Funding",
    "Grant": "Funding",
    "Funding": "Funding",
    "Award": "Award",
    "Service": "Service",
    "Talk": "Talk",
    "Research": "Research",
    "Others": "News",
    "Other": "News",
}


EMOJI_MAP = {
    "Publication": "📄",
    "Funding": "💰",
    "Award": "🏆",
    "Service": "🎤",
    "Talk": "🎤",
    "Research": "🔬",
    "News": "📰",
}


def clean_html(text):
    if not text:
        return ""

    text = unescape(text)
    text = re.sub(r"<[^>]+>", "", text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"\s+", " ", text)

    return text.strip()


def parse_date(row):
    year_value = row.get("Year", "").strip()

    if year_value:
        try:
            dt = datetime.fromisoformat(
                year_value.replace("Z", "+00:00")
            )
            return dt.strftime("%Y-%m")
        except ValueError:
            pass

    date_text = row.get("Date", "").strip()

    month_map = {
        "jan": "01", "january": "01",
        "feb": "02", "february": "02",
        "mar": "03", "march": "03",
        "apr": "04", "april": "04",
        "may": "05",
        "jun": "06", "june": "06",
        "jul": "07", "july": "07",
        "aug": "08", "august": "08",
        "sep": "09", "sept": "09", "september": "09",
        "oct": "10", "october": "10",
        "nov": "11", "november": "11",
        "dec": "12", "december": "12",
    }

    parts = date_text.replace(",", "").split()

    if len(parts) >= 2:
        month = month_map.get(parts[0].lower())
        year = parts[-1]

        if month and year.isdigit():
            return f"{year}-{month}"

    return ""


def normalize_category(category):
    category = clean_html(category)

    if not category:
        return "News"

    return CATEGORY_MAP.get(category, category)


def make_news_key(item):
    return (
        item["date"].strip().lower(),
        item["headline"].strip().lower(),
    )


def load_existing_news():
    if not JSON_FILE.exists():
        return []

    with JSON_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def row_to_news_item(row):
    headline = clean_html(row.get("Title", ""))
    body = clean_html(row.get("Description", ""))
    date = parse_date(row)

    category = normalize_category(row.get("Category", ""))
    emoji = EMOJI_MAP.get(category, "📰")

    return {
        "date": date,
        "emoji": emoji,
        "category": category,
        "headline": headline,
        "body": body,
    }


def sort_csv_oldest_to_newest():
    """
    Sort news.csv in place so the latest news appears at the very end.
    """

    with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        fieldnames = reader.fieldnames

    rows.sort(
        key=lambda row: parse_date(row)
    )

    with CSV_FILE.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(rows)

    print("Sorted news.csv from oldest to newest.")


def update_news_json():
    existing_news = load_existing_news()

    existing_by_key = {
        make_news_key(item): item
        for item in existing_news
    }

    new_items = []

    with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)

        for row in reader:
            item = row_to_news_item(row)

            if not item["headline"] or not item["body"]:
                continue

            key = make_news_key(item)

            if key not in existing_by_key:
                new_items.append(item)

    merged_news = existing_news + new_items

    # For website display, keep latest news first in JSON.
    merged_news.sort(
        key=lambda item: item.get("date", ""),
        reverse=True
    )

    with JSON_FILE.open("w", encoding="utf-8") as f:
        json.dump(
            merged_news,
            f,
            indent=2,
            ensure_ascii=False
        )

    print(f"Existing news items: {len(existing_news)}")
    print(f"New news items added: {len(new_items)}")
    print(f"Total news items now: {len(merged_news)}")


def main():
    parser = argparse.ArgumentParser(
        description="Update news.json from news.csv."
    )

    parser.add_argument(
        "--sort-csv",
        action="store_true",
        help="Sort news.csv from oldest to newest, so latest news is at the end."
    )

    args = parser.parse_args()

    if args.sort_csv:
        sort_csv_oldest_to_newest()

    update_news_json()


########## python update_news.py
########## or, python update_news.py --sort-csv

if __name__ == "__main__":
    main()
