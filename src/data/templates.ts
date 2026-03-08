export interface Template {
  name: string;
  description: string;
  code: string;
}

export const templates: Template[] = [
  {
    name: 'Basic Structure',
    description: 'Empty program template',
    code: `BEGIN

END`
  },
  {
    name: 'Selection (IF-ELSE)',
    description: 'Basic conditional statement',
    code: `BEGIN
INPUT age
IF age ≥ 18 THEN
    OUTPUT "Adult"
ELSE
    OUTPUT "Minor"
END IF
END`
  },
  {
    name: 'Multiple Selection',
    description: 'Multiple conditions with ELSE IF',
    code: `BEGIN
INPUT grade
IF grade ≥ 90 THEN
    OUTPUT "A"
ELSE IF grade ≥ 80 THEN
    OUTPUT "B"
ELSE IF grade ≥ 70 THEN
    OUTPUT "C"
ELSE
    OUTPUT "F"
END IF
END`
  },
  {
    name: 'FOR Loop',
    description: 'Fixed iteration loop',
    code: `BEGIN
sum ← 0
FOR i FROM 1 TO 10
    sum ← sum + i
END FOR
OUTPUT sum
END`
  },
  {
    name: 'WHILE Loop',
    description: 'Conditional iteration loop',
    code: `BEGIN
count ← 0
INPUT number
WHILE count < number
    OUTPUT count
    count ← count + 1
END WHILE
END`
  },
  {
    name: 'Function Definition',
    description: 'Creating and using functions',
    code: `BEGIN
DEFINE add(a, b)
    result ← a + b
    RETURN result

x ← 5
y ← 3
total ← add(x, y)
OUTPUT total
END`
  },
  {
    name: 'Factorial',
    description: 'Calculate factorial of a number',
    code: `BEGIN
INPUT n
factorial ← 1
FOR i FROM 1 TO n
    factorial ← factorial × i
END FOR
OUTPUT factorial
END`
  },
  {
    name: 'Fibonacci Sequence',
    description: 'Generate Fibonacci numbers',
    code: `BEGIN
INPUT n
a ← 0
b ← 1
OUTPUT a
OUTPUT b
FOR i FROM 3 TO n
    c ← a + b
    OUTPUT c
    a ← b
    b ← c
END FOR
END`
  },
  {
    name: 'Bubble Sort',
    description: 'Sort an array using bubble sort',
    code: `BEGIN
DEFINE bubbleSort(arr, size)
    FOR i FROM 0 TO size - 1
        FOR j FROM 0 TO size - i - 2
            IF arr[j] > arr[j + 1] THEN
                temp ← arr[j]
                arr[j] ← arr[j + 1]
                arr[j + 1] ← temp
            END IF
        END FOR
    END FOR
    RETURN arr
END`
  },
  {
    name: 'Linear Search',
    description: 'Search for an element in array',
    code: `BEGIN
DEFINE linearSearch(arr, size, target)
    FOR i FROM 0 TO size - 1
        IF arr[i] = target THEN
            RETURN i
        END IF
    END FOR
    RETURN -1
END`
  },
  {
    name: 'Maximum Value',
    description: 'Find maximum in a list',
    code: `BEGIN
DEFINE findMax(arr, size)
    max ← arr[0]
    FOR i FROM 1 TO size - 1
        IF arr[i] > max THEN
            max ← arr[i]
        END IF
    END FOR
    RETURN max
END`
  },
  {
    name: 'Prime Number Check',
    description: 'Check if a number is prime',
    code: `BEGIN
INPUT n
isPrime ← true
IF n ≤ 1 THEN
    isPrime ← false
ELSE
    FOR i FROM 2 TO n - 1
        IF n MOD i = 0 THEN
            isPrime ← false
        END IF
    END FOR
END IF
OUTPUT isPrime
END`
  }
];
