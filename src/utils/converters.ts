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

export const codeToPseudocode = (code: string, language: 'python' | 'javascript'): string => {
  let lines = code.split('\n');
  let convertedLines: string[] = [];
  let skipNext = false;
  let hasBegin = false;

  for (let i = 0; i < lines.length; i++) {
    if (skipNext) {
      skipNext = false;
      continue;
    }

    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('//')) {
      continue;
    }

    // Skip Python comments unless they indicate end of program
    if (trimmed.startsWith('#')) {
      if (trimmed.toLowerCase().includes('end of program') ||
          trimmed.toLowerCase().includes('start of program')) {
        continue;
      }
      continue;
    }

    if (language === 'python') {
      if (trimmed === 'def main():' || trimmed.startsWith('if __name__')) {
        if (i === 0 || convertedLines.length === 0) {
          convertedLines.push('BEGIN');
          hasBegin = true;
        }
        continue;
      }

      if (trimmed.startsWith('def ') && !trimmed.startsWith('def main')) {
        const funcMatch = trimmed.match(/def\s+(\w+)\s*\((.*?)\):/);
        if (funcMatch) {
          const [, funcName, params] = funcMatch;
          convertedLines.push(`DEFINE ${funcName}(${params})`);
        }
        continue;
      }

      if (trimmed.startsWith('if ')) {
        const condition = trimmed.replace(/^if\s+/, '').replace(/:$/, '');
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`IF ${pseudoCondition} THEN`);
        continue;
      }

      if (trimmed.startsWith('elif ')) {
        const condition = trimmed.replace(/^elif\s+/, '').replace(/:$/, '');
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`ELSE IF ${pseudoCondition} THEN`);
        continue;
      }

      if (trimmed === 'else:') {
        convertedLines.push('ELSE');
        continue;
      }

      if (trimmed.startsWith('for ')) {
        const forMatch = trimmed.match(/for\s+(\w+)\s+in\s+range\s*\(\s*(.+?)\s*,\s*(.+?)\s*\+\s*1\s*\):/);
        if (forMatch) {
          const [, variable, start, end] = forMatch;
          convertedLines.push(`FOR ${variable} FROM ${start} TO ${end}`);
        }
        continue;
      }

      if (trimmed.startsWith('while ')) {
        const condition = trimmed.replace(/^while\s+/, '').replace(/:$/, '');
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`WHILE ${pseudoCondition}`);
        continue;
      }

      if (trimmed.startsWith('print(')) {
        const value = trimmed.match(/print\((.*)\)/)?.[1] || '';
        convertedLines.push(`OUTPUT ${value}`);
        continue;
      }

      if (trimmed.includes('= input(') || trimmed.includes('= int(input(') || trimmed.includes('= float(input(')) {
        const variable = trimmed.split('=')[0].trim();
        convertedLines.push(`INPUT ${variable}`);
        continue;
      }

      if (trimmed.startsWith('return ')) {
        const value = trimmed.substring(7);
        convertedLines.push(`RETURN ${value}`);
        continue;
      }
    } else {
      if (trimmed === 'function main() {' || trimmed === 'main();') {
        if (trimmed === 'function main() {') {
          convertedLines.push('BEGIN');
          hasBegin = true;
        }
        continue;
      }

      if (trimmed.startsWith('function ') && !trimmed.startsWith('function main')) {
        const funcMatch = trimmed.match(/function\s+(\w+)\s*\((.*?)\)\s*{/);
        if (funcMatch) {
          const [, funcName, params] = funcMatch;
          convertedLines.push(`DEFINE ${funcName}(${params})`);
        }
        continue;
      }

      if (trimmed.startsWith('if (')) {
        const condition = trimmed.match(/if\s*\((.*?)\)\s*{/)?.[1] || '';
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`IF ${pseudoCondition} THEN`);
        continue;
      }

      if (trimmed.startsWith('} else if (')) {
        const condition = trimmed.match(/else\s+if\s*\((.*?)\)\s*{/)?.[1] || '';
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`ELSE IF ${pseudoCondition} THEN`);
        continue;
      }

      if (trimmed === '} else {') {
        convertedLines.push('ELSE');
        continue;
      }

      if (trimmed === '}') {
        continue;
      }

      if (trimmed.startsWith('for (')) {
        const forMatch = trimmed.match(/for\s*\(\s*let\s+(\w+)\s*=\s*(.+?)\s*;\s*\w+\s*<=\s*(.+?)\s*;/);
        if (forMatch) {
          const [, variable, start, end] = forMatch;
          convertedLines.push(`FOR ${variable} FROM ${start} TO ${end}`);
        }
        continue;
      }

      if (trimmed.startsWith('while (')) {
        const condition = trimmed.match(/while\s*\((.*?)\)\s*{/)?.[1] || '';
        const pseudoCondition = convertConditionToPseudo(condition);
        convertedLines.push(`WHILE ${pseudoCondition}`);
        continue;
      }

      if (trimmed.startsWith('console.log(')) {
        const value = trimmed.match(/console\.log\((.*)\);?/)?.[1] || '';
        convertedLines.push(`OUTPUT ${value}`);
        continue;
      }

      if (trimmed.includes('= prompt(') || trimmed.includes('= parseInt(prompt(') || trimmed.includes('= parseFloat(prompt(')) {
        const variable = trimmed.split('=')[0].trim().replace('let ', '').replace('const ', '').replace('var ', '');
        convertedLines.push(`INPUT ${variable}`);
        continue;
      }

      if (trimmed.startsWith('return ')) {
        const value = trimmed.substring(7).replace(/;$/, '');
        convertedLines.push(`RETURN ${value}`);
        continue;
      }
    }

    // Handle regular assignment statements
    let convertedLine = trimmed
      .replace(/;$/, '')
      .replace(/\*/g, '×')
      .replace(/!=/g, '≠')
      .replace(/<=/g, '≤')
      .replace(/>=/g, '≥');

    if (convertedLine && convertedLine !== '{' && convertedLine !== '}') {
      // Convert = to ← for assignments
      if (convertedLine.includes('=') && !convertedLine.includes('==') &&
          !convertedLine.includes('≠') && !convertedLine.includes('≤') &&
          !convertedLine.includes('≥')) {
        convertedLine = convertedLine.replace(/=/g, '←');
      }
      convertedLines.push(convertedLine);
    }
  }

  // Only add END if we added BEGIN
  if (hasBegin) {
    convertedLines.push('END');
  }

  return convertedLines.join('\n');
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
