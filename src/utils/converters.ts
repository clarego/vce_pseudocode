export interface ConversionResult {
  code: string;
  language: 'python' | 'javascript';
}

export const pseudocodeToCode = (pseudocode: string, language: 'python' | 'javascript'): string => {
  let lines = pseudocode.split('\n');
  let convertedLines: string[] = [];
  let indentLevel = 0;
  const indent = language === 'python' ? '    ' : '  ';
  const numericVariables = new Set<string>();

  const getIndent = (level: number) => indent.repeat(level);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    const inputVarMatch = trimmed.match(/^(\w+)\s*←\s*INPUT\s*\(/i);
    const inputKeywordMatch = trimmed.startsWith('INPUT ');
    const inputVariable = inputVarMatch ? inputVarMatch[1] : inputKeywordMatch ? trimmed.substring(6).trim() : null;

    if (inputVariable) {
      const variable = inputVariable;

      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (nextLine.includes(variable)) {
          // Check if variable is used in numeric operations
          const escapedVar = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          // Check for: comparisons (>, <, >=, <=, !=, ==, ≥, ≤, ≠)
          // arithmetic operations (+, -, *, /, ×, %)
          // numeric functions (MOD, DIV)
          // range operations (FROM...TO, TO...in range)
          // assignment with arithmetic (var ← numeric_expr)
          if (
            nextLine.match(new RegExp(`${escapedVar}\\s*[><=!≥≤≠]+|[><=!≥≤≠]+\\s*${escapedVar}`)) ||
            nextLine.match(new RegExp(`${escapedVar}\\s*[+\\-*/×%]|[+\\-*/×%]\\s*${escapedVar}`)) ||
            nextLine.match(new RegExp(`${escapedVar}\\s+(MOD|DIV)`, 'i')) ||
            nextLine.match(new RegExp(`(FOR|TO)\\s+.*${escapedVar}`, 'i')) ||
            nextLine.match(new RegExp(`←\\s*.*${escapedVar}\\s*[+\\-*/×%]`))
          ) {
            numericVariables.add(variable);
            break;
          }
        }
      }
    }
  }

  for (let line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
      convertedLines.push(line);
      continue;
    }

    if (trimmed === 'BEGIN') {
      if (language === 'python') {
        convertedLines.push('# Start of program');
      } else {
        convertedLines.push('function main() {');
        indentLevel++;
      }
      continue;
    }

    if (trimmed === 'END') {
      if (language === 'python') {
        convertedLines.push('# End of program');
      } else {
        indentLevel = Math.max(0, indentLevel - 1);
        convertedLines.push(getIndent(indentLevel) + '}');
      }
      continue;
    }

    if (trimmed === 'END IF') {
      indentLevel = Math.max(0, indentLevel - 1);
      if (language === 'javascript') {
        convertedLines.push(getIndent(indentLevel) + '}');
      }
      continue;
    }

    if (trimmed === 'END FOR') {
      indentLevel = Math.max(0, indentLevel - 1);
      if (language === 'javascript') {
        convertedLines.push(getIndent(indentLevel) + '}');
      }
      continue;
    }

    if (trimmed === 'END WHILE') {
      indentLevel = Math.max(0, indentLevel - 1);
      if (language === 'javascript') {
        convertedLines.push(getIndent(indentLevel) + '}');
      }
      continue;
    }

    if (trimmed.startsWith('IF ')) {
      const condition = trimmed.substring(3).replace(' THEN', '');
      const convertedCondition = convertCondition(condition);

      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + `if ${convertedCondition}:`);
      } else {
        convertedLines.push(getIndent(indentLevel) + `if (${convertedCondition}) {`);
      }
      indentLevel++;
      continue;
    }

    if (trimmed.startsWith('ELSE IF ')) {
      indentLevel = Math.max(0, indentLevel - 1);
      const condition = trimmed.substring(8).replace(' THEN', '');
      const convertedCondition = convertCondition(condition);

      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + `elif ${convertedCondition}:`);
      } else {
        convertedLines.push(getIndent(indentLevel) + `} else if (${convertedCondition}) {`);
      }
      indentLevel++;
      continue;
    }

    if (trimmed === 'ELSE') {
      indentLevel = Math.max(0, indentLevel - 1);
      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + 'else:');
      } else {
        convertedLines.push(getIndent(indentLevel) + '} else {');
      }
      indentLevel++;
      continue;
    }

    if (trimmed.startsWith('FOR ')) {
      const forMatch = trimmed.match(/FOR\s+(\w+)\s+FROM\s+(.+?)\s+TO\s+(.+)/i);
      if (forMatch) {
        const [, variable, start, end] = forMatch;
        if (language === 'python') {
          convertedLines.push(getIndent(indentLevel) + `for ${variable} in range(${start}, ${end} + 1):`);
        } else {
          convertedLines.push(getIndent(indentLevel) + `for (let ${variable} = ${start}; ${variable} <= ${end}; ${variable}++) {`);
        }
        indentLevel++;
      }
      continue;
    }

    if (trimmed.startsWith('WHILE ')) {
      const condition = trimmed.substring(6);
      const convertedCondition = convertCondition(condition);

      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + `while ${convertedCondition}:`);
      } else {
        convertedLines.push(getIndent(indentLevel) + `while (${convertedCondition}) {`);
      }
      indentLevel++;
      continue;
    }

    if (trimmed.startsWith('OUTPUT ') || trimmed.startsWith('OUTPUT(')) {
      let value: string;
      if (trimmed.startsWith('OUTPUT(')) {
        const inner = trimmed.substring(7);
        value = inner.endsWith(')') ? inner.slice(0, -1) : inner;
      } else {
        value = trimmed.substring(7);
      }
      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + `print(${value})`);
      } else {
        convertedLines.push(getIndent(indentLevel) + `console.log(${value});`);
      }
      continue;
    }

    if (trimmed.startsWith('INPUT ')) {
      const variable = trimmed.substring(6).trim();
      if (language === 'python') {
        if (numericVariables.has(variable)) {
          convertedLines.push(getIndent(indentLevel) + `${variable} = int(input("Enter ${variable}: "))`);
        } else {
          convertedLines.push(getIndent(indentLevel) + `${variable} = input("Enter ${variable}: ")`);
        }
      } else {
        if (numericVariables.has(variable)) {
          convertedLines.push(getIndent(indentLevel) + `${variable} = parseInt(prompt("Enter ${variable}:"));`);
        } else {
          convertedLines.push(getIndent(indentLevel) + `${variable} = prompt("Enter ${variable}:");`);
        }
      }
      continue;
    }

    if (trimmed.startsWith('DEFINE ')) {
      const funcMatch = trimmed.match(/DEFINE\s+(\w+)\s*\((.*?)\)/);
      if (funcMatch) {
        const [, funcName, params] = funcMatch;
        if (language === 'python') {
          convertedLines.push(getIndent(indentLevel) + `def ${funcName}(${params}):`);
          indentLevel++;
        } else {
          convertedLines.push(getIndent(indentLevel) + `function ${funcName}(${params}) {`);
          indentLevel++;
        }
      }
      continue;
    }

    if (trimmed.startsWith('RETURN ')) {
      const value = trimmed.substring(7);
      if (language === 'python') {
        convertedLines.push(getIndent(indentLevel) + `return ${value}`);
      } else {
        convertedLines.push(getIndent(indentLevel) + `return ${value};`);
      }
      continue;
    }

    const inputAssignMatch = trimmed.match(/^(\w+)\s*←\s*INPUT\s*\((.*?)\)\s*$/i);
    if (inputAssignMatch) {
      const [, variable, prompt] = inputAssignMatch;
      const promptStr = prompt.trim() || `"Enter ${variable}: "`;
      if (language === 'python') {
        if (numericVariables.has(variable)) {
          convertedLines.push(getIndent(indentLevel) + `${variable} = int(input(${promptStr}))`);
        } else {
          convertedLines.push(getIndent(indentLevel) + `${variable} = input(${promptStr})`);
        }
      } else {
        if (numericVariables.has(variable)) {
          convertedLines.push(getIndent(indentLevel) + `${variable} = parseInt(prompt(${promptStr}));`);
        } else {
          convertedLines.push(getIndent(indentLevel) + `${variable} = prompt(${promptStr});`);
        }
      }
      continue;
    }

    let convertedLine = trimmed
      .replace(/←/g, '=')
      .replace(/×/g, '*')
      .replace(/≠/g, '!=')
      .replace(/≤/g, '<=')
      .replace(/≥/g, '>=');

    // For Python, convert MOD to % operator
    if (language === 'python') {
      convertedLine = convertedLine.replace(/\s+MOD\s+/gi, ' % ');
      convertedLine = convertedLine.replace(/\s+DIV\s+/gi, ' // ');
    }

    if (language === 'javascript' && !convertedLine.endsWith(';') && !convertedLine.endsWith('{') && !convertedLine.endsWith('}')) {
      convertedLine += ';';
    }

    convertedLines.push(getIndent(indentLevel) + convertedLine);
  }

  if (language === 'javascript') {
    convertedLines.push('\nmain();');
  }

  return convertedLines.join('\n');
};

