import csv
import json
import re
import os
from pathlib import Path


CSV_FILE = "../contents/Rsearch+Projects2.csv"
JSON_FILE = "../contents/projects.json"


def slugify(text):
    """
    Convert title to URL-safe id:
    'Few-Shot Transfer Learning for Performance'
    -> 'few-shot-transfer-learning-for-performance'
    """
    text = text.lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def image_name_from_title(title):
    """
    Creates image path:
    PerfGen -> images/projects/perfgen.png
    """
    slug = slugify(title)

    # shorten if too long
    words = slug.split("-")

    if len(words) > 4:
        slug = "-".join(words[:4])

    return f"images/projects/{slug}.png"


def infer_tags(text):
    """
    Extract rough tags from project title + description.

    Extend this dictionary over time.
    """

    keyword_map = {
        "hpc": "HPC",
        "machine learning": "Machine Learning",
        "deep learning": "Deep Learning",
        "few-shot": "Few-Shot Learning",
        "transfer": "Transfer Learning",
        "performance": "Performance",
        "reproducibility": "Reproducibility",
        "genai": "GenAI",
        "llm": "LLM",
        "gan": "GAN",
        "checkpoint": "Fault Tolerance",
        "cache": "Cache Analysis",
        "compiler": "Compilers",
        "energy": "Energy",
        "optimization": "Optimization",
        "prediction": "Prediction"
    }

    text = text.lower()

    tags = []

    for key, val in keyword_map.items():
        if key in text:
            tags.append(val)

    if not tags:
        tags.append("Research")

    return sorted(list(set(tags)))


def load_existing_json():

    if not os.path.exists(JSON_FILE):
        return {}

    with open(JSON_FILE, "r") as f:
        data = json.load(f)

    return {p["id"]: p for p in data}


existing_projects = load_existing_json()

updated_projects = []


with open(CSV_FILE, newline='', encoding='utf-8-sig') as csvfile:

    reader = csv.DictReader(csvfile)

    for row in reader:

        title = row["Title"].strip()

        abstract = row["Description"].strip()

        project_id = slugify(title)

        generated = {
            "id": project_id,
            "title": title,
            "abstract": abstract,
            "image": image_name_from_title(title),
            "tags": infer_tags(
                title + " " + abstract
            ),
            "url": row["link"].strip(),
            "featured": True,
            "active": True
        }

        #
        # Preserve manual edits
        #

        if project_id in existing_projects:

            old = existing_projects[project_id]

            merged = {
                **generated,

                # preserve these if manually changed
                "image": old.get(
                    "image",
                    generated["image"]
                ),

                "url": old.get(
                    "url",
                    generated["url"]
                ),

                "featured": old.get(
                    "featured",
                    True
                ),

                "active": old.get(
                    "active",
                    True
                ),

                "tags": old.get(
                    "tags",
                    generated["tags"]
                )
            }

            updated_projects.append(merged)

        else:

            updated_projects.append(generated)


#
# Preserve existing projects that are NOT in the CSV (append, never drop).
#

csv_ids = {p["id"] for p in updated_projects}

for project_id, project in existing_projects.items():

    if project_id not in csv_ids:

        updated_projects.append(project)

        print(f"Preserved (not in CSV): {project['title']}")


updated_projects.sort(
    key=lambda x: x["title"]
)


with open(
        JSON_FILE,
        "w",
        encoding="utf-8"
) as f:

    json.dump(
        updated_projects,
        f,
        indent=2,
        ensure_ascii=False
    )


print(
    f"Created/updated "
    f"{len(updated_projects)} projects"
)
