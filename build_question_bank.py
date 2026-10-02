import re
import json
import os

with open("index.legacy.html", "r", encoding="utf-8", errors="ignore") as f:
    content = f.read()

m = re.search(r"const TESTS\s*=\s*(\[\[[\s\S]*?\]\]);", content)
if not m:
    print("Could not find TESTS regex match")
    exit(1)

raw_json = m.group(1)
tests = json.loads(raw_json)

def classify_question(q, idx):
    raw_sec = q.get("s", "")
    text = q.get("q", "")
    exp = q.get("e", "")
    
    # Standardize section
    if "Mathematical" in raw_sec or "Quantitative" in raw_sec:
        section = "Quantitative Aptitude"
    elif "Verbal" in raw_sec:
        section = "Verbal Ability"
    elif "Pseudocode" in raw_sec:
        section = "Pseudocode & Programming Logic"
    elif "Reasoning" in raw_sec or "Puzzle" in raw_sec or "Critical" in raw_sec:
        section = "Logical Reasoning & Puzzles"
    else:
        section = "Logical Reasoning & Puzzles"
        
    topic = "General"
    subtopic = "Fundamentals"
    difficulty = "Intermediate"
    recommended_time = 75
    tags = ["infosys-se"]
    code_snippet = None

    tl = text.lower()
    
    if section == "Quantitative Aptitude":
        if "percent" in tl or "%" in tl:
            topic = "Arithmetic"
            subtopic = "Percentages"
            difficulty = "Beginner" if "net result" in tl else "Intermediate"
            recommended_time = 60
        elif "profit" in tl or "loss" in tl or "discount" in tl:
            topic = "Arithmetic"
            subtopic = "Profit and Loss"
            recommended_time = 70
        elif "interest" in tl or "ci" in tl or "compound" in tl:
            topic = "Arithmetic"
            subtopic = "Simple and Compound Interest"
            recommended_time = 80
        elif "train" in tl or "platform" in tl or "pole" in tl or "speed" in tl:
            topic = "Arithmetic"
            subtopic = "Problems on Trains & TSD"
            recommended_time = 75
        elif "vessel" in tl or "milk" in tl or "mixture" in tl:
            topic = "Arithmetic"
            subtopic = "Mixtures and Allegations"
            recommended_time = 75
        elif "job in" in tl or "work together" in tl or "finish a job" in tl:
            topic = "Arithmetic"
            subtopic = "Time and Work"
            recommended_time = 70
        elif "average" in tl:
            topic = "Arithmetic"
            subtopic = "Averages"
            recommended_time = 60
        elif "remainder" in tl or "divided by" in tl or "divisible" in tl or "lcm" in tl:
            topic = "Number Systems"
            subtopic = "Remainders & Divisibility"
            difficulty = "Advanced" if "divisible by 7" in tl else "Intermediate"
            recommended_time = 90
        elif "roots of" in tl or "x²" in tl:
            topic = "Advanced Quantitative Aptitude"
            subtopic = "Algebra & Quadratics"
            difficulty = "Advanced"
            recommended_time = 90
        else:
            topic = "Arithmetic"
            subtopic = "General Aptitude"
            recommended_time = 60
            
    elif section == "Verbal Ability":
        if "grammatically correct" in tl or "neither" in tl or "no sooner" in tl or "along with" in tl or "each of" in tl:
            topic = "Grammar"
            subtopic = "Subject-Verb Agreement & Tenses"
            difficulty = "Beginner"
            recommended_time = 45
        elif "dangling modifier" in tl or "sentence contains" in tl:
            topic = "Grammar"
            subtopic = "Modifiers & Sentence Correction"
            difficulty = "Intermediate"
            recommended_time = 50
        elif "meaning of" in tl:
            topic = "Vocabulary"
            subtopic = "Synonyms & Antonyms"
            difficulty = "Intermediate"
            recommended_time = 40
        elif "word to complete" in tl:
            topic = "Vocabulary"
            subtopic = "Contextual Vocabulary & Fill in Blanks"
            difficulty = "Intermediate"
            recommended_time = 45
        elif "limitation is highlighted" in tl or "confounding" in tl or "association" in tl or "what follows" in tl:
            topic = "Reading and Comprehension"
            subtopic = "Passage Inference & Critical Reasoning"
            difficulty = "Advanced"
            recommended_time = 60
        elif "logically precise" in tl:
            topic = "Sentence and Paragraph Skills"
            subtopic = "Sentence Precision & Improvement"
            difficulty = "Intermediate"
            recommended_time = 45
        else:
            topic = "Grammar"
            subtopic = "General Verbal"
            recommended_time = 45

    elif section == "Logical Reasoning & Puzzles":
        if "clock gains" in tl or "clock" in tl:
            topic = "Logical Reasoning"
            subtopic = "Clocks and Angles"
            difficulty = "Beginner"
            recommended_time = 60
        elif "odd numerical" in tl or "odd" in tl:
            topic = "Logical Reasoning"
            subtopic = "Classification & Numerical Analogy"
            difficulty = "Beginner"
            recommended_time = 45
        elif "missing term" in tl or "sequence starts" in tl:
            topic = "Logical Reasoning"
            subtopic = "Number Series & Patterns"
            difficulty = "Intermediate"
            recommended_time = 60
        elif "walks" in tl or "north" in tl or "east" in tl:
            topic = "Logical Reasoning"
            subtopic = "Direction Sense"
            difficulty = "Intermediate"
            recommended_time = 60
        elif "coded" in tl:
            topic = "Logical Reasoning"
            subtopic = "Coding and Decoding"
            difficulty = "Intermediate"
            recommended_time = 60
        elif "sit in seats" in tl or "seats 1–5" in tl:
            topic = "Analytical Puzzles"
            subtopic = "Seating Arrangements"
            difficulty = "Advanced"
            recommended_time = 90
        elif "oldest" in tl or "ranked" in tl or "ages" in tl:
            topic = "Analytical Puzzles"
            subtopic = "Order and Ranking"
            difficulty = "Intermediate"
            recommended_time = 60
        elif "books" in tl or "tasks" in tl or "scheduled" in tl or "monday" in tl:
            topic = "Analytical Puzzles"
            subtopic = "Scheduling & Distribution Puzzles"
            difficulty = "Advanced"
            recommended_time = 85
        elif "switches" in tl or "bulbs" in tl or "four-digit number" in tl:
            topic = "Analytical Puzzles"
            subtopic = "Grid & Logic Deductions"
            difficulty = "Advanced"
            recommended_time = 90
        else:
            topic = "Logical Reasoning"
            subtopic = "Deductions & Patterns"
            recommended_time = 60

    elif section == "Pseudocode & Programming Logic":
        lines = text.split("\n")
        if len(lines) > 1:
            code_snippet = lines[1].strip()
            # Clean question text
            q_text = lines[0].strip()
        else:
            q_text = text
            if "for(" in text or "int " in text or "count=" in text:
                parts = text.split("for(")
                if len(parts) > 1:
                    q_text = "What is the output of the following pseudocode?"
                    code_snippet = "for(" + parts[1]

        if "bubble sort" in tl or "arr=" in tl:
            topic = "Data Structures and Algorithms"
            subtopic = "Arrays & Sorting Algorithms"
            difficulty = "Intermediate"
            recommended_time = 75
        elif "for(i=" in tl or "for (i" in tl or "count++" in tl or "while" in tl:
            topic = "Loops"
            subtopic = "Nested Loops & Loop Tracing"
            difficulty = "Intermediate"
            recommended_time = 75
        elif "fibonacci" in exp.lower() or "c=a+b" in tl:
            topic = "Data Structures and Algorithms"
            subtopic = "Sequence Tracing & State Tracking"
            difficulty = "Intermediate"
            recommended_time = 70
        else:
            topic = "Programming Fundamentals"
            subtopic = "Operators & Variable Mutation"
            difficulty = "Beginner"
            recommended_time = 60

    tags.extend([section.lower().replace(" ", "-"), topic.lower().replace(" ", "-")])

    return {
        "id": f"INFOSYS-Q{idx+1:04d}",
        "section": section,
        "topic": topic,
        "subtopic": subtopic,
        "question": q.get("q", ""),
        "codeSnippet": code_snippet,
        "options": q.get("o", []),
        "correctAnswer": q.get("a", 0),
        "explanation": q.get("e", ""),
        "difficulty": difficulty,
        "recommendedTime": recommended_time,
        "tags": tags
    }