const convertCondition = (condition: string): string => {
  return condition
    .replace(/←/g, '=')
    .replace(/×/g, '*')
    .replace(/≠/g, '!=')
    .replace(/≤/g, '<=')
    .replace(/≥/g, '>=')
    .replace(/\s+AND\s+/g, ' && ')
    .replace(/\s+OR\s+/g, ' || ')
    .replace(/\s+NOT\s+/g, ' ! ');
};

function getIndentLevel(line: string): number {
  let spaces = 0;
  for (let i = 0; i < line.length; i++) {
    if (line[i] === ' ') spaces++;
    else if (line[i] === '\t') spaces += 4;
    else break;
  }
  return Math.floor(spaces / 4);
}

function indentStr(level: number): string {
  return '    '.repeat(level);
}

function convertExprToPseudo(expr: string): string {
  return expr
    .replace(/\*\*/g, '^')
    .replace(/\*/g, '×')
    .replace(/!=/g, '≠')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/ % /g, ' MOD ')
    .replace(/ \/\/ /g, ' DIV ');
}

function convertAssignmentRHS(rhs: string): string {
  rhs = rhs.trim();
  const joinMatch = rhs.match(/^["']([^"']*)["']\.join\((.+)\)$/);
  if (joinMatch) {
    return `JOIN ${joinMatch[2]} WITH "${joinMatch[1]}"`;
  }
  const listMatch = rhs.match(/^list\(["']([^"']*)["']\)$/);
  if (listMatch) {
    return `LIST("${listMatch[1]}")`;
  }
  const listCallMatch = rhs.match(/^list\((.+)\)$/);
  if (listCallMatch) {
    return `LIST(${listCallMatch[1]})`;
  }
  return convertExprToPseudo(rhs);
}

