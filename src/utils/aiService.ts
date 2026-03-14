const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

const callClaude = async (
  apiKey: string,
  systemPrompt: string,
  userContent: string,
  temperature = 0.2
): Promise<string> => {
  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 8192,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userContent },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Claude error: ${response.status}`);
  }

  const data = await response.json();
  return data.content?.[0]?.text?.trim() ?? '';
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

  return callClaude(apiKey, systemPrompt, pseudocode);
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

  return callClaude(apiKey, systemPrompt, code);
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

  return callClaude(apiKey, systemPrompt, pseudocode);
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

  const raw = await callClaude(apiKey, systemPrompt, userContent, 0.4);
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

export type MockupWidgetType =
  | 'window'
  | 'label'
  | 'textbox'
  | 'textarea'
  | 'button'
  | 'dropdown'
  | 'checkbox'
  | 'radio'
  | 'listbox'
  | 'table'
  | 'image'
  | 'progressbar'
  | 'menubar'
  | 'statusbar'
  | 'groupbox'
  | 'annotation';

export interface MockupWidget {
  id: string;
  type: MockupWidgetType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  placeholder?: string;
  items?: string[];
  checked?: boolean;
  value?: string;
  annotation?: string;
  columns?: string[];
  rows?: string[][];
}

export interface MockupScreen {
  title: string;
  width: number;
  height: number;
  widgets: MockupWidget[];
}

export interface TestingTableRow {
  testNumber: number;
  dataType: 'normal' | 'boundary' | 'invalid';
  description: string;
  inputData: Record<string, string>;
  expectedOutput: string;
  actualOutput: string;
  pass: boolean | null;
  isBoundary: boolean;
  boundaryNote?: string;
}

export interface TestingTable {
  inputs: string[];
  rows: TestingTableRow[];
  validationRules: string[];
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
  mockup: MockupScreen[];
  testingTable: TestingTable;
}

function parseJson<T>(raw: string): T {
  let cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let start = -1;
  if (firstBrace !== -1 && firstBracket !== -1) {
    start = Math.min(firstBrace, firstBracket);
  } else if (firstBrace !== -1) {
    start = firstBrace;
  } else if (firstBracket !== -1) {
    start = firstBracket;
  }
  const openChar = start !== -1 ? cleaned[start] : null;
  const closeChar = openChar === '{' ? '}' : ']';
  const end = closeChar ? cleaned.lastIndexOf(closeChar) : -1;
  if (start !== -1 && end !== -1 && end > start) {
    cleaned = cleaned.slice(start, end + 1);
  }
  return JSON.parse(cleaned) as T;
}

export const aiGenerateDesignTools = async (
  apiKey: string,
  code: string,
  codeType: 'pseudocode' | 'python' | 'javascript'
): Promise<DesignTools> => {
  const codeBlock = `${codeType}:\n${code}`;

  const [flowchartAndDd, ipoAndUcd, dfd, erdAndMockup, testingTableRaw] = await Promise.all([
    callClaude(apiKey, `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "flowchart": [
    { "id": "1", "type": "terminal|process|decision|io|predefined", "label": "text", "next": "id", "yes": "id", "no": "id" }
  ],
  "dataDictionary": [
    { "name": "var", "dataType": "Integer|Float|String|Boolean|Date|Array(Type)", "formatForDisplay": "NNN or XX..XX", "sizeBytes": "4 bytes", "sizeDisplay": "6", "description": "what stored", "example": "42", "validation": "rule or empty" }
  ]
}
Rules:
- Flowchart: terminal (oval) START/END, process (rect) computations, decision (diamond) IF/loops with yes/no, io (parallelogram) INPUT/OUTPUT, predefined (striped rect) function calls. First node id "1" type "terminal" label "START". Last node terminal label "END".
- Data Dictionary: ALL variables. VCAA types. N=digit X=char format notation. Include every variable used.`, codeBlock, 0.2),

    callClaude(apiKey, `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "ipoChart": {
    "title": "Process Name",
    "inputs": ["item (Type)"],
    "process": ["1. Plain English step"],
    "outputs": ["item (Type)"]
  },
  "ucd": {
    "systemName": "System Name",
    "actors": [{ "id": "a1", "name": "User", "side": "left" }],
    "useCases": [{ "id": "uc1", "label": "Verb Noun" }],
    "relationships": [{ "type": "association|include|extend|generalization", "from": "id", "to": "id" }]
  }
}
Rules:
- IPO: plain English process steps only, no pseudocode syntax. Data items only in inputs/outputs.
- UCD (strict UML 2.5): association from actorId to useCaseId. include: base→included (mandatory call). extend: extending→base (optional). generalization: child→parent. Primary actors left, secondary right.`, codeBlock, 0.2),

    callClaude(apiKey, `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and return ONLY valid JSON (no markdown, no explanation) — a JSON array of 3 DFD levels:
