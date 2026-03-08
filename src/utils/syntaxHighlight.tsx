import React from 'react';

interface Token {
  type: 'keyword' | 'builtin' | 'string' | 'comment' | 'number' | 'decorator' | 'function' | 'operator' | 'plain';
  value: string;
}

const PYTHON_KEYWORDS = new Set([
  'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
  'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
  'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
  'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
  'try', 'while', 'with', 'yield',
]);

const PYTHON_BUILTINS = new Set([
  'print', 'input', 'len', 'range', 'int', 'float', 'str', 'bool',
  'list', 'dict', 'set', 'tuple', 'type', 'isinstance', 'hasattr',
  'getattr', 'setattr', 'enumerate', 'zip', 'map', 'filter', 'sorted',
  'reversed', 'sum', 'min', 'max', 'abs', 'round', 'open', 'super',
  'object', 'property', 'staticmethod', 'classmethod',
]);

const JS_KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void',
  'while', 'with', 'yield', 'async', 'await',
]);

const JS_BUILTINS = new Set([
  'console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean',
  'Promise', 'JSON', 'Date', 'RegExp', 'Error', 'Map', 'Set', 'Symbol',
  'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'setTimeout', 'setInterval',
  'clearTimeout', 'clearInterval', 'fetch', 'document', 'window',
]);

function tokenizePython(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '#') {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    if (line[i] === '@') {
      let j = i + 1;
      while (j < line.length && /[\w.]/.test(line[j])) j++;
      tokens.push({ type: 'decorator', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      const triple = line.slice(i, i + 3) === quote.repeat(3);
      const end = triple ? quote.repeat(3) : quote;
      let j = i + (triple ? 3 : 1);
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line.slice(j, j + end.length) === end) { j += end.length; break; }
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/\d/.test(line[i]) || (line[i] === '.' && /\d/.test(line[i + 1] ?? ''))) {
      let j = i;
      while (j < line.length && /[\d._xXoObBa-fA-FjJ]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isCall = line[j] === '(';
      if (PYTHON_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (PYTHON_BUILTINS.has(word)) {
        tokens.push({ type: 'builtin', value: word });
      } else if (isCall) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    if (/[+\-*/%=<>!&|^~]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=<>!&|^~]/.test(line[j])) j++;
      tokens.push({ type: 'operator', value: line.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ type: 'plain', value: line[i] });
    i++;
  }

  return tokens;
}

function tokenizeJS(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    if (line.slice(i, i + 2) === '//' ) {
      tokens.push({ type: 'comment', value: line.slice(i) });
      break;
    }

    if (line[i] === '`' || line[i] === '"' || line[i] === "'") {
      const quote = line[i];
      let j = i + 1;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === quote) { j++; break; }
        j++;
      }
      tokens.push({ type: 'string', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/\d/.test(line[i]) || (line[i] === '.' && /\d/.test(line[i + 1] ?? ''))) {
      let j = i;
      while (j < line.length && /[\d._xXa-fA-Fn]/.test(line[j])) j++;
      tokens.push({ type: 'number', value: line.slice(i, j) });
      i = j;
      continue;
    }

    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      const isCall = line[j] === '(';
      if (JS_KEYWORDS.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (JS_BUILTINS.has(word)) {
        tokens.push({ type: 'builtin', value: word });
      } else if (isCall) {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'plain', value: word });
      }
      i = j;
      continue;
    }

    if (/[+\-*/%=<>!&|^~?]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[+\-*/%=<>!&|^~?]/.test(line[j])) j++;
      tokens.push({ type: 'operator', value: line.slice(i, j) });
      i = j;
      continue;
    }

    tokens.push({ type: 'plain', value: line[i] });
    i++;
  }

  return tokens;
}

const TOKEN_CLASSES: Record<Token['type'], string> = {
  keyword:   'text-blue-400',
  builtin:   'text-cyan-400',
  string:    'text-amber-300',
  comment:   'text-gray-500 italic',
  number:    'text-green-400',
  decorator: 'text-yellow-400',
  function:  'text-yellow-300',
  operator:  'text-red-400',
  plain:     'text-gray-200',
};

export function highlightLine(line: string, language: 'python' | 'javascript'): React.ReactNode {
  if (!line) return '\u00A0';
  const tokens = language === 'python' ? tokenizePython(line) : tokenizeJS(line);
  return tokens.map((tok, i) => (
    <span key={i} className={TOKEN_CLASSES[tok.type]}>{tok.value}</span>
  ));
}