function convertPrintArg(arg: string): string {
  return arg.trim();
}

export const codeToPseudocode = (code: string, language: 'python' | 'javascript'): string => {
  const lines = code.split('\n');
  const result: string[] = [];

  const indentStack: number[] = [0];
  const blockStack: string[] = [];

  const currentPseudoIndent = (): number => blockStack.length;

  const closeBlocksTo = (targetPyIndent: number) => {
    while (indentStack.length > 1 && indentStack[indentStack.length - 1] > targetPyIndent) {
      indentStack.pop();
      const block = blockStack.pop();
      if (block) {
        result.push(indentStr(blockStack.length) + block);
      }
    }
  };

  if (language === 'python') {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) continue;

      const pyIndent = getIndentLevel(line);
      closeBlocksTo(pyIndent);

      const pseudoIndent = currentPseudoIndent();

      if (trimmed.startsWith('if __name__') || trimmed === 'pass') continue;

      if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue;

      if (trimmed.startsWith('def main():')) {
        result.push('BEGIN');
        indentStack.push(pyIndent + 1);
        blockStack.push('END');
        continue;
      }

      if (trimmed.startsWith('def ')) {
        const funcMatch = trimmed.match(/def\s+(\w+)\s*\((.*?)\):/);
        if (funcMatch) {
          result.push(indentStr(pseudoIndent) + `DEFINE ${funcMatch[1]}(${funcMatch[2]})`);
          result.push(indentStr(pseudoIndent) + 'BEGIN');
          indentStack.push(pyIndent + 1);
          blockStack.push('END');
        }
        continue;
      }

      if (trimmed.startsWith('if ')) {
        const condition = trimmed.replace(/^if\s+/, '').replace(/:$/, '');
        result.push(indentStr(pseudoIndent) + `IF ${convertConditionToPseudo(condition)} THEN`);
        indentStack.push(pyIndent + 1);
        blockStack.push('END IF');
        continue;
      }

      if (trimmed.startsWith('elif ')) {
        const condition = trimmed.replace(/^elif\s+/, '').replace(/:$/, '');
        if (blockStack[blockStack.length - 1] === 'END IF') {
          blockStack.pop();
          indentStack.pop();
        }
        const newPseudoIndent = currentPseudoIndent();
        result.push(indentStr(newPseudoIndent) + `ELSE IF ${convertConditionToPseudo(condition)} THEN`);
        indentStack.push(pyIndent + 1);
        blockStack.push('END IF');
        continue;
      }

      if (trimmed === 'else:') {
        if (blockStack[blockStack.length - 1] === 'END IF') {
          blockStack.pop();
          indentStack.pop();
        }
        const newPseudoIndent = currentPseudoIndent();
        result.push(indentStr(newPseudoIndent) + 'ELSE');
        indentStack.push(pyIndent + 1);
        blockStack.push('END IF');
        continue;
      }

      if (trimmed.startsWith('for ')) {
        const rangeMatch = trimmed.match(/for\s+(\w+)\s+in\s+range\s*\(\s*(.+?)\s*,\s*(.+?)\s*(?:\+\s*1\s*)?\):/);
        const rangeSimple = trimmed.match(/for\s+(\w+)\s+in\s+range\s*\(\s*(.+?)\s*\):/);
        const iterMatch = trimmed.match(/for\s+(.+?)\s+in\s+(.+?):/);
        if (rangeMatch) {
          const [, v, start, end] = rangeMatch;
          result.push(indentStr(pseudoIndent) + `FOR ${v} FROM ${start} TO ${end}`);
        } else if (rangeSimple) {
          const [, v, end] = rangeSimple;
          result.push(indentStr(pseudoIndent) + `FOR ${v} FROM 0 TO ${end} - 1`);
        } else if (iterMatch) {
          const [, v, iterable] = iterMatch;
          result.push(indentStr(pseudoIndent) + `FOR EACH ${v} IN ${iterable}`);
        }
        indentStack.push(pyIndent + 1);
        blockStack.push('END FOR');
        continue;
      }

      if (trimmed.startsWith('while ')) {
        const condition = trimmed.replace(/^while\s+/, '').replace(/:$/, '');
        result.push(indentStr(pseudoIndent) + `WHILE ${convertConditionToPseudo(condition)}`);
        indentStack.push(pyIndent + 1);
        blockStack.push('END WHILE');
        continue;
      }

      if (trimmed.startsWith('try:')) {
        continue;
      }
      if (trimmed.startsWith('except') || trimmed.startsWith('finally:')) {
        continue;
      }

      if (trimmed.startsWith('print(')) {
        const inner = trimmed.slice(6, -1);
        result.push(indentStr(pseudoIndent) + `OUTPUT ${convertPrintArg(inner)}`);
        continue;
      }

      if (trimmed.includes('= input(') || trimmed.includes('= int(input(') || trimmed.includes('= float(input(')) {
        const variable = trimmed.split('=')[0].trim();
        result.push(indentStr(pseudoIndent) + `INPUT ${variable}`);
        continue;
      }

      if (trimmed.startsWith('return ')) {
        const value = trimmed.substring(7);
        result.push(indentStr(pseudoIndent) + `RETURN ${convertExprToPseudo(value)}`);
        continue;
      }

      if (trimmed === 'break') {
        result.push(indentStr(pseudoIndent) + 'BREAK');
        continue;
      }

      if (trimmed === 'continue') {
        result.push(indentStr(pseudoIndent) + 'CONTINUE');
        continue;
      }

      if (trimmed.startsWith('exit(') || trimmed.startsWith('sys.exit(')) {
        result.push(indentStr(pseudoIndent) + 'EXIT');
        continue;
      }

      const augAssign = trimmed.match(/^(\w+)\s*(\+=|-=|\*=|\/=|%=)\s*(.+)$/);
      if (augAssign) {
        const [, v, op, rhs] = augAssign;
        const opMap: Record<string, string> = { '+=': '+', '-=': '-', '*=': '×', '/=': '/', '%=': 'MOD' };
        result.push(indentStr(pseudoIndent) + `${v} ← ${v} ${opMap[op] || op} ${convertExprToPseudo(rhs)}`);
        continue;
      }

      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*(?:\[.+?\])?)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.includes('==')) {
        const [, lhs, rhs] = assignMatch;
        result.push(indentStr(pseudoIndent) + `${lhs} ← ${convertAssignmentRHS(rhs)}`);
        continue;
      }

      const multiAssign = trimmed.match(/^([a-zA-Z_]\w*(?:\s*,\s*[a-zA-Z_]\w*)+)\s*=\s*(.+)$/);
      if (multiAssign && !trimmed.includes('==')) {
        const [, lhs, rhs] = multiAssign;
        result.push(indentStr(pseudoIndent) + `${lhs} ← ${convertAssignmentRHS(rhs)}`);
        continue;
      }

      result.push(indentStr(pseudoIndent) + convertExprToPseudo(trimmed));
    }

    closeBlocksTo(-1);

  } else {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('//')) continue;

      const pseudoIndent = currentPseudoIndent();

      if (trimmed === 'function main() {') {
        result.push('BEGIN');
        blockStack.push('END');
        continue;
      }
      if (trimmed === 'main();') continue;
      if (trimmed === '}') {
        const block = blockStack.pop();
        if (block) result.push(indentStr(blockStack.length) + block);
        continue;
      }

      if (trimmed.startsWith('function ') && !trimmed.startsWith('function main')) {
        const funcMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)\s*\{/);
        if (funcMatch) {
          result.push(indentStr(pseudoIndent) + `DEFINE ${funcMatch[1]}(${funcMatch[2]})`);
          result.push(indentStr(pseudoIndent) + 'BEGIN');
          blockStack.push('END');
        }
        continue;
      }

      if (trimmed.startsWith('if (')) {
        const condition = trimmed.match(/if\s*\((.*?)\)\s*\{/)?.[1] || '';
        result.push(indentStr(pseudoIndent) + `IF ${convertConditionToPseudo(condition)} THEN`);
        blockStack.push('END IF');
        continue;
      }

      if (trimmed.startsWith('} else if (')) {
        blockStack.pop();
        const condition = trimmed.match(/else\s+if\s*\((.*?)\)\s*\{/)?.[1] || '';
        result.push(indentStr(blockStack.length) + `ELSE IF ${convertConditionToPseudo(condition)} THEN`);
        blockStack.push('END IF');
        continue;
      }

      if (trimmed === '} else {') {
        blockStack.pop();
        result.push(indentStr(blockStack.length) + 'ELSE');
        blockStack.push('END IF');
        continue;
      }

      if (trimmed.startsWith('for (')) {
        const forMatch = trimmed.match(/for\s*\(\s*(?:let|var|const)\s+(\w+)\s*=\s*(.+?)\s*;\s*\w+\s*<=\s*(.+?)\s*;/);
        if (forMatch) {
          result.push(indentStr(pseudoIndent) + `FOR ${forMatch[1]} FROM ${forMatch[2]} TO ${forMatch[3]}`);
        }
        blockStack.push('END FOR');
        continue;
      }

      if (trimmed.startsWith('while (')) {
        const condition = trimmed.match(/while\s*\((.*?)\)\s*\{/)?.[1] || '';
        result.push(indentStr(pseudoIndent) + `WHILE ${convertConditionToPseudo(condition)}`);
        blockStack.push('END WHILE');
        continue;
      }

      if (trimmed.startsWith('console.log(')) {
        const value = trimmed.match(/console\.log\((.*)\);?/)?.[1] || '';
        result.push(indentStr(pseudoIndent) + `OUTPUT ${value}`);
        continue;
      }

      if (trimmed.includes('= prompt(') || trimmed.includes('= parseInt(prompt(') || trimmed.includes('= parseFloat(prompt(')) {
        const variable = trimmed.split('=')[0].trim().replace(/^(let|const|var)\s+/, '');
        result.push(indentStr(pseudoIndent) + `INPUT ${variable}`);
        continue;
      }

      if (trimmed.startsWith('return ')) {
        const value = trimmed.substring(7).replace(/;$/, '');
        result.push(indentStr(pseudoIndent) + `RETURN ${convertExprToPseudo(value)}`);
        continue;
      }

      let convertedLine = trimmed.replace(/;$/, '');
      convertedLine = convertExprToPseudo(convertedLine);
      if (convertedLine.includes('=') && !convertedLine.includes('==') &&
          !convertedLine.includes('≠') && !convertedLine.includes('≤') &&
          !convertedLine.includes('≥')) {
        convertedLine = convertedLine.replace(/(?<![=!<>])=(?!=)/g, '←');
      }
      if (convertedLine && convertedLine !== '{' && convertedLine !== '}') {
        result.push(indentStr(pseudoIndent) + convertedLine);
      }
    }
  }

  return result.join('\n');
};

const convertConditionToPseudo = (condition: string): string => {
  return condition
    .replace(/&&/g, ' AND ')
    .replace(/\|\|/g, ' OR ')
    .replace(/!/g, 'NOT ')
    .replace(/\*/g, '×')
    .replace(/!=/g, '≠')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥');
};
