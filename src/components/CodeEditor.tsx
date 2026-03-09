import React, { useRef } from 'react';
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
      }, 0);
    }
  };

  const lines = value.split('\n');
  const displayLines = lines.length < minLines
    ? [...lines, ...Array(minLines - lines.length).fill('')]
    : lines;

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-600 bg-[#1e1e1e] font-mono text-sm ${className}`}>
      <div className="absolute inset-0 overflow-auto pointer-events-none z-10">
        <div className="py-2 min-w-max min-h-full">
          {displayLines.map((line, index) => (
            <div key={index} className="flex leading-relaxed">
              <span className="inline-block w-10 flex-shrink-0 text-right pr-3 text-[#858585] select-none border-r border-[#3e3e3e] text-xs py-0.5">
                {index < lines.length ? index + 1 : ''}
              </span>
              <span className="pl-3 whitespace-pre py-0.5 text-[#d4d4d4]">
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
        placeholder={!value ? placeholder : undefined}
        spellCheck={false}
        className="relative w-full h-full min-h-[180px] py-2 pl-14 pr-4 bg-transparent resize-none outline-none z-20 leading-relaxed"
        style={{
          color: 'transparent',
          caretColor: '#aeafad',
          lineHeight: '1.5rem',
        }}
      />

      {!value && placeholder && (
        <div
          className="absolute top-2 left-14 right-4 text-[#6b7280] pointer-events-none z-5 whitespace-pre font-mono text-sm leading-relaxed"
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
