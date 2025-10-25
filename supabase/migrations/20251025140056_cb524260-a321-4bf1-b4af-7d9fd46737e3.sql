-- Add columns for diagrams in options, answer, and solution
ALTER TABLE test_questions 
ADD COLUMN IF NOT EXISTS options_diagrams jsonb,
ADD COLUMN IF NOT EXISTS answer_diagram jsonb,
ADD COLUMN IF NOT EXISTS solution_diagram jsonb;

-- Add a comprehensive test question demonstrating all diagram types
INSERT INTO test_questions (
  course_id,
  unit_id,
  test_name,
  question_statement,
  question_type,
  options,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  part,
  diagram_json,
  options_diagrams,
  answer_diagram,
  solution_diagram
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440002',
  'Test 1',
  'A tree structure represents a hierarchical organization where each node can have multiple children. The given diagram shows a binary tree. Which of the following represents the correct in-order traversal of this tree?',
  'MCQ',
  '["D, B, E, A, F, C, G", "A, B, D, E, C, F, G", "D, E, B, F, G, C, A", "A, B, C, D, E, F, G"]'::jsonb,
  'D, B, E, A, F, C, G',
  'In-order traversal visits nodes in the order: Left subtree → Root → Right subtree. Starting from the root A: 1) Visit left subtree of A (B and its children) 2) Left subtree of B is D, so visit D 3) Visit root B 4) Right subtree of B is E, so visit E 5) Visit root A 6) Visit right subtree of A (C and its children) 7) Left subtree of C is F, so visit F 8) Visit root C 9) Right subtree of C is G, so visit G. This gives us the sequence: D, B, E, A, F, C, G.',
  4,
  -1,
  0,
  1,
  3,
  'Part A',
  '[
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-a",
      "x": 250,
      "y": 50,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-a-b",
      "x": 260,
      "y": 90,
      "points": [[0, 0], [-60, 40]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-b",
      "x": 180,
      "y": 130,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-a-c",
      "x": 280,
      "y": 90,
      "points": [[0, 0], [60, 40]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-c",
      "x": 320,
      "y": 130,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-b-d",
      "x": 190,
      "y": 170,
      "points": [[0, 0], [-40, 30]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-d",
      "x": 130,
      "y": 200,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-b-e",
      "x": 210,
      "y": 170,
      "points": [[0, 0], [40, 30]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-e",
      "x": 230,
      "y": 200,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-c-f",
      "x": 330,
      "y": 170,
      "points": [[0, 0], [-40, 30]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-f",
      "x": 270,
      "y": 200,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "version": 1,
      "id": "line-c-g",
      "x": 350,
      "y": 170,
      "points": [[0, 0], [40, 30]],
      "strokeColor": "#000000"
    },
    {
      "type": "ellipse",
      "version": 1,
      "id": "node-g",
      "x": 370,
      "y": 200,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    }
  ]'::jsonb,
  '[
    [
      {
        "type": "rectangle",
        "id": "bar1",
        "x": 50,
        "y": 100,
        "width": 40,
        "height": 100,
        "strokeColor": "#000000",
        "backgroundColor": "#3b82f6"
      }
    ],
    [
      {
        "type": "rectangle",
        "id": "bar2",
        "x": 50,
        "y": 80,
        "width": 40,
        "height": 120,
        "strokeColor": "#000000",
        "backgroundColor": "#3b82f6"
      }
    ],
    [
      {
        "type": "rectangle",
        "id": "bar3",
        "x": 50,
        "y": 120,
        "width": 40,
        "height": 80,
        "strokeColor": "#000000",
        "backgroundColor": "#3b82f6"
      }
    ],
    [
      {
        "type": "rectangle",
        "id": "bar4",
        "x": 50,
        "y": 60,
        "width": 40,
        "height": 140,
        "strokeColor": "#000000",
        "backgroundColor": "#3b82f6"
      }
    ]
  ]'::jsonb,
  '[
    {
      "type": "line",
      "id": "answer-line",
      "x": 50,
      "y": 100,
      "points": [[0, 0], [150, 0]],
      "strokeColor": "#22c55e",
      "strokeWidth": 3
    }
  ]'::jsonb,
  '[
    {
      "type": "rectangle",
      "id": "step1",
      "x": 50,
      "y": 50,
      "width": 200,
      "height": 60,
      "strokeColor": "#000000",
      "backgroundColor": "#fef3c7"
    },
    {
      "type": "line",
      "id": "arrow1",
      "x": 150,
      "y": 110,
      "points": [[0, 0], [0, 30]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "step2",
      "x": 50,
      "y": 140,
      "width": 200,
      "height": 60,
      "strokeColor": "#000000",
      "backgroundColor": "#dcfce7"
    },
    {
      "type": "line",
      "id": "arrow2",
      "x": 150,
      "y": 200,
      "points": [[0, 0], [0, 30]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "step3",
      "x": 50,
      "y": 230,
      "width": 200,
      "height": 60,
      "strokeColor": "#000000",
      "backgroundColor": "#dbeafe"
    }
  ]'::jsonb
);

-- Add another question with circuit diagram
INSERT INTO test_questions (
  course_id,
  unit_id,
  test_name,
  question_statement,
  question_type,
  answer,
  solution,
  correct_marks,
  incorrect_marks,
  skipped_marks,
  partial_marks,
  time_minutes,
  part,
  diagram_json,
  solution_diagram
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '880e8400-e29b-41d4-a716-446655440002',
  'Test 1',
  'In the given circuit, if the battery voltage is 12V and the resistor is 6Ω, what is the current flowing through the circuit?',
  'NAT',
  '2',
  'Using Ohm''s Law: V = IR, where V is voltage, I is current, and R is resistance. Rearranging for current: I = V/R = 12V / 6Ω = 2A. Therefore, the current flowing through the circuit is 2 Amperes.',
  4,
  -1,
  0,
  1,
  3,
  'Part B',
  '[
    {
      "type": "rectangle",
      "id": "battery",
      "x": 50,
      "y": 100,
      "width": 30,
      "height": 80,
      "strokeColor": "#000000",
      "backgroundColor": "#fef3c7"
    },
    {
      "type": "line",
      "id": "plus",
      "x": 55,
      "y": 110,
      "points": [[0, 0], [20, 0]],
      "strokeColor": "#dc2626",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "plus-v",
      "x": 65,
      "y": 100,
      "points": [[0, 0], [0, 20]],
      "strokeColor": "#dc2626",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "minus",
      "x": 55,
      "y": 170,
      "points": [[0, 0], [20, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "wire1",
      "x": 80,
      "y": 110,
      "points": [[0, 0], [100, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "bulb",
      "x": 180,
      "y": 90,
      "width": 40,
      "height": 40,
      "strokeColor": "#000000",
      "backgroundColor": "#fef3c7"
    },
    {
      "type": "ellipse",
      "id": "bulb-inner",
      "x": 190,
      "y": 100,
      "width": 20,
      "height": 20,
      "strokeColor": "#f59e0b",
      "backgroundColor": "#fef3c7"
    },
    {
      "type": "line",
      "id": "wire2",
      "x": 220,
      "y": 110,
      "points": [[0, 0], [100, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "rectangle",
      "id": "resistor",
      "x": 320,
      "y": 95,
      "width": 50,
      "height": 30,
      "strokeColor": "#000000",
      "backgroundColor": "#e0f2fe"
    },
    {
      "type": "line",
      "id": "resistor-zigzag1",
      "x": 330,
      "y": 110,
      "points": [[0, 0], [10, -10]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "resistor-zigzag2",
      "x": 340,
      "y": 100,
      "points": [[0, 0], [10, 20]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "resistor-zigzag3",
      "x": 350,
      "y": 120,
      "points": [[0, 0], [10, -10]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "wire3",
      "x": 370,
      "y": 110,
      "points": [[0, 0], [50, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "wire4",
      "x": 420,
      "y": 110,
      "points": [[0, 0], [0, 60]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    },
    {
      "type": "line",
      "id": "wire5",
      "x": 50,
      "y": 170,
      "points": [[0, 0], [370, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 2
    }
  ]'::jsonb,
  '[
    {
      "type": "rectangle",
      "id": "formula-box",
      "x": 50,
      "y": 50,
      "width": 250,
      "height": 150,
      "strokeColor": "#000000",
      "backgroundColor": "#f0f9ff"
    },
    {
      "type": "line",
      "id": "separator",
      "x": 70,
      "y": 100,
      "points": [[0, 0], [210, 0]],
      "strokeColor": "#000000",
      "strokeWidth": 1
    },
    {
      "type": "rectangle",
      "id": "answer-highlight",
      "x": 220,
      "y": 140,
      "width": 50,
      "height": 25,
      "strokeColor": "#22c55e",
      "backgroundColor": "#dcfce7",
      "strokeWidth": 2
    }
  ]'::jsonb
);