import React, { useRef, useCallback } from 'react';
import { highlightLine } from '../utils/syntaxHighlight';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'python' | 'javascript';
  placeholder?: string;
  className?: string;
  minLines?: number;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language,
  placeholder,
  className = '',
  minLines = 12,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.substring(0, start) + '    ' + value.substring(end);
      onChange(next);
      setTimeout(() => {
        ta.selectionStart = ta.selectionEnd = start + 4;
        syncScroll();
      }, 0);
    }
  };

  const lines = value.split('\n');
  const displayLines = lines.length < minLines
    ? [...lines, ...Array(minLines - lines.length).fill('')]
    : lines;

  const lineHeight = '1.5rem';

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-600 bg-[#1e1e1e] font-mono text-sm ${className}`}>
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden pointer-events-none z-10"
        aria-hidden
      >
        <div className="py-2 w-max min-w-full">
          {displayLines.map((line, index) => (
            <div key={index} className="flex" style={{ lineHeight }}>
              <span className="inline-block w-10 flex-shrink-0 text-right pr-3 text-[#858585] select-none border-r border-[#3e3e3e] text-xs" style={{ lineHeight }}>
                {index < lines.length ? index + 1 : ''}
              </span>
              <span className="pl-3 whitespace-pre text-[#d4d4d4]" style={{ lineHeight }}>
                {index < lines.length && line
                  ? highlightLine(line, language)
                  : '\u00A0'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        spellCheck={false}
        className="relative w-full py-2 pl-14 pr-4 bg-transparent resize-none outline-none z-20 overflow-auto"
        style={{
          color: 'transparent',
          caretColor: '#aeafad',
          lineHeight,
          minHeight: `calc(${minLines} * ${lineHeight} + 1rem)`,
        }}
      />

      {!value && placeholder && (
        <div
          className="absolute top-2 left-14 right-4 text-[#6b7280] pointer-events-none whitespace-pre z-5"
          style={{ lineHeight }}
          aria-hidden
        >
          {placeholder}
        </div>
      )}

      <style>{`
        .code-editor-textarea::selection {
          background-color: rgba(59, 130, 246, 0.4);
        }
      `}</style>
    </div>
  );
};