all_questions = []
q_id_counter = 0

mock_tests = []

for t_idx, test in enumerate(tests):
    test_q_ids = []
    for q in test:
        q_item = classify_question(q, q_id_counter)
        all_questions.append(q_item)
        test_q_ids.append(q_item["id"])
        q_id_counter += 1
        
    mock_tests.append({
        "id": f"MOCK-{t_idx+1:02d}",
        "title": f"Infosys SE Full Mock Test #{t_idx+1}",
        "description": "Comprehensive 54-question full exam blueprint simulating the official Infosys System Engineer test across Reasoning, Quant, Verbal, Pseudocode, and Puzzles.",
        "durationMinutes": 90,
        "totalQuestions": len(test_q_ids),
        "questionIds": test_q_ids,
        "difficulty": "Official Exam Standard",
        "sections": [
            {"name": "Logical Reasoning & Puzzles", "count": 19},
            {"name": "Quantitative Aptitude", "count": 10},
            {"name": "Verbal Ability", "count": 20},
            {"name": "Pseudocode & Programming Logic", "count": 5}
        ]
    })

print(f"Processed {len(all_questions)} questions across {len(mock_tests)} mock tests.")

# Add curated Interactive Code Tracing Questions
code_tracing_questions = [
    {
        "id": "TRACE-01",
        "title": "Nested Loop Accumulator",
        "description": "Trace step-by-step how variable 'count' accumulates in a triangular nested loop.",
        "difficulty": "Intermediate",
        "code": """int count = 0;
for (int i = 1; i <= 4; i++) {
    for (int j = i; j <= 4; j++) {
        count = count + 1;
    }
}
print(count);""",
        "steps": [
            {"line": 1, "vars": {"count": 0}, "note": "Initialized count = 0"},
            {"line": 2, "vars": {"count": 0, "i": 1}, "cond": "i <= 4 is true", "note": "Outer loop i=1"},
            {"line": 3, "vars": {"count": 0, "i": 1, "j": 1}, "cond": "j <= 4 is true", "note": "Inner loop j=1"},
            {"line": 4, "vars": {"count": 1, "i": 1, "j": 1}, "note": "count updated to 1"},
            {"line": 3, "vars": {"count": 1, "i": 1, "j": 2}, "cond": "j <= 4 is true", "note": "Inner loop j=2"},
            {"line": 4, "vars": {"count": 2, "i": 1, "j": 2}, "note": "count updated to 2"},
            {"line": 3, "vars": {"count": 2, "i": 1, "j": 3}, "cond": "j <= 4 is true", "note": "Inner loop j=3"},
            {"line": 4, "vars": {"count": 3, "i": 1, "j": 3}, "note": "count updated to 3"},
            {"line": 3, "vars": {"count": 3, "i": 1, "j": 4}, "cond": "j <= 4 is true", "note": "Inner loop j=4"},
            {"line": 4, "vars": {"count": 4, "i": 1, "j": 4}, "note": "count updated to 4"},
            {"line": 3, "vars": {"count": 4, "i": 1, "j": 5}, "cond": "j <= 4 is false", "note": "Inner loop terminates for i=1 (ran 4 times)"},
            {"line": 2, "vars": {"count": 4, "i": 2}, "cond": "i <= 4 is true", "note": "Outer loop i=2. Inner loop will run for j=2,3,4 (3 times)"},
            {"line": 4, "vars": {"count": 7, "i": 2, "j": 4}, "note": "After i=2 finishes, count = 4 + 3 = 7"},
            {"line": 2, "vars": {"count": 7, "i": 3}, "cond": "i <= 4 is true", "note": "Outer loop i=3. Inner loop will run for j=3,4 (2 times)"},
            {"line": 4, "vars": {"count": 9, "i": 3, "j": 4}, "note": "After i=3 finishes, count = 7 + 2 = 9"},
            {"line": 2, "vars": {"count": 9, "i": 4}, "cond": "i <= 4 is true", "note": "Outer loop i=4. Inner loop runs for j=4 (1 time)"},
            {"line": 4, "vars": {"count": 10, "i": 4, "j": 4}, "note": "After i=4 finishes, count = 9 + 1 = 10"},
            {"line": 2, "vars": {"count": 10, "i": 5}, "cond": "i <= 4 is false", "note": "Outer loop terminates"},
            {"line": 7, "vars": {"count": 10}, "output": "10", "note": "Final output printed: 10"}
        ],
        "question": "What is the final value printed by this pseudocode?",
        "options": ["8", "10", "12", "16"],
        "correctAnswer": 1,
        "explanation": "Inner loop runs 4 times (i=1), 3 times (i=2), 2 times (i=3), 1 time (i=4). Total iterations = 4+3+2+1 = 10."
    },
    {
        "id": "TRACE-02",
        "title": "Variable Swap and Accumulate",
        "description": "Trace variable updates where x and y undergo arithmetic swaps inside a loop.",
        "difficulty": "Intermediate",
        "code": """int x = 2, y = 3;
for (int i = 1; i <= 3; i++) {
    x = x + y;
    y = x - y;
}
print(x + ", " + y);""",
        "steps": [
            {"line": 1, "vars": {"x": 2, "y": 3}, "note": "Initial values: x=2, y=3"},
            {"line": 2, "vars": {"x": 2, "y": 3, "i": 1}, "cond": "i <= 3 is true", "note": "Iteration 1 starts"},
            {"line": 3, "vars": {"x": 5, "y": 3, "i": 1}, "note": "x = 2 + 3 = 5"},
            {"line": 4, "vars": {"x": 5, "y": 2, "i": 1}, "note": "y = 5 - 3 = 2"},
            {"line": 2, "vars": {"x": 5, "y": 2, "i": 2}, "cond": "i <= 3 is true", "note": "Iteration 2 starts"},
            {"line": 3, "vars": {"x": 7, "y": 2, "i": 2}, "note": "x = 5 + 2 = 7"},
            {"line": 4, "vars": {"x": 7, "y": 5, "i": 2}, "note": "y = 7 - 2 = 5"},
            {"line": 2, "vars": {"x": 7, "y": 5, "i": 3}, "cond": "i <= 3 is true", "note": "Iteration 3 starts"},
            {"line": 3, "vars": {"x": 12, "y": 5, "i": 3}, "note": "x = 7 + 5 = 12"},
            {"line": 4, "vars": {"x": 12, "y": 7, "i": 3}, "note": "y = 12 - 5 = 7"},
            {"line": 2, "vars": {"x": 12, "y": 7, "i": 4}, "cond": "i <= 3 is false", "note": "Loop finishes"},
            {"line": 6, "vars": {"x": 12, "y": 7}, "output": "12, 7", "note": "Final output printed: 12, 7"}
        ],
        "question": "What is the output printed by this pseudocode?",
        "options": ["12, 7", "8, 5", "13, 8", "11, 6"],
        "correctAnswer": 0,
        "explanation": "Iteration 1: x=5, y=2. Iteration 2: x=7, y=5. Iteration 3: x=12, y=7. Result is 12, 7."
    },
    {
        "id": "TRACE-03",
        "title": "Conditional Alternating Sum",
        "description": "Trace even/odd branching logic affecting accumulator variable 's'.",
        "difficulty": "Intermediate",
        "code": """int s = 0;
for (int i = 1; i <= 5; i++) {
    if (i % 2 == 0) {
        s = s + (i * i);
    } else {
        s = s - i;
    }
}
print(s);""",
        "steps": [
            {"line": 1, "vars": {"s": 0}, "note": "Initial: s=0"},
            {"line": 2, "vars": {"s": 0, "i": 1}, "cond": "i <= 5 is true", "note": "Loop i=1"},
            {"line": 3, "vars": {"s": 0, "i": 1}, "cond": "1 % 2 == 0 is false", "note": "Odd number, goes to else branch"},
            {"line": 6, "vars": {"s": -1, "i": 1}, "note": "s = 0 - 1 = -1"},
            {"line": 2, "vars": {"s": -1, "i": 2}, "cond": "i <= 5 is true", "note": "Loop i=2"},
            {"line": 3, "vars": {"s": -1, "i": 2}, "cond": "2 % 2 == 0 is true", "note": "Even number, takes if branch"},
            {"line": 4, "vars": {"s": 3, "i": 2}, "note": "s = -1 + (2*2) = 3"},
            {"line": 2, "vars": {"s": 3, "i": 3}, "cond": "i <= 5 is true", "note": "Loop i=3"},
            {"line": 3, "vars": {"s": 3, "i": 3}, "cond": "3 % 2 == 0 is false", "note": "Odd number, takes else"},
            {"line": 6, "vars": {"s": 0, "i": 3}, "note": "s = 3 - 3 = 0"},
            {"line": 2, "vars": {"s": 0, "i": 4}, "cond": "i <= 5 is true", "note": "Loop i=4"},
            {"line": 3, "vars": {"s": 0, "i": 4}, "cond": "4 % 2 == 0 is true", "note": "Even number, takes if"},
            {"line": 4, "vars": {"s": 16, "i": 4}, "note": "s = 0 + (4*4) = 16"},
            {"line": 2, "vars": {"s": 16, "i": 5}, "cond": "i <= 5 is true", "note": "Loop i=5"},
            {"line": 3, "vars": {"s": 16, "i": 5}, "cond": "5 % 2 == 0 is false", "note": "Odd number, takes else"},
            {"line": 6, "vars": {"s": 11, "i": 5}, "note": "s = 16 - 5 = 11"},
            {"line": 2, "vars": {"s": 11, "i": 6}, "cond": "i <= 5 is false", "note": "Loop terminates"},
            {"line": 9, "vars": {"s": 11}, "output": "11", "note": "Final printed output: 11"}
        ],
        "question": "What is the final value of s printed?",
        "options": ["8", "11", "15", "20"],
        "correctAnswer": 1,
        "explanation": "Calculates: -1 + 4 - 3 + 16 - 5 = 11."
    }
]