[
  { "level": 0, "title": "Context Diagram – Name", "elements": [{ "id": "sys", "type": "process", "label": "SystemName" }, { "id": "e1", "type": "external_entity", "label": "User" }], "flows": [{ "from": "e1", "to": "sys", "label": "input_data" }] },
  { "level": 1, "title": "Level 1 DFD – Name", "elements": [{ "id": "e1", "type": "external_entity", "label": "User" }, { "id": "p1", "type": "process", "label": "1 Name" }, { "id": "ds1", "type": "data_store", "label": "D1 Name" }], "flows": [{ "from": "e1", "to": "p1", "label": "data" }] },
  { "level": 2, "title": "Level 2 DFD – Decomposition", "parentProcessId": "p1", "elements": [{ "id": "p1_1", "type": "process", "label": "1.1 Name" }], "flows": [] }
]
Rules:
- Level 0: EXACTLY ONE process (id "sys"), external entities only, NO data stores, snake_case flow labels.
- Level 1: numbered processes "1 Name", same external entities, data stores "D1 Name", external entities CANNOT connect to data stores directly.
- Level 2: decomposes first complex process, sub-processes "1.1 Name" etc, balances parent flows.`, codeBlock, 0.2),

    callClaude(apiKey, `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and generate a VCAA-style Testing Table. Return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "inputs": ["variableName1", "variableName2"],
  "validationRules": ["rule1 plain English", "rule2 plain English"],
  "rows": [
    {
      "testNumber": 1,
      "dataType": "normal",
      "description": "Plain English description of what is being tested",
      "inputData": { "variableName1": "value1", "variableName2": "value2" },
      "expectedOutput": "What the program should display or do",
      "actualOutput": "",
      "pass": null,
      "isBoundary": false,
      "boundaryNote": ""
    }
  ]
}
Rules:
- Identify ALL input variables and ALL validation rules from the code.
- Generate at minimum 8-12 comprehensive test cases.
- MUST include: normal/valid data (2-3 cases), boundary values for EVERY validation condition, and invalid/erroneous data (2-3 cases).
- For EVERY boundary condition (e.g. age >= 18): include BOTH the exact boundary value (accept, isBoundary: true) AND the value just outside it (reject, isBoundary: true).
- boundaryNote: for boundary rows explain e.g. "Lower boundary: minimum valid age" or "Just below lower boundary: should be rejected".
- dataType: "normal" for valid mid-range data, "boundary" for exact boundary or just-outside-boundary values, "invalid" for clearly erroneous data.
- actualOutput: always empty string (student fills this in during testing).
- pass: always null (student fills this in).
- expectedOutput: be specific about what the program outputs for that input.`, codeBlock, 0.2),

    callClaude(apiKey, `You are a VCE Software Development teacher in Victoria, Australia.
Analyse the given ${codeType} and return ONLY valid JSON (no markdown, no explanation) with this exact structure:
{
  "erd": {
    "entities": [{ "id": "e1", "name": "Entity", "isWeak": false, "attributes": [{ "name": "id", "isPrimary": true, "isForeign": false, "isMultiValued": false, "isDerived": false }] }],
    "relationships": [{ "id": "r1", "name": "RELATES", "isWeak": false, "entities": ["e1","e2"], "cardinality": {"e1":"one","e2":"many"}, "participation": {"e1":"partial","e2":"total"}, "attributes": [] }]
  },
  "mockup": [
    { "title": "Screen Title", "width": 640, "height": 480, "widgets": [
      { "id": "w1", "type": "menubar", "label": "File  Edit  Help", "x": 0, "y": 0, "width": 640, "height": 24 },
      { "id": "w2", "type": "label", "label": "Field:", "x": 20, "y": 50, "width": 120, "height": 24 },
      { "id": "w3", "type": "textbox", "label": "", "placeholder": "Enter value", "x": 150, "y": 50, "width": 200, "height": 28, "annotation": "User input field" },
      { "id": "w4", "type": "button", "label": "Submit", "x": 150, "y": 100, "width": 100, "height": 32, "annotation": "Submits the form" },
      { "id": "w5", "type": "statusbar", "label": "Ready", "x": 0, "y": 456, "width": 640, "height": 24 }
    ]}
  ]
}
Rules:
- ERD: all entities (nouns), relationships (verbs), all attributes, cardinality "one"/"many", participation "partial"/"total", mark isPrimary/isForeign/isMultiValued/isDerived.
- Mockup: 1–3 screens. INPUT numeric→textbox, choice→dropdown/radio, long text→textarea, yes/no→checkbox. OUTPUT list→listbox/table, single value→label. All x/y/width/height integers, no overlapping widgets, fit within screen bounds. Widget label is visible text.`, codeBlock, 0.2),
  ]);

  const { flowchart, dataDictionary } = parseJson<{ flowchart: FlowchartNode[]; dataDictionary: DataDictionaryRow[] }>(flowchartAndDd);
  const { ipoChart, ucd } = parseJson<{ ipoChart: IpoChart; ucd: DesignTools['ucd'] }>(ipoAndUcd);
  const dfdParsed = parseJson<DfdLevel[]>(dfd);
  const { erd, mockup } = parseJson<{ erd: DesignTools['erd']; mockup: MockupScreen[] }>(erdAndMockup);
  const testingTable = parseJson<TestingTable>(testingTableRaw);

  return { flowchart, dataDictionary, ipoChart, ucd, dfd: dfdParsed, erd, mockup, testingTable };
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
    const raw = await callClaude(apiKey, systemPrompt, userContent, 0.3);
    const cleaned = raw.replace(/```json\n?|\n?```/g, '').trim();
    const suggestions = JSON.parse(cleaned);
    if (Array.isArray(suggestions)) return suggestions.slice(0, 3);
    return [];
  } catch {
    return [];
  }
};
