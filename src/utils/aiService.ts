const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const callOpenAI = async (
  apiKey: string,
  systemPrompt: string,
  userContent: string,
  temperature = 0.2
): Promise<string> => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
};

export const aiPseudocodeToCode = async (
  apiKey: string,
  pseudocode: string,
  language: 'python' | 'javascript'
): Promise<string> => {
  const systemPrompt = `You are an expert in VCE Software Development pseudocode (Victorian Curriculum, Australia).
Convert the given VCE pseudocode into correct, clean ${language === 'python' ? 'Python' : 'JavaScript'} code.
Rules:
- Use input() for Python / prompt() for JavaScript for INPUT statements.
- Use print() for Python / console.log() for JavaScript for OUTPUT statements.
- Match the logic exactly.
- For Python: wrap code at module level (no main function unless DEFINE is used).
- For JavaScript: wrap code in a main() function and call it at the end.
- Return ONLY the code, no explanation, no markdown fences.`;

  return callOpenAI(apiKey, systemPrompt, pseudocode);
};

export const aiCodeToPseudocode = async (
  apiKey: string,
  code: string,
  language: 'python' | 'javascript'
): Promise<string> => {
  const systemPrompt = `You are an expert in VCE Software Development pseudocode (Victorian Curriculum, Australia).
Convert the given ${language === 'python' ? 'Python' : 'JavaScript'} code into correct VCE pseudocode.
Rules:
- Use BEGIN/END to wrap the main program.
- Use INPUT <var> for user input, OUTPUT <value> for output.
- Use ← for assignment, ≠ for !=, ≤ for <=, ≥ for >=, × for *.
- Use IF/THEN/ELSE/END IF, FOR FROM TO/END FOR, WHILE/END WHILE.
- Use DEFINE for functions, RETURN for return statements.
- Return ONLY the pseudocode, no explanation, no markdown fences.`;

  return callOpenAI(apiKey, systemPrompt, code);
};

export const aiCorrectPseudocode = async (
  apiKey: string,
  pseudocode: string
): Promise<string> => {
  const systemPrompt = `You are a VCE Software Development teacher in Victoria, Australia.
The student has written VCE pseudocode. Correct any syntax or logic errors and return the corrected pseudocode.
Rules:
- Use VCE pseudocode conventions strictly: BEGIN/END, IF/THEN/ELSE/END IF, FOR FROM TO/END FOR, WHILE/END WHILE, DEFINE/RETURN.
- Use ← for assignment, ≠, ≤, ≥, × for operators.
- Use INPUT and OUTPUT statements.
- Add a brief comment (using //) at the end of any corrected line explaining what was fixed. Only comment fixed lines.
- Return ONLY the corrected pseudocode, no extra explanation outside of inline comments.`;

  return callOpenAI(apiKey, systemPrompt, pseudocode);
};

export const aiCorrectAndConvert = async (
  apiKey: string,
  pseudocode: string,
  language: 'python' | 'javascript'
): Promise<{ corrected: string; converted: string }> => {
  const corrected = await aiCorrectPseudocode(apiKey, pseudocode);
  const converted = await aiPseudocodeToCode(apiKey, corrected, language);
  return { corrected, converted };
};

export interface TeacherFeedback {
  hasMistakes: boolean;
  feedback: string;
}

export const aiTeacherFeedback = async (
  apiKey: string,
  pseudocode: string,
  exerciseDescription: string,
  solution: string
): Promise<TeacherFeedback> => {
  const systemPrompt = `You are a supportive VCE Software Development teacher in Victoria, Australia.
A student is working on a pseudocode exercise. Review their attempt and provide teacher-style feedback.

CRITICAL RULES:
- NEVER give the answer or correct code directly.
- If their pseudocode has mistakes, point out WHAT TYPE of error exists and WHERE (line or concept) without revealing the fix.
- Ask guiding questions to help them think through the problem.
- Be encouraging and specific.
- If the pseudocode is correct or nearly correct, say so with praise and note any minor improvements.
- Keep feedback to 2-4 sentences maximum.
- Respond in JSON: {"hasMistakes": true/false, "feedback": "your feedback here"}`;

  const userContent = `Exercise: ${exerciseDescription}

Student's pseudocode:
${pseudocode}

Expected solution (for reference only, do NOT reveal):
${solution}`;

  const raw = await callOpenAI(apiKey, systemPrompt, userContent, 0.4);
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    return { hasMistakes: false, feedback: raw };
  }
};

export interface FlowchartNode {
  id: string;
  type: 'terminal' | 'process' | 'decision' | 'io' | 'predefined';
  label: string;
  yes?: string;
  no?: string;
  next?: string;
}

export interface DataDictionaryRow {
  name: string;
  dataType: string;
  formatForDisplay: string;
  sizeBytes: string;
  sizeDisplay: string;
  description: string;
  example: string;
  validation: string;
}

export interface IpoChart {
  title: string;
  inputs: string[];
  process: string[];
  outputs: string[];
}