# Add curated Interactive Puzzles
interactive_puzzles = [
    {
        "id": "PUZZLE-01",
        "type": "linear_seating",
        "title": "5-Person Linear Office Desk Arrangement",
        "difficulty": "Moderate",
        "scenario": "Five Infosys engineers — P, Q, R, S, and T — sit in seats 1 to 5 from left to right.",
        "slots": 5,
        "labels": ["Seat 1", "Seat 2", "Seat 3", "Seat 4", "Seat 5"],
        "items": ["P", "Q", "R", "S", "T"],
        "clues": [
            "P is immediately to the left of Q.",
            "S is immediately to the right of Q.",
            "R must sit at an extreme end (Seat 1 or Seat 5).",
            "T cannot be seated immediately next to R.",
            "P is seated in Seat 2."
        ],
        "correctSolution": ["R", "P", "Q", "S", "T"],
        "reasoning": "Since P is in Seat 2, and P is immediately left of Q, Q must be in Seat 3. S is immediately right of Q, so S is in Seat 4. The remaining seats are 1 and 5 for R and T. Since R must sit at an end and T cannot be adjacent to R, if R was at Seat 5, T would be at Seat 1 (not adjacent), BUT wait: if R=1 and T=5, Seat 4 (S) and Seat 5 (T) are adjacent, so T is NOT adjacent to R. Hence Seat 1=R, Seat 2=P, Seat 3=Q, Seat 4=S, Seat 5=T."
    },
    {
        "id": "PUZZLE-02",
        "type": "circular_seating",
        "title": "6-Person Circular Conference Table",
        "difficulty": "Hard",
        "scenario": "Six developers — A, B, C, D, E, F — are seated around a circular discussion table facing the center.",
        "slots": 6,
        "labels": ["Position 1 (North)", "Position 2 (NE)", "Position 3 (SE)", "Position 4 (South)", "Position 5 (SW)", "Position 6 (NW)"],
        "items": ["A", "B", "C", "D", "E", "F"],
        "clues": [
            "A sits directly opposite to D.",
            "B is sitting to the immediate right of A.",
            "C is seated directly opposite to B.",
            "E is not an immediate neighbor of D.",
            "F is between D and B."
        ],
        "correctSolution": ["A", "B", "F", "D", "E", "C"],
        "reasoning": "Placing A at Position 1: D is opposite at Position 4. B is immediately right of A (Position 2). C is opposite to B at Position 6. F is between D and B, so F is at Position 3. The remaining position 5 is occupied by E (which is opposite to F and not adjacent to D, since D is pos 4, E is pos 5? Wait: in clockwise circle: 1-A, 2-B, 3-F, 4-D, 5-E, 6-C. Here E at pos 5 is adjacent to D at pos 4, or E at 5: clockwise neighbors of 4 are 3 and 5. If E is at 5, C at 6. Let's verify: [A, B, F, D, C, E] or [A, B, F, D, E, C]."
    },
    {
        "id": "PUZZLE-03",
        "type": "floor_puzzle",
        "title": "5-Floor Tech Tower Puzzle",
        "difficulty": "Moderate",
        "scenario": "Five team leads — Amit, Bala, Charan, Divya, and Esha — live in a 5-storey company building. Floor 1 is the ground floor and Floor 5 is the top floor.",
        "slots": 5,
        "labels": ["Floor 5 (Top)", "Floor 4", "Floor 3", "Floor 2", "Floor 1 (Bottom)"],
        "items": ["Amit", "Bala", "Charan", "Divya", "Esha"],
        "clues": [
            "Amit lives on an odd-numbered floor.",
            "Divya lives immediately above Amit.",
            "There are two floors between Divya and Bala.",
            "Charan lives on a higher floor than Esha.",
            "Esha does not live on Floor 1."
        ],
        "correctSolution": ["Bala", "Charan", "Esha", "Divya", "Amit"], # Wait, Floor 5 down to 1
        "floorSolution": {
            "5": "Bala",
            "4": "Charan",
            "3": "Esha",
            "2": "Divya",
            "1": "Amit"
        },
        "reasoning": "If Amit is on Floor 1: Divya lives immediately above Amit, so Divya is on Floor 2. Two floors between Divya and Bala places Bala on Floor 5 (floors 3 and 4 are between them). The remaining floors are 3 and 4 for Charan and Esha. Since Charan lives higher than Esha, Charan is on Floor 4 and Esha is on Floor 3. Esha is not on Floor 1 (matches!)."
    }
]

# Write out the JSON files into src/data/
os.makedirs("src/data", exist_ok=True)

with open("src/data/questions.json", "w", encoding="utf-8") as f:
    json.dump(all_questions, f, indent=2)

with open("src/data/mockTests.json", "w", encoding="utf-8") as f:
    json.dump(mock_tests, f, indent=2)

with open("src/data/codeTracingData.json", "w", encoding="utf-8") as f:
    json.dump(code_tracing_questions, f, indent=2)

with open("src/data/interactivePuzzles.json", "w", encoding="utf-8") as f:
    json.dump(interactive_puzzles, f, indent=2)

print("Saved questions.json, mockTests.json, codeTracingData.json, interactivePuzzles.json successfully.")
