import re
import json

with open("index.legacy.html", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

m = re.search(r"const TESTS\s*=\s*(\[\[[\s\S]*?\]\]);", content)
if not m:
    print("Could not find TESTS regex match")
else:
    raw_json = m.group(1)
    tests = json.loads(raw_json)
    print(f"Found {len(tests)} tests")
    total_q = sum(len(t) for t in tests)
    print(f"Total questions: {total_q}")
    
    sections = {}
    for t_idx, test in enumerate(tests):
        for q_idx, q in enumerate(test):
            s = q.get("s", "Unknown")
            sections[s] = sections.get(s, 0) + 1
    
    print("Sections distribution:", json.dumps(sections, indent=2))
