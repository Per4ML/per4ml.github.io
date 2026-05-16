import json
import bibtexparser

def generate_publication_json(bib_file, json_file):
    """Parses BibTeX and outputs a clean JSON array for the static site."""
    with open(bib_file, 'r', encoding='utf-8') as b_file:
        bib_database = bibtexparser.load(b_file)
    
    publications = []
    for entry in bib_database.entries:
        # Normalize the venue data across different publication types
        venue = entry.get("journal", entry.get("booktitle", "Preprint/Misc"))
        
        # Clean up LaTeX formatting and structure for the frontend
        pub = {
            "id": entry.get("ID", ""),
            "title": entry.get("title", "").replace('{', '').replace('}', ''),
            "authors": entry.get("author", "").replace(' and ', ', '),
            "venue": venue,
            "year": entry.get("year", ""),
            "link": entry.get("url", entry.get("doi", ""))
        }
        publications.append(pub)
        
    # Sort descending by year to keep recent work at the top
    publications.sort(key=lambda x: x.get("year", "0"), reverse=True)
    
    with open(json_file, 'w', encoding='utf-8') as j_file:
        json.dump(publications, j_file, indent=2)
        
    print(f"Success. Exported {len(publications)} publications to {json_file}.")

if __name__ == "__main__":
    generate_publication_json('contents/pubs.bib', 'publications.json')