export interface UcdActor {
  id: string;
  name: string;
  side: 'left' | 'right';
  parent?: string;
}

export interface UcdUseCase {
  id: string;
  label: string;
}

export interface UcdRelationship {
  type: 'association' | 'include' | 'extend' | 'generalization';
  from: string;
  to: string;
  label?: string;
}

export interface DfdElement {
  id: string;
  type: 'external_entity' | 'process' | 'data_store';
  label: string;
}

export interface DfdFlow {
  from: string;
  to: string;
  label: string;
}

export interface DfdLevel {
  level: 0 | 1 | 2;
  title: string;
  parentProcessId?: string;
  elements: DfdElement[];
  flows: DfdFlow[];
}

export interface ErdAttribute {
  name: string;
  isPrimary: boolean;
  isForeign?: boolean;
  isMultiValued?: boolean;
  isDerived?: boolean;
}

export interface ErdEntity {
  id: string;
  name: string;
  isWeak?: boolean;
  attributes: ErdAttribute[];
}

export interface ErdRelationship {
  id: string;
  name: string;
  isWeak?: boolean;
  entities: string[];
  cardinality: Record<string, 'one' | 'many'>;
  participation: Record<string, 'partial' | 'total'>;
  attributes?: ErdAttribute[];
}

export interface DesignTools {
  flowchart: FlowchartNode[];
  dataDictionary: DataDictionaryRow[];
  ipoChart: IpoChart;
  ucd: {
    systemName: string;
    actors: UcdActor[];
    useCases: UcdUseCase[];
    relationships: UcdRelationship[];
  };
  dfd: DfdLevel[];
  erd: {
    entities: ErdEntity[];
    relationships: ErdRelationship[];
  };
}

