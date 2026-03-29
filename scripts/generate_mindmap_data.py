import json
import re

def parse_bibtex(bibtex_content):
    """
    A simple parser to extract publications from a BibTeX string.
    In a real scenario, you might use a library like `bibtexparser`.
    """
    entries = []
    # Simple regex to find entries like @article{id, title={...}, year={...}, ...}
    pattern = re.compile(r'@(\w+)\{([^,]+),\s*(.*?)\n\}', re.DOTALL)
    
    for match in pattern.finditer(bibtex_content):
        entry_type = match.group(1)
        entry_id = match.group(2)
        body = match.group(3)
        
        entry = {'type': entry_type, 'id': entry_id}
        
        # Extract fields
        field_pattern = re.compile(r'(\w+)\s*=\s*[\{"](.*?)[\\}"]', re.DOTALL)
        for field_match in field_pattern.finditer(body):
            key = field_match.group(1).lower()
            val = field_match.group(2).replace('\n', ' ').strip()
            entry[key] = val
            
        entries.append(entry)
        
    return entries

def build_hierarchy(publications):
    """
    Builds a hierarchical JSON structure for the D3 mindmap.
    Root -> Research Area -> Conference/Year -> Paper
    """
    # Define the root node
    root = {
        "name": "Per4ML Lab",
        "children": []
    }
    
    # Group by Research Area
    areas = {}
    
    for pub in publications:
        # In a real scenario, you'd extract the area from a specific field or tag
        # Here we use a fallback or a mock mapping
        area = pub.get('area', 'High-Performance Computing')
        conf = pub.get('booktitle', pub.get('journal', 'Unknown Venue'))
        year = pub.get('year', 'Unknown Year')
        
        conf_year = f"{conf}'{year[-2:] if len(year) == 4 else year}"
        
        if area not in areas:
            areas[area] = {}
            
        if conf_year not in areas[area]:
            areas[area][conf_year] = []
            
        areas[area][conf_year].append({
            "name": pub.get('title', 'Untitled'),
            "url": pub.get('url', '#')
        })
        
    # Build the final tree
    for area_name, confs in areas.items():
        area_node = {
            "name": area_name,
            "children": []
        }
        for conf_name, papers in confs.items():
            conf_node = {
                "name": conf_name,
                "children": papers
            }
            area_node["children"].append(conf_node)
            
        root["children"].append(area_node)
        
    return root

if __name__ == "__main__":
    # Example BibTeX content
    sample_bibtex = """
    @inproceedings{smith2024efficient,
      title={Efficient I/O for Exascale Deep Learning},
      author={Smith, Alice and Jones, Bob},
      booktitle={SC},
      year={2024},
      area={High-Performance Computing},
      url={https://example.com/paper1}
    }
    @inproceedings{davis2025scaling,
      title={Scaling Laws for Distributed Training},
      author={Davis, Charlie},
      booktitle={NeurIPS},
      year={2025},
      area={AI/ML Optimization},
      url={https://example.com/paper2}
    }
    """
    
    pubs = parse_bibtex(sample_bibtex)
    hierarchy = build_hierarchy(pubs)
    
    # Output the JSON structure
    with open('mindmap_data.json', 'w') as f:
        json.dump(hierarchy, f, indent=2)
        
    print("Successfully generated mindmap_data.json!")
