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