export const aiGenerateDesignTools = async (
  apiKey: string,
  code: string,
  codeType: 'pseudocode' | 'python' | 'javascript'
): Promise<DesignTools> => {
  const systemPrompt = `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and produce all five VCAA-approved design tools in strict JSON.

Return ONLY valid JSON matching this exact structure (no markdown, no extra text):
{
  "flowchart": [
    {
      "id": "1",
      "type": "terminal|process|decision|io|predefined",
      "label": "text shown in shape",
      "next": "id of next node (for non-decision)",
      "yes": "id of yes-branch node (decisions only)",
      "no": "id of no-branch node (decisions only)"
    }
  ],
  "dataDictionary": [
    {
      "name": "variableName",
      "dataType": "Integer|Float|String|Boolean|Date|Array(Type)",
      "formatForDisplay": "NNN.NN or XX..XX or DD/MM/YYYY etc",
      "sizeBytes": "4 bytes",
      "sizeDisplay": "6",
      "description": "what this variable stores",
      "example": "42",
      "validation": "Must be > 0 or empty string if none"
    }
  ],
  "ipoChart": {
    "title": "Name of the main process",
    "inputs": ["inputName (dataType)"],
    "process": ["Step 1: plain English description"],
    "outputs": ["outputName (dataType)"]
  },
  "ucd": {
    "systemName": "Name of the system",
    "actors": [
      { "id": "a1", "name": "User", "side": "left" }
    ],
    "useCases": [
      { "id": "uc1", "label": "Verb Noun phrase" }
    ],
    "relationships": [
      { "type": "association|include|extend|generalization", "from": "id", "to": "id" }
    ]
  },
  "dfd": [
    {
      "level": 0,
      "title": "Context Diagram – SystemName",
      "elements": [
        { "id": "sys", "type": "process", "label": "SystemName" },
        { "id": "e1", "type": "external_entity", "label": "User" }
      ],
      "flows": [
        { "from": "e1", "to": "sys", "label": "input_data" },
        { "from": "sys", "to": "e1", "label": "output_data" }
      ]
    },
    {
      "level": 1,
      "title": "Level 1 DFD – SystemName",
      "elements": [
        { "id": "e1", "type": "external_entity", "label": "User" },
        { "id": "p1", "type": "process", "label": "1 Process Name" },
        { "id": "p2", "type": "process", "label": "2 Process Name" },
        { "id": "ds1", "type": "data_store", "label": "D1 Data Store Name" }
      ],
      "flows": [
        { "from": "e1", "to": "p1", "label": "input_data" },
        { "from": "p1", "to": "ds1", "label": "stored_data" },
        { "from": "ds1", "to": "p2", "label": "retrieved_data" },
        { "from": "p2", "to": "e1", "label": "output_data" }
      ]
    },
    {
      "level": 2,
      "title": "Level 2 DFD – Decomposition of Process 1",
      "parentProcessId": "p1",
      "elements": [
        { "id": "e1", "type": "external_entity", "label": "User" },
        { "id": "p1_1", "type": "process", "label": "1.1 Sub-process Name" },
        { "id": "p1_2", "type": "process", "label": "1.2 Sub-process Name" }
      ],
      "flows": [
        { "from": "e1", "to": "p1_1", "label": "input_data" },
        { "from": "p1_1", "to": "p1_2", "label": "intermediate_data" },
        { "from": "p1_2", "to": "e1", "label": "output_data" }
      ]
    }
  ],
  "erd": {
    "entities": [
      {
        "id": "e1",
        "name": "EntityName",
        "isWeak": false,
        "attributes": [
          { "name": "entityID", "isPrimary": true, "isForeign": false, "isMultiValued": false, "isDerived": false },
          { "name": "attributeName", "isPrimary": false, "isForeign": false, "isMultiValued": false, "isDerived": false }
        ]
      }
    ],
    "relationships": [
      {
        "id": "r1",
        "name": "RELATIONSHIP_NAME",
        "isWeak": false,
        "entities": ["e1", "e2"],
        "cardinality": { "e1": "one", "e2": "many" },
        "participation": { "e1": "partial", "e2": "total" },
        "attributes": []
      }
    ]
  }
}

VCAA Rules:
- Flowchart: terminal (oval) for START/END, process (rect) for computations, decision (diamond) for IF/loops with Yes/No branches, io (parallelogram) for INPUT/OUTPUT, predefined (striped rect) for function calls. First node id "1" type "terminal" label "START".
- Data Dictionary: ALL variables. VCAA data types. N=digit, X=char format notation.
- IPO chart: plain English process steps ONLY — no pseudocode syntax. Data items only in inputs/outputs.
- UCD (strict UML 2.5): Identify actors (people/systems that interact with the system) and use cases (system functions).
  - association: solid line, no arrowhead, between actor and use case. Use "from": actorId, "to": useCaseId.
  - include: dashed arrow FROM base use case TO included use case (the base CALLS the included; it is mandatory). Use "from": baseUseCaseId, "to": includedUseCaseId, "type": "include".
  - extend: dashed arrow FROM extending use case TO base use case (the optional/conditional behavior points AT the base it extends). Use "from": extendingUseCaseId, "to": baseUseCaseId, "type": "extend".
  - generalization: solid line with hollow triangle FROM child TO parent. Use "from": childId, "to": parentId, "type": "generalization".
  - Primary actors (initiate actions) go on the left (side: "left"). Secondary actors (support/respond) go on the right (side: "right").
  - NEVER put actors inside the system boundary. System name goes INSIDE the rectangle at the top.
- DFD Level 0 (Context Diagram): EXACTLY ONE process element (the system), external entities only, NO data stores, data flows named in snake_case. The single process id must be "sys".
- DFD Level 1: numbered processes (label = "1 Name", "2 Name" etc), same external entities as Level 0, data stores appear (label = "D1 Name", "D2 Name"), all Level 0 data flows preserved. External entities CANNOT connect directly to data stores.
- DFD Level 2: decomposes the FIRST complex process from Level 1, sub-processes numbered e.g. "1.1 Name", "1.2 Name". Balances with parent process flows.
- All DFD data flow labels must use snake_case.
- ERD: Identify all entities (nouns/objects) and relationships (verbs between entities) from the pseudocode/code. Include all relevant attributes. For cardinality use "one" or "many". For participation use "partial" or "total". Mark primary keys (isPrimary:true) and foreign keys (isForeign:true). Weak entities (isWeak:true) depend on a strong entity. Multi-valued attributes use isMultiValued:true. Derived attributes use isDerived:true.`;

  const raw = await callOpenAI(apiKey, systemPrompt, `${codeType}:\n${code}`, 0.2);
  const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleaned) as DesignTools;
};

export const aiAutocomplete = async (
  apiKey: string,
  currentCode: string,
  cursorPosition: number
): Promise<string[]> => {
  const before = currentCode.substring(0, cursorPosition);
  const lines = before.split('\n');
  const currentLine = lines[lines.length - 1].trim();

  if (currentLine.length < 2) return [];

  const systemPrompt = `You are a VCE pseudocode assistant. Based on the current line being typed, suggest 1-3 completions.
Rules:
- Only suggest valid VCE pseudocode continuations for the CURRENT LINE.
- Use proper keywords: BEGIN, END, IF...THEN, ELSE, END IF, FOR...FROM...TO, END FOR, WHILE...END WHILE, INPUT, OUTPUT, DEFINE, RETURN, ←, ≠, ≤, ≥, ×, MOD, AND, OR, NOT.
- Each suggestion should complete the current line, not add new lines.
- Return ONLY a JSON array of strings, e.g. ["suggestion1", "suggestion2"]
- Max 3 suggestions. If current line looks complete, return [].`;

  const userContent = `Context (last 5 lines):
${lines.slice(-5).join('\n')}

Current partial line: "${currentLine}"`;

  try {
    const raw = await callOpenAI(apiKey, systemPrompt, userContent, 0.3);
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleaned);
    if (Array.isArray(suggestions)) return suggestions.slice(0, 3);
    return [];
  } catch {
    return [];
  }
};
