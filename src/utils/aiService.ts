const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const callOpenAI = async (apiKey: string, systemPrompt: string, userContent: string): Promise<string> => {
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
      temperature: 0.2,
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

