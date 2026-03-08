export interface ExecutionResult {
  output: string[];
  error?: string;
}

export const runJavaScript = (code: string): ExecutionResult => {
  const output: string[] = [];
  const originalConsoleLog = console.log;
  const originalPrompt = window.prompt;

  try {
    console.log = (...args: any[]) => {
      output.push(args.map(arg => String(arg)).join(' '));
    };

    window.prompt = (message?: string): string | null => {
      const value = originalPrompt(message || 'Enter input:');
      if (value !== null) {
        output.push(`Input: ${value}`);
      }
      return value;
    };

    const wrappedCode = `
      (function() {
        ${code}
      })();
    `;

    eval(wrappedCode);

    console.log = originalConsoleLog;
    window.prompt = originalPrompt;

    return { output };
  } catch (error: any) {
    console.log = originalConsoleLog;
    window.prompt = originalPrompt;
    return { output, error: error.message };
  }
};

export const runPython = async (code: string): Promise<ExecutionResult> => {
  const output: string[] = [];

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        language: 'python',
        version: '3.10.0',
        files: [
          {
            name: 'main.py',
            content: code,
          },
        ],
        stdin: '',
      }),
    });

    const result = await response.json();

    if (result.run && result.run.output) {
      output.push(result.run.output);
    }

    if (result.run && result.run.stderr) {
      return { output, error: result.run.stderr };
    }

    return { output };
  } catch (error: any) {
    return { output, error: `Failed to execute Python code: ${error.message}` };
  }
};
