import re
import json

with open("index.legacy.html", "r", encoding="utf-8", errors="ignore") as f:
    html = f.read()

# Sections in study notes: reasoning, quant, verbal, pseudo, critical, strategy
sections = {
    "Quantitative Aptitude": "quant",
    "Verbal Ability": "verbal",
    "Logical Reasoning & Puzzles": "reasoning",
    "Pseudocode & Programming Logic": "pseudo",
    "Critical Thinking": "critical",
    "Exam Strategy": "strategy"
}

study_data = []

for sec_name, sec_id in sections.items():
    m = re.search(r'<div id="' + sec_id + r'" class="study-panel[^"]*">([\s\S]*?)</div>\s*</div>', html)
    if m:
        panel_html = m.group(1)
        # Find all notes
        notes = re.findall(r'<div class="note">([\s\S]*?)</div>', panel_html)
        sec_notes = []
        for n in notes:
            # extract h3
            h3_m = re.search(r'<h3>(.*?)</h3>', n)
            title = h3_m.group(1).strip() if h3_m else "Topic Note"
            # clean html
            clean_text = re.sub(r'<[^>]+>', ' ', n).strip()
            clean_text = re.sub(r'\s+', ' ', clean_text)
            sec_notes.append({
                "title": title,
                "rawHtml": n.strip(),
                "plainText": clean_text
            })
        study_data.append({
            "section": sec_name,
            "id": sec_id,
            "topics": sec_notes
        })

with open("src/data/studyNotes.json", "w", encoding="utf-8") as f:
    json.dump(study_data, f, indent=2)

print(f"Extracted {len(study_data)} study note sections successfully.")
