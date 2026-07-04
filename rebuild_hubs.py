import json
from pathlib import Path

with open('graphify-out/.graphify_analysis.json', 'r') as f:
    analysis = json.load(f)

with open('graphify-out/community_labels.json', 'r') as f:
    labels = json.load(f)

hubs = "## Community Hubs (Navigation)\n"
for cid in sorted(analysis['communities'].keys(), key=int):
    label = labels.get(cid, f"Community {cid}")
    hubs += f"- [[_COMMUNITY_{label}|{label}]]\n"

report_path = Path('graphify-out/GRAPH_REPORT.md')
content = report_path.read_text(encoding='utf-8')

# Find the hubs section and replace it
import re
pattern = r"## Community Hubs \(Navigation\)\n(.*?)(?=\n\n##|$)"
new_content = re.sub(pattern, hubs.strip(), content, flags=re.DOTALL)

report_path.write_text(new_content, encoding='utf-8')
print("Fixed Community Hubs section in GRAPH_REPORT.md")
