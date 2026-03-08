import React, { useState } from 'react';
import { X, Play, Terminal } from 'lucide-react';
import { runJavaScript, runPython } from '../utils/codeRunner';

interface ConversionPanelProps {
  content: string;
  language: 'python' | 'javascript';
  onClose: () => void;
}

export const ConversionPanel: React.FC<ConversionPanelProps> = ({
  content,
  language,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput([]);
    setError('');

    try {
      if (language === 'javascript') {
        const result = runJavaScript(content);
        setOutput(result.output);
        if (result.error) {
          setError(result.error);
        }
      } else {
        setOutput(['Running Python code...']);
        const result = await runPython(content);
        setOutput(result.output);
        if (result.error) {
          setError(result.error);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const lines = content.split('\n');

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Converted {language === 'python' ? 'Python' : 'JavaScript'} Code
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-sm rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 p-4 overflow-auto">
          <div className="font-mono text-sm">
            {lines.map((line, index) => (
              <div key={index} className="flex">
                <span className="inline-block w-12 text-right pr-4 text-gray-500 dark:text-gray-500 select-none border-r border-gray-300 dark:border-gray-600">
                  {index + 1}
                </span>
                <span className="pl-4 text-gray-800 dark:text-gray-200 whitespace-pre">
                  {line || '\u00A0'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {(output.length > 0 || error) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <Terminal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Output
              </span>
            </div>
            <div className="p-4 max-h-64 overflow-auto">
              <div className="font-mono text-sm">
                {output.map((line, index) => (
                  <div key={index} className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    {line}
                  </div>
                ))}
                {error && (
                  <div className="text-red-600 dark:text-red-400 mt-2 whitespace-pre-wrap">
                    Error: {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
