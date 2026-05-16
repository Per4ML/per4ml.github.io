import pandas as pd
import json
import os
import re
from datetime import datetime

CSV_FILE = "../contents/Team+Members.csv"
JSON_FILE = "../contents/members.json"


###############################################
# helper functions
###############################################

def slugify(name):
    """
    Yugesh Bhattarai
    ->
    yugesh-bhattarai
    """
    return re.sub(
        r"[^a-z0-9]+",
        "-",
        name.lower()
    ).strip("-")


def normalize_level(level):

    level = str(level).lower()

    if "ph" in level:
        return "PhD"

    elif "postdoc" in level:
        return "Postdoc"

    elif "master" in level or "ms" in level:
        return "MS"

    elif "undergrad" in level:
        return "Undergraduate"

    elif "alum" in level:
        return "Alumni"

    elif "sophomore" in level:
        return "Undergraduate"

    elif "junior" in level:
        return "Undergraduate"

    elif "senior" in level:
        return "Undergraduate"

    return "Undergraduate"


def default_role(level):

    role_map = {
        "PhD":"Graduate Research Assistant",
        "MS":"Graduate Research Assistant",
        "Undergraduate":"Undergraduate Research Assistant",
        "Postdoc":"Postdoctoral Research Associate",
        "Alumni":"Alumni",
        "PI":"Principal Investigator"
    }

    return role_map.get(level,"Research Assistant")


###############################################
# read csv
###############################################

df = pd.read_csv(CSV_FILE)

###############################################
# load existing json
###############################################

if os.path.exists(JSON_FILE):

    with open(JSON_FILE,"r") as f:
        existing = json.load(f)

else:
    existing=[]


existing_dict = {
    person["id"]:person
    for person in existing
}


###############################################
# process each csv row
###############################################

for _,row in df.iterrows():

    name = str(row["Title"]).strip()

    if name=="nan":
        continue

    person_id = slugify(name)

    if person_id in existing_dict:

        print(f"Skipping existing: {name}")
        continue


    level = normalize_level(row["Level"])


    joined=""

    try:

        joined = str(
            datetime.fromisoformat(
                row["Created Date"].replace("Z","+00:00")
            ).year
        )

    except:
        joined=""


    first_name=name.split()[0].lower()


    new_entry={

        "id":person_id,

        "name":name,

        "level":level,

        "role":default_role(level),

        "image":f"images/team/{first_name}.jpg",

        "url":"" if pd.isna(row["URL"]) else row["URL"],

        "interests":[
            "HPC",
            "Performance Modeling"
        ],

        "joined":joined,

        "active":True
    }


    existing.append(new_entry)

    print(f"Added: {name}")


###############################################
# sort
###############################################

level_order = {
    "PI":0,
    "Postdoc":1,
    "PhD":2,
    "MS":3,
    "Undergraduate":4,
    "Alumni":5
}


existing.sort(
    key=lambda x:
    (
        level_order.get(
            x["level"],
            100
        ),
        x["name"]
    )
)



###############################################
# save
###############################################

with open(JSON_FILE,"w") as f:

    json.dump(
        existing,
        f,
        indent=2
    )

print()
print("members.json updated")
print("Existing entries preserved")
print("New entries appended")
