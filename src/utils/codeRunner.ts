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

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    _pyodideInstance?: any;
    _pyodideLoading?: Promise<any>;
  }
}

const getPyodide = async (): Promise<any> => {
  if (window._pyodideInstance) {
    return window._pyodideInstance;
  }

  if (window._pyodideLoading) {
    return window._pyodideLoading;
  }

  window._pyodideLoading = (async () => {
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Pyodide'));
        document.head.appendChild(script);
      });
    }

    const pyodide = await window.loadPyodide!({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
    });

    window._pyodideInstance = pyodide;
    return pyodide;
  })();

  return window._pyodideLoading;
};

export const runPython = async (code: string): Promise<ExecutionResult> => {
  const output: string[] = [];

  try {
    const pyodide = await getPyodide();

    (window as any)._pyodide_input = (prompt: string) => {
      const value = window.prompt(prompt || 'Enter input:');
      const result = value !== null ? value : '';
      output.push(`> ${result}`);
      return result;
    };

    await pyodide.runPythonAsync(`
import sys
import builtins
from io import StringIO

_stdout_capture = StringIO()
sys.stdout = _stdout_capture
sys.stderr = StringIO()

import js
def _patched_input(prompt=''):
    result = js.window._pyodide_input(str(prompt) if prompt else '')
    return str(result) if result is not None else ''
builtins.input = _patched_input
`);

    await pyodide.runPythonAsync(code);

    const stdout: string = pyodide.runPython('_stdout_capture.getvalue()');
    pyodide.runPython('sys.stdout = sys.__stdout__');
    delete (window as any)._pyodide_input;

    if (stdout) {
      const lines = stdout.split('\n');
      if (lines[lines.length - 1] === '') lines.pop();
      output.push(...lines);
    }

    return { output };
  } catch (error: any) {
    delete (window as any)._pyodide_input;
    const message: string = error.message || String(error);
    const cleanMessage = message
      .replace(/File "<exec>", /g, '')
      .replace(/File "\/lib\/.*?", line \d+, in \S+\n/g, '')
      .trim();
    return { output, error: cleanMessage };
  }
};
