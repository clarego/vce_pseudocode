import React, { useState } from 'react';
import { X, Play, Terminal, Copy, Check } from 'lucide-react';
import { runJavaScript, runPython } from '../utils/codeRunner';
import { highlightLine } from '../utils/syntaxHighlight';

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
        if (result.error) setError(result.error);
      } else {
        setOutput(['Loading Python environment... (first run may take a moment)']);
        const result = await runPython(content);
        setOutput(result.output);
        if (result.error) setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const lines = content.split('\n');
  const langLabel = language === 'python' ? 'Python' : 'JavaScript';
  const langBadgeClass = language === 'python'
    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80">
        <div className="flex items-center gap-2.5">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
            Converted Code
          </h3>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${langBadgeClass}`}>
            {langLabel}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white transition-colors font-medium"
          >
            <Play className="w-3.5 h-3.5" />
            {isRunning ? 'Running...' : 'Run'}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 transition-colors font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 overflow-auto bg-[#1e1e1e]">
          <div className="font-mono text-sm leading-relaxed py-3 min-w-max">
            {lines.map((line, index) => (
              <div
                key={index}
                className="flex hover:bg-white/5 transition-colors"
              >
                <span className="inline-block w-12 flex-shrink-0 text-right pr-4 text-[#858585] select-none border-r border-[#3e3e3e] text-xs leading-relaxed py-0.5">
                  {index + 1}
                </span>
                <span className="pl-4 whitespace-pre py-0.5">
                  {highlightLine(line, language)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {(output.length > 0 || error) && (
          <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
              <Terminal className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                Output
              </span>
            </div>
            <div className="p-4 max-h-48 overflow-auto">
              <div className="font-mono text-xs space-y-0.5">
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
