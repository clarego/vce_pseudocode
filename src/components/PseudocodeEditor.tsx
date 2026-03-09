import React, { useRef, useEffect, useCallback } from 'react';

interface PseudocodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorPositionChange: (position: number) => void;
}

export const PseudocodeEditor: React.FC<PseudocodeEditorProps> = ({
  value,
  onChange,
  onCursorPositionChange,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const getIndentLevel = (line: string): number => {
    let spaces = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') spaces++;
      else break;
    }
    return Math.floor(spaces / 4);
  };

  const shouldDedentLine = (trimmed: string): boolean => {
    return trimmed === 'END' || trimmed === 'END IF' || trimmed === 'END FOR' ||
      trimmed === 'END WHILE' || trimmed === 'ELSE' || trimmed.startsWith('ELSE IF ') ||
      trimmed.startsWith('UNTIL ');
  };

  const shouldIndentNextLine = (trimmed: string): boolean => {
    return trimmed === 'BEGIN' || trimmed.startsWith('IF ') || trimmed === 'ELSE' ||
      trimmed.startsWith('ELSE IF ') || trimmed.startsWith('FOR ') ||
      trimmed.startsWith('WHILE ') || trimmed.startsWith('REPEAT') ||
      trimmed.startsWith('DEFINE ') || trimmed.endsWith('THEN');
  };

  const calculateIndentForNextLine = (currentLine: string, allLines: string[], lineIndex: number): number => {
    const trimmed = currentLine.trim();
    const currentIndent = getIndentLevel(currentLine);

    if (shouldIndentNextLine(trimmed)) {
      return currentIndent + 1;
    }

    if (trimmed === 'END' || trimmed === 'END IF' || trimmed === 'END FOR' ||
        trimmed === 'END WHILE' || trimmed.startsWith('UNTIL ')) {
      return Math.max(0, currentIndent);
    }

    return currentIndent;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      const cursorPos = textarea.selectionStart;
      const textBefore = value.substring(0, cursorPos);
      const textAfter = value.substring(cursorPos);

      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      const allLines = value.split('\n');
      const currentLineIndex = lines.length - 1;

      let indent = calculateIndentForNextLine(currentLine, allLines, currentLineIndex);
      const indentString = '    '.repeat(indent);

      const newValue = textBefore + '\n' + indentString + textAfter;
      onChange(newValue);

      setTimeout(() => {
        const newCursorPos = cursorPos + 1 + indentString.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        onCursorPositionChange(newCursorPos);
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();

      const cursorPos = textarea.selectionStart;
      const textBefore = value.substring(0, cursorPos);
      const textAfter = value.substring(cursorPos);

      const newValue = textBefore + '    ' + textAfter;
      onChange(newValue);

      setTimeout(() => {
        const newCursorPos = cursorPos + 4;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        onCursorPositionChange(newCursorPos);
      }, 0);
    } else if (e.key === 'Backspace') {
      const cursorPos = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;
      if (cursorPos !== selEnd) return;

      const textBefore = value.substring(0, cursorPos);
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      if (currentLine.length > 0 && currentLine.trim() === '' && currentLine.length % 4 === 0) {
        e.preventDefault();
        const textAfter = value.substring(cursorPos);
        const newLine = currentLine.substring(4);
        const newValue = [...lines.slice(0, -1), newLine].join('\n') + textAfter;
        onChange(newValue);

        setTimeout(() => {
          const newCursorPos = cursorPos - 4;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
          onCursorPositionChange(newCursorPos);
        }, 0);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(newValue);
      return;
    }

    const cursorPos = textarea.selectionStart;
    const textBefore = newValue.substring(0, cursorPos);
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1];
    const trimmed = currentLine.trim();

    if (shouldDedentLine(trimmed) && currentLine.startsWith('    ')) {
      const currentIndent = getIndentLevel(currentLine);
      if (currentIndent > 0) {
        const newIndent = Math.max(0, currentIndent - 1);
        const newIndentString = '    '.repeat(newIndent);
        const newLine = newIndentString + trimmed;
        const linesBeforeCurrent = lines.slice(0, -1);
        const textAfter = newValue.substring(cursorPos);
        const replaced = [...linesBeforeCurrent, newLine].join('\n') + textAfter;
        onChange(replaced);
        setTimeout(() => {
          const newCursorPos = cursorPos - 4;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
          onCursorPositionChange(newCursorPos);
        }, 0);
        return;
      }
    }

    onChange(newValue);
  };

  const handleClick = () => {
    if (textareaRef.current) {
      onCursorPositionChange(textareaRef.current.selectionStart);
    }
  };

  const handleKeyUp = () => {
    if (textareaRef.current) {
      onCursorPositionChange(textareaRef.current.selectionStart);
    }
  };

  const lines = value.split('\n');
  const lineCount = lines.length;

  const highlightedContent = lines.map((line, index) => {
    const reservedWords = [
      'BEGIN', 'END', 'IF', 'THEN', 'ELSE', 'END IF', 'ELSE IF',
      'FOR', 'FROM', 'TO', 'END FOR', 'WHILE', 'END WHILE',
      'DEFINE', 'RETURN', 'INPUT', 'OUTPUT',
      'AND', 'OR', 'NOT', 'MOD'
    ];

    let highlightedLine = line.replace(/ /g, '&nbsp;');

    reservedWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      highlightedLine = highlightedLine.replace(
        regex,
        `<span class="text-blue-600 dark:text-blue-400 font-semibold">${word}</span>`
      );
    });

    const operators = ['←', '≠', '≤', '≥', '×'];
    operators.forEach(op => {
      highlightedLine = highlightedLine.replace(
        new RegExp(op.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        `<span class="text-purple-600 dark:text-purple-400">${op}</span>`
      );
    });

    return (
      <div key={index} className="table-row">
        <div className="table-cell text-right text-gray-500 dark:text-gray-500 select-none border-r border-gray-300 dark:border-gray-600" style={{ width: '3rem', paddingRight: '0.5rem' }}>
          {index + 1}
        </div>
        <div
          className="table-cell"
          style={{ paddingLeft: '0.5rem' }}
          dangerouslySetInnerHTML={{ __html: highlightedLine || '&nbsp;' }}
        />
      </div>
    );
  });

  return (
    <div className="relative h-full font-mono text-sm">
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-hidden p-4 bg-white dark:bg-gray-800 pointer-events-none z-10"
      >
        <div className="table text-gray-800 dark:text-gray-200 min-w-full">
          {highlightedContent}
        </div>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onClick={handleClick}
        onKeyUp={handleKeyUp}
        onKeyDown={handleKeyDown}
        onScroll={syncScroll}
        className="absolute inset-0 w-full h-full font-mono text-sm bg-transparent resize-none outline-none z-20 overflow-auto"
        style={{
          lineHeight: '1.5',
          color: 'transparent',
          caretColor: 'white',
          padding: '1rem',
          paddingLeft: '5.125rem',
        }}
        spellCheck={false}
      />

      <style>{`
        textarea::selection {
          background-color: rgba(59, 130, 246, 0.5);
        }
        .dark textarea::selection {
          background-color: rgba(96, 165, 250, 0.5);
        }
      `}</style>
    </div>
  );
};
