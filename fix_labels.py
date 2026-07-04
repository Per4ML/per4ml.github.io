import json
from pathlib import Path

labels = {
    "0": "Frontend Core & Layout",
    "1": "Project Documentation & Metadata",
    "2": "Branding & Team Visuals",
    "3": "Lab Identity & Members",
    "4": "Project Performance Artifacts",
    "5": "Static Site Generator (mkhtml)",
    "6": "BibTeX Processing Pipeline",
    "7": "News Management Scripts",
    "8": "Research Carousel UI",
    "9": "HPC & Fault Tolerance Research",
    "10": "Project Data Management",
    "11": "Team Member UI",
    "12": "Machine Learning Research",
    "13": "Member Data Management",
    "14": "Mindmap Data Pipeline",
    "15": "Publication Mindmap UI",
    "16": "About Page UI",
    "17": "Publication Data Management",
    "18": "Build Configuration (Vite)",
    "19": "Power Analysis Research",
    "20": "Latency Analysis Research",
    "21": "Member: Banooqa & Nawshin",
    "22": "Member: Avaneesh",
    "23": "Member: Chase",
    "24": "Member: Ashna",
    "25": "Member: Elvis",
    "26": "Member: Ankur"
}

# Re-save labels just in case
with open('graphify-out/community_labels.json', 'w', encoding='utf-8') as f:
    json.dump(labels, f, indent=2)

# To fix the report, we need the original report or we have to undo the bad replaces.
# Since I don't have a backup, and the report is generated from graph.json + analysis,
# the safest way is to REGENERATE the report if I had the tool. 
# But the user said "Do not rerun extraction".
# Wait, I can't easily "undo" the replaces unless I know exactly what happened.
# Actually, I can just read the graph.json and analysis.json and use a simple Python script 
# to rebuild the lapped part of the report.

# BUT, if I can just fix the text by being smart...
# No, if Community 1 became "X", and Community 10 became "X0", 
# then replacing "X0" with "Label 10" might work.

# Actually, the most robust way is to read the report and use a regex 
# or just replace the broken ones.
# Let's see the report again.
