export interface ReservedWordCategory {
  name: string;
  words: string[];
  icon: string;
}

export const reservedWordCategories: ReservedWordCategory[] = [
  {
    name: 'Program Structure',
    icon: 'braces',
    words: ['BEGIN', 'END']
  },
  {
    name: 'Control Flow',
    icon: 'git-branch',
    words: ['IF', 'THEN', 'ELSE', 'END IF', 'ELSE IF']
  },
  {
    name: 'Loops',
    icon: 'repeat',
    words: ['FOR', 'FROM', 'TO', 'END FOR', 'WHILE', 'END WHILE']
  },
  {
    name: 'Functions',
    icon: 'function-square',
    words: ['DEFINE', 'RETURN']
  },
  {
    name: 'Input/Output',
    icon: 'arrow-left-right',
    words: ['INPUT', 'OUTPUT']
  },
  {
    name: 'Operators',
    icon: 'calculator',
    words: ['←', '=', '≠', '<', '>', '≤', '≥', '+', '-', '×', '/', 'MOD']
  },
  {
    name: 'Logical',
    icon: 'check-circle',
    words: ['AND', 'OR', 'NOT']
  }
];
