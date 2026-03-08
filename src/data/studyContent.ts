export interface Chapter {
  id: string;
  order_num: number;
  title: string;
  description: string;
}

export interface Lesson {
  id: string;
  chapter_id: string;
  order_num: number;
  title: string;
  content: string;
  pseudocode_example?: string;
  python_example?: string;
  javascript_example?: string;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  order_num: number;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  starter_code?: string;
  solution?: string;
  hints?: string[];
}

export const studyContentData = {
  chapters: [
    {
      id: '36d8421d-118e-4dc8-a5fa-30da0901e314',
      order_num: 1,
      title: 'Introduction to Pseudocode',
      description: 'Learn the basics of pseudocode and why it\'s important in software development'
    },
    {
      id: '1ccd324c-8444-444b-87f6-73e7fa5bfb78',
      order_num: 2,
      title: 'Variables and Data Types',
      description: 'Understanding how to work with variables and different types of data'
    },
    {
      id: 'd19b3e1a-fa6e-49b3-868b-2f9cfbee8a18',
      order_num: 3,
      title: 'Input and Output',
      description: 'Learn how to get data from users and display results'
    },
    {
      id: '12c05e15-171d-416a-8177-534b265270f5',
      order_num: 4,
      title: 'Conditional Statements',
      description: 'Making decisions in your code with IF, ELSE IF, and ELSE'
    },
    {
      id: '318d1b43-0f88-4ec2-a401-8ee758307545',
      order_num: 5,
      title: 'Loops and Iteration',
      description: 'Repeating actions with FOR and WHILE loops'
    },
    {
      id: 'a3ae3963-4f4c-41af-a74a-6770754f8944',
      order_num: 6,
      title: 'Advanced Concepts',
      description: 'Functions, complex conditions, and real-world applications'
    },
    {
      id: 'b8df4821-9c3f-4b21-b2e1-9d4e8f2a1c5d',
      order_num: 7,
      title: 'Exam Practice',
      description: 'VCE-style exam questions: trace tables, debugging, and code analysis'
    }
  ],
  lessons: [
    {
      id: 'lesson-1-1',
      chapter_id: '36d8421d-118e-4dc8-a5fa-30da0901e314',
      order_num: 1,
      title: 'What is Pseudocode?',
      content: `# What is Pseudocode?

**Pseudocode** is a simple way to write the logic of a program using plain English and structured statements. It's not actual code that a computer can run, but it helps programmers plan and communicate their ideas before writing real code.

## Why Use Pseudocode?

1. **Planning**: Think through your solution before coding
2. **Communication**: Share ideas with team members
3. **Language-Independent**: Works for any programming language
4. **Easy to Understand**: Anyone can read it, even non-programmers

## Pseudocode vs. Real Code

Pseudocode is like a recipe for cooking - it tells you the steps, but not the exact measurements or techniques. Real code is like the actual cooking process with precise instructions.

## Basic Structure

All pseudocode programs follow this basic structure:

\`\`\`
BEGIN
  [Your instructions here]
END
\`\`\`

The BEGIN and END keywords mark where your program starts and finishes.`,
      pseudocode_example: 'BEGIN\n    OUTPUT "Hello, World!"\nEND',
      python_example: 'def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()',
      javascript_example: 'function main() {\n  console.log("Hello, World!");\n}\n\nmain();'
    },
    {
      id: 'lesson-1-2',
      chapter_id: '36d8421d-118e-4dc8-a5fa-30da0901e314',
      order_num: 2,
      title: 'Reserved Words and Symbols',
      content: `# Reserved Words and Symbols

Pseudocode uses **reserved words** - special keywords that have specific meanings. These words are usually written in CAPITAL LETTERS to make them stand out.

## Common Reserved Words

- **BEGIN / END**: Mark the start and end of your program
- **INPUT**: Get data from the user
- **OUTPUT / PRINT**: Display data to the user
- **IF / THEN / ELSE / END IF**: Make decisions
- **FOR / WHILE / END FOR / END WHILE**: Repeat actions
- **DEFINE / RETURN**: Create functions

## Important Symbols

- **←** (assignment): Stores a value in a variable
  - Example: \`age ← 18\` means "store 18 in age"
- **=** (equals): Checks if two values are equal
- **≠** (not equal): Checks if two values are different
- **≥** (greater than or equal)
- **≤** (less than or equal)
- **×** (multiplication)

## Why CAPITALS?

Reserved words are written in CAPITALS to distinguish them from variable names and make the structure of your code clear at a glance.`,
      pseudocode_example: 'BEGIN\n    name ← "Alice"\n    OUTPUT "Hello, " + name\nEND'
    },
    {
      id: 'lesson-2-1',
      chapter_id: '1ccd324c-8444-444b-87f6-73e7fa5bfb78',
      order_num: 1,
      title: 'Understanding Variables',
      content: `# Understanding Variables

A **variable** is like a labeled box that stores information. You can put data in it, look at what's inside, and change the contents.

## Variable Names

- Use descriptive names: \`age\`, \`score\`, \`username\`
- Names should explain what the variable stores
- Can contain letters, numbers, and underscores
- Usually start with a lowercase letter

## Storing Values (Assignment)

Use the **←** symbol to store a value in a variable:

\`\`\`
age ← 25
name ← "John"
score ← 100
\`\`\`

This is called **assignment** - you're assigning a value to a variable.

## Using Variables

Once you've stored a value, you can use the variable name anywhere you need that value:

\`\`\`
price ← 50
tax ← 5
total ← price + tax
OUTPUT total
\`\`\``,
      pseudocode_example: 'BEGIN\n    name ← "Sarah"\n    age ← 16\n    OUTPUT "Name: " + name\n    OUTPUT "Age: " + age\nEND'
    },
    {
      id: 'lesson-2-2',
      chapter_id: '1ccd324c-8444-444b-87f6-73e7fa5bfb78',
      order_num: 2,
      title: 'Data Types',
      content: `# Data Types

Variables can store different **types** of data. Understanding data types is crucial for writing correct programs.

## Main Data Types

### Integer (Whole Numbers)
Numbers without decimal points: 1, 42, -15, 1000

\`\`\`
age ← 18
score ← 95
\`\`\`

### Float/Decimal (Numbers with Decimals)
Numbers with decimal points: 3.14, 2.5, -0.5

\`\`\`
price ← 19.99
temperature ← 36.5
\`\`\`

### String (Text)
Text enclosed in quotes: "Hello", "John", "123"

\`\`\`
name ← "Alice"
message ← "Welcome!"
\`\`\`

### Boolean (True/False)
Only two values: true or false

\`\`\`
isStudent ← true
hasLicense ← false
\`\`\`

## Why Data Types Matter

- You can do math with numbers: \`10 + 5 = 15\`
- You can't do math with strings: \`"10" + "5" = "105"\`
- Comparisons work differently for different types`,
      pseudocode_example: 'BEGIN\n    length ← 5\n    width ← 3\n    area ← length × width\n    OUTPUT "Area: " + area\nEND'
    },
    {
      id: 'lesson-3-1',
      chapter_id: 'd19b3e1a-fa6e-49b3-868b-2f9cfbee8a18',
      order_num: 1,
      title: 'Getting Input from Users',
      content: `# Getting Input from Users

Most programs need to get information from users. The **INPUT** keyword reads data from the user.

## Basic Input Syntax

\`\`\`
INPUT variableName
\`\`\`

This tells the program to:
1. Wait for the user to type something
2. Store what they typed in the variable

## Input Examples

\`\`\`
INPUT name
INPUT age
INPUT score
\`\`\`

## Important Notes

- The program pauses and waits for user input
- The user presses Enter to submit their input
- For numbers, the input is automatically converted if used in calculations
- For text, quotes are not needed when typing

## Prompting Users

It's good practice to tell users what to enter:

\`\`\`
OUTPUT "Enter your name:"
INPUT name
OUTPUT "Enter your age:"
INPUT age
\`\`\``,
      pseudocode_example: 'BEGIN\n    OUTPUT "Enter your name:"\n    INPUT name\n    OUTPUT "Hello, " + name\nEND'
    },
    {
      id: 'lesson-3-2',
      chapter_id: 'd19b3e1a-fa6e-49b3-868b-2f9cfbee8a18',
      order_num: 2,
      title: 'Displaying Output',
      content: `# Displaying Output

To show information to users, use **OUTPUT** or **PRINT**. Both keywords do the same thing.

## Basic Output Syntax

\`\`\`
OUTPUT message
PRINT message
\`\`\`

## Displaying Text

\`\`\`
OUTPUT "Hello, World!"
PRINT "Welcome to the program"
\`\`\`

## Displaying Variables

\`\`\`
name ← "Alice"
OUTPUT name
\`\`\`

## Combining Text and Variables

Use the + operator to join (concatenate) text and variables:

\`\`\`
name ← "Bob"
age ← 20
OUTPUT "Name: " + name
OUTPUT "Age: " + age
OUTPUT "Hello, " + name + "! You are " + age + " years old."
\`\`\`

## Output vs Print

- Both work the same way
- OUTPUT is more common in pseudocode
- PRINT is common in many programming languages
- Use whichever is clearer to you`,
      pseudocode_example: 'BEGIN\n    INPUT name\n    INPUT age\n    OUTPUT "Name: " + name\n    OUTPUT "Age: " + age\nEND'
    },
    {
      id: 'lesson-4-1',
      chapter_id: '12c05e15-171d-416a-8177-534b265270f5',
      order_num: 1,
      title: 'IF Statements',
      content: `# IF Statements

**IF statements** let your program make decisions. The program checks a condition and does different things based on whether it's true or false.

## Basic IF Syntax

\`\`\`
IF condition THEN
    [do something]
END IF
\`\`\`

## How It Works

1. The condition is checked (is it true or false?)
2. If TRUE, the code inside runs
3. If FALSE, the code inside is skipped

## Example

\`\`\`
INPUT age
IF age ≥ 18 THEN
    OUTPUT "You are an adult"
END IF
\`\`\`

## Comparison Operators

- **=** equals
- **≠** not equal
- **>** greater than
- **<** less than
- **≥** greater than or equal
- **≤** less than or equal

## Multiple Conditions

Use AND, OR, NOT to combine conditions:

\`\`\`
IF age ≥ 18 AND age < 65 THEN
    OUTPUT "Working age"
END IF
\`\`\``,
      pseudocode_example: 'BEGIN\n    INPUT age\n    IF age ≥ 18 THEN\n        OUTPUT "Adult"\n    END IF\nEND'
    },
    {
      id: 'lesson-4-2',
      chapter_id: '12c05e15-171d-416a-8177-534b265270f5',
      order_num: 2,
      title: 'ELSE and ELSE IF',
      content: `# ELSE and ELSE IF

Sometimes you need to handle multiple possibilities. **ELSE** and **ELSE IF** give you more control.

## ELSE: Two Choices

When you have two possible paths:

\`\`\`
IF condition THEN
    [do this if true]
ELSE
    [do this if false]
END IF
\`\`\`

## Example

\`\`\`
INPUT age
IF age ≥ 18 THEN
    OUTPUT "Adult"
ELSE
    OUTPUT "Minor"
END IF
\`\`\`

## ELSE IF: Multiple Choices

When you have more than two possibilities:

\`\`\`
IF condition1 THEN
    [first option]
ELSE IF condition2 THEN
    [second option]
ELSE IF condition3 THEN
    [third option]
ELSE
    [default option]
END IF
\`\`\`

## Grade Example

\`\`\`
INPUT score
IF score ≥ 90 THEN
    OUTPUT "A"
ELSE IF score ≥ 80 THEN
    OUTPUT "B"
ELSE IF score ≥ 70 THEN
    OUTPUT "C"
ELSE
    OUTPUT "F"
END IF
\`\`\`

The program checks each condition in order and stops at the first TRUE condition.`,
      pseudocode_example: 'BEGIN\n    INPUT score\n    IF score ≥ 90 THEN\n        OUTPUT "A+"\n    ELSE IF score ≥ 80 THEN\n        OUTPUT "B"\n    ELSE IF score ≥ 70 THEN\n        OUTPUT "C"\n    ELSE\n        OUTPUT "F"\n    END IF\nEND'
    },
    {
      id: 'lesson-5-1',
      chapter_id: '318d1b43-0f88-4ec2-a401-8ee758307545',
      order_num: 1,
      title: 'FOR Loops',
      content: `# FOR Loops

A **FOR loop** repeats code a specific number of times. Use it when you know exactly how many times to repeat.

## Syntax

\`\`\`
FOR variable FROM start TO end
    [code to repeat]
END FOR
\`\`\`

## How It Works

1. Variable starts at the start value
2. Code inside the loop runs
3. Variable increases by 1
4. Repeat until variable reaches end value

## Example: Count 1 to 5

\`\`\`
FOR i FROM 1 TO 5
    OUTPUT i
END FOR
\`\`\`

This outputs: 1, 2, 3, 4, 5

## Example: Times Table

\`\`\`
INPUT number
FOR i FROM 1 TO 10
    result ← number × i
    OUTPUT number + " × " + i + " = " + result
END FOR
\`\`\`

## Common Uses

- Counting numbers
- Processing lists
- Repeating actions a set number of times
- Creating patterns`,
      pseudocode_example: 'BEGIN\n    FOR i FROM 1 TO 10\n        OUTPUT i\n    END FOR\nEND'
    },
    {
      id: 'lesson-5-2',
      chapter_id: '318d1b43-0f88-4ec2-a401-8ee758307545',
      order_num: 2,
      title: 'WHILE Loops',
      content: `# WHILE Loops

A **WHILE loop** repeats code as long as a condition is true. Use it when you don't know in advance how many times to repeat.

## Syntax

\`\`\`
WHILE condition
    [code to repeat]
END WHILE
\`\`\`

## How It Works

1. Check if condition is true
2. If true, run the code inside
3. Go back to step 1
4. If false, exit the loop

## Example: Count to 10

\`\`\`
count ← 1
WHILE count ≤ 10
    OUTPUT count
    count ← count + 1
END WHILE
\`\`\`

## Important: Avoid Infinite Loops!

The condition must eventually become false, or the loop runs forever:

**Bad (infinite loop):**
\`\`\`
count ← 1
WHILE count ≤ 10
    OUTPUT count
END WHILE
\`\`\`
count never changes, so the loop never ends!

**Good:**
\`\`\`
count ← 1
WHILE count ≤ 10
    OUTPUT count
    count ← count + 1
END WHILE
\`\`\`

## WHILE vs FOR

- Use FOR when you know how many times to repeat
- Use WHILE when you repeat until a condition is met`,
      pseudocode_example: 'BEGIN\n    count ← 1\n    WHILE count ≤ 5\n        OUTPUT count\n        count ← count + 1\n    END WHILE\nEND'
    },
    {
      id: 'lesson-6-1',
      chapter_id: 'a3ae3963-4f4c-41af-a74a-6770754f8944',
      order_num: 1,
      title: 'Introduction to Functions',
      content: `# Introduction to Functions

**Functions** (also called procedures or subroutines) are reusable blocks of code that perform specific tasks. They help organize your code and avoid repetition.

## Why Use Functions?

1. **Reusability**: Write code once, use it many times
2. **Organization**: Break complex problems into smaller parts
3. **Maintainability**: Easier to fix bugs and make changes
4. **Clarity**: Makes your program easier to understand

## Function Benefits

Instead of writing the same code multiple times:
\`\`\`
OUTPUT "Welcome!"
OUTPUT "Please enter your details"
... (100 lines later)
OUTPUT "Welcome!"
OUTPUT "Please enter your details"
\`\`\`

You can write a function once and call it whenever needed:
\`\`\`
DEFINE showWelcome()
    OUTPUT "Welcome!"
    OUTPUT "Please enter your details"
END

showWelcome()
... (100 lines later)
showWelcome()
\`\`\`

## Key Concepts

- **Define**: Create a function with DEFINE keyword
- **Call**: Use the function by writing its name
- **Parameters**: Input values passed to the function
- **Return**: Output value sent back from the function`,
      pseudocode_example: 'BEGIN\n    DEFINE greet()\n        OUTPUT "Hello, student!"\n    END\n\n    greet()\nEND'
    },
    {
      id: 'lesson-6-2',
      chapter_id: 'a3ae3963-4f4c-41af-a74a-6770754f8944',
      order_num: 2,
      title: 'Defining and Calling Functions',
      content: `# Defining and Calling Functions

## Defining a Function

Use the **DEFINE** keyword to create a function:

\`\`\`
DEFINE functionName()
    [code to execute]
END
\`\`\`

## Example: Simple Function

\`\`\`
DEFINE printBanner()
    OUTPUT "=================="
    OUTPUT "  WELCOME USER   "
    OUTPUT "=================="
END
\`\`\`

## Calling a Function

To use a function, write its name followed by parentheses:

\`\`\`
printBanner()
\`\`\`

This executes all the code inside the function.

## Complete Example

\`\`\`
BEGIN
    DEFINE sayHello()
        OUTPUT "Hello!"
        OUTPUT "How are you today?"
    END

    sayHello()
    OUTPUT "This is after the function"
    sayHello()
END
\`\`\`

**Output:**
\`\`\`
Hello!
How are you today?
This is after the function
Hello!
How are you today?
\`\`\`

## Important Notes

- Define functions before you call them (usually at the start)
- The function name should describe what it does
- Always use parentheses () when calling functions
- A function can be called multiple times`,
      pseudocode_example: 'BEGIN\n    DEFINE showMenu()\n        OUTPUT "1. Start Game"\n        OUTPUT "2. Settings"\n        OUTPUT "3. Exit"\n    END\n\n    showMenu()\nEND',
      python_example: 'def main():\n    def show_menu():\n        print("1. Start Game")\n        print("2. Settings")\n        print("3. Exit")\n    \n    show_menu()\n\nif __name__ == "__main__":\n    main()',
      javascript_example: 'function main() {\n  function showMenu() {\n    console.log("1. Start Game");\n    console.log("2. Settings");\n    console.log("3. Exit");\n  }\n  \n  showMenu();\n}\n\nmain();'
    },
    {
      id: 'lesson-6-3',
      chapter_id: 'a3ae3963-4f4c-41af-a74a-6770754f8944',
      order_num: 3,
      title: 'Functions with Parameters',
      content: `# Functions with Parameters

**Parameters** (also called arguments) allow you to pass data into functions, making them more flexible and powerful.

## Syntax with Parameters

\`\`\`
DEFINE functionName(parameter1, parameter2)
    [use parameters here]
END
\`\`\`

## Example: Greeting with Name

\`\`\`
DEFINE greet(name)
    OUTPUT "Hello, " + name + "!"
    OUTPUT "Welcome to the program"
END

greet("Alice")
greet("Bob")
\`\`\`

**Output:**
\`\`\`
Hello, Alice!
Welcome to the program
Hello, Bob!
Welcome to the program
\`\`\`

## Multiple Parameters

Functions can accept multiple parameters:

\`\`\`
DEFINE calculateArea(length, width)
    area ← length × width
    OUTPUT "Area: " + area
END

calculateArea(5, 3)
calculateArea(10, 7)
\`\`\`

## How Parameters Work

1. When you define a function, you list parameter names in parentheses
2. When you call the function, you provide actual values
3. The values are passed into the function and used like variables

## Example: Personalized Message

\`\`\`
DEFINE welcomeUser(name, age)
    OUTPUT "Welcome, " + name + "!"
    OUTPUT "You are " + age + " years old"
    IF age ≥ 18 THEN
        OUTPUT "You are an adult"
    ELSE
        OUTPUT "You are a minor"
    END IF
END

INPUT userName
INPUT userAge
welcomeUser(userName, userAge)
\`\`\``,
      pseudocode_example: 'BEGIN\n    DEFINE multiply(a, b)\n        result ← a × b\n        OUTPUT result\n    END\n\n    multiply(5, 7)\n    multiply(3, 9)\nEND',
      python_example: 'def main():\n    def multiply(a, b):\n        result = a * b\n        print(result)\n    \n    multiply(5, 7)\n    multiply(3, 9)\n\nif __name__ == "__main__":\n    main()',
      javascript_example: 'function main() {\n  function multiply(a, b) {\n    let result = a * b;\n    console.log(result);\n  }\n  \n  multiply(5, 7);\n  multiply(3, 9);\n}\n\nmain();'
    },
    {
      id: 'lesson-6-4',
      chapter_id: 'a3ae3963-4f4c-41af-a74a-6770754f8944',
      order_num: 4,
      title: 'Functions with Return Values',
      content: `# Functions with Return Values

Functions can send values back to where they were called using the **RETURN** keyword. This lets you use the function's result in calculations or decisions.

## Syntax with Return

\`\`\`
DEFINE functionName(parameters)
    [calculations]
    RETURN value
END
\`\`\`

## Example: Calculate Square

\`\`\`
DEFINE square(number)
    result ← number × number
    RETURN result
END

x ← square(5)
OUTPUT "5 squared is " + x
\`\`\`

**Output:** \`5 squared is 25\`

## Using Return Values

You can:
- Store the returned value in a variable
- Use it directly in calculations
- Use it in conditions

\`\`\`
DEFINE add(a, b)
    RETURN a + b
END

total ← add(10, 5)
OUTPUT total

OUTPUT add(3, 7)

IF add(5, 5) = 10 THEN
    OUTPUT "Math works!"
END IF
\`\`\`

## Return vs. Output

**Important Difference:**
- **OUTPUT**: Displays information to the user
- **RETURN**: Sends a value back to be used in the program

\`\`\`
DEFINE calculate(x, y)
    OUTPUT x + y        # Displays, but doesn't return
END

DEFINE calculateReturn(x, y)
    RETURN x + y        # Returns value for use
END

calculate(2, 3)           # Shows 5, but can't use result
result ← calculateReturn(2, 3)  # Stores 5 in result
\`\`\`

## Complete Example

\`\`\`
DEFINE calculateDiscount(price, percentage)
    discount ← price × (percentage / 100)
    RETURN discount
END

DEFINE finalPrice(price, discountPercent)
    discount ← calculateDiscount(price, discountPercent)
    final ← price - discount
    RETURN final
END

originalPrice ← 100
discountRate ← 20
newPrice ← finalPrice(originalPrice, discountRate)
OUTPUT "Original: $" + originalPrice
OUTPUT "Final: $" + newPrice
\`\`\``,
      pseudocode_example: 'BEGIN\n    DEFINE getMax(a, b)\n        IF a > b THEN\n            RETURN a\n        ELSE\n            RETURN b\n        END IF\n    END\n\n    max ← getMax(15, 23)\n    OUTPUT "Maximum: " + max\nEND',
      python_example: 'def main():\n    def get_max(a, b):\n        if a > b:\n            return a\n        else:\n            return b\n    \n    max_val = get_max(15, 23)\n    print("Maximum: " + str(max_val))\n\nif __name__ == "__main__":\n    main()',
      javascript_example: 'function main() {\n  function getMax(a, b) {\n    if (a > b) {\n      return a;\n    } else {\n      return b;\n    }\n  }\n  \n  let max = getMax(15, 23);\n  console.log("Maximum: " + max);\n}\n\nmain();'
    },
    {
      id: 'lesson-7-1',
      chapter_id: 'b8df4821-9c3f-4b21-b2e1-9d4e8f2a1c5d',
      order_num: 1,
      title: 'Trace Tables and Output Prediction',
      content: `# Trace Tables and Output Prediction

**Trace tables** are used to track variable values as they change through a program. This is a common exam question type.

## What is a Trace Table?

A trace table shows:
- The line number being executed
- Variable values after each line
- Output produced (if any)

## Example from 2024 VCE Exam

\`\`\`
BEGIN
    x ← 1
    y ← 1
    WHILE x < 5
        x ← x + y
        y ← x + y
    END WHILE
    OUTPUT y
END
\`\`\`

### Creating the Trace Table

**Step-by-step execution:**

**Initial values:**
- Line 2: x = 1
- Line 3: y = 1

**First iteration:**
- Line 3: Check condition x < 5? → 1 < 5 = True
- Line 4: x = x + y → x = 1 + 1 = 2
- Line 5: y = x + y → y = 2 + 1 = 3

**Second iteration:**
- Line 3: Check condition x < 5? → 2 < 5 = True
- Line 4: x = x + y → x = 2 + 3 = 5
- Line 5: y = x + y → y = 5 + 3 = 8

**Loop ends:**
- Line 3: Check condition x < 5? → 5 < 5 = False
- Line 7: OUTPUT y → Outputs 8

**Answer: 8**

## Tips for Trace Tables

1. **Go line by line** - Don't skip steps
2. **Write all values** - Even if they don't change
3. **Check conditions** - Evaluate TRUE/FALSE for loops and IFs
4. **Watch assignment order** - Variables update in sequence

## Common Mistakes

- Forgetting to update loop counters
- Mixing up variable order in calculations
- Not checking loop conditions properly`,
      pseudocode_example: 'BEGIN\n    a ← 10\n    b ← 5\n    WHILE a > b\n        a ← a - 2\n        b ← b + 1\n    END WHILE\n    OUTPUT a + b\nEND'
    },
    {
      id: 'lesson-7-2',
      chapter_id: 'b8df4821-9c3f-4b21-b2e1-9d4e8f2a1c5d',
      order_num: 2,
      title: 'Debugging and Error Detection',
      content: `# Debugging and Error Detection

In VCE exams, you'll need to **identify errors** in pseudocode and **suggest fixes**.

## Types of Errors to Look For

### 1. Logic Errors
- Wrong comparison operators (\`>\` instead of \`>=\`)
- Incorrect condition order
- Off-by-one errors in loops

### 2. Missing Code
- Forgot to initialize variables
- Missing loop counter updates
- No RETURN statement in functions

### 3. Incorrect Nesting
- Wrong END IF placement
- Misaligned ELSE statements
- Loop boundaries incorrect

## Example from 2024 Exam

**Problem:** Discount calculation with nested conditions

\`\`\`
Discount ← 5%
IF Total >= 5000 THEN
    Discount ← 10%
    IF Total >= 10000 THEN
        Discount ← 15%
    END IF
END IF
\`\`\`

**Missing line 8:** What checks for $1000-$4999 range?

**Answer:** \`IF Total >= 1000 AND Total < 5000 THEN\`

This ensures customers spending $1000-$4999 get 5% discount.

## Debugging Strategy

1. **Read the description** - Understand what the code should do
2. **Trace with test data** - Use the test table provided
3. **Find the mismatch** - Where does expected ≠ actual?
4. **Identify the cause** - What line produces the wrong result?
5. **Suggest the fix** - Rewrite the incorrect line

## Common Error Patterns

- **Boundary errors**: Using \`>\` when you need \`>=\`
- **Missing cases**: Not covering all possible inputs
- **Wrong operators**: Using OR instead of AND
- **Incorrect updates**: Not modifying loop variables properly`,
      pseudocode_example: 'BEGIN\n    INPUT age\n    IF age >= 18 THEN\n        IF age > 75 THEN\n            status ← "Senior"\n        ELSE\n            status ← "Adult"\n        END IF\n    ELSE\n        status ← "Minor"\n    END IF\n    OUTPUT status\nEND'
    },
    {
      id: 'lesson-7-3',
      chapter_id: 'b8df4821-9c3f-4b21-b2e1-9d4e8f2a1c5d',
      order_num: 3,
      title: 'Function Testing and Test Tables',
      content: `# Function Testing and Test Tables

VCE exams often ask you to **complete test tables** to verify function behavior.

## Test Table Components

A test table has three columns:
- **Test Data**: The input values
- **Expected Result**: What should happen
- **Actual Result**: What actually happens

## Example from 2024 Exam

**Function:** CheckPoints - verifies customer has enough points

\`\`\`
BEGIN CheckPoints(account, amount)
    points ← account.Points_balance
    enough_points ← False
    IF points > amount THEN
        enough_points ← True
    END IF
    RETURN enough_points
END CheckPoints
\`\`\`

**Test Case 1:**
- Input: account.Points_balance = 4000, amount = 5000
- Expected: False (not enough points)
- Actual: False ✓

**Test Case 2:**
- Input: account.Points_balance = 6000, amount = 5000
- Expected: True (has enough points)
- Actual: True ✓

**Test Case 3 (boundary):**
- Input: account.Points_balance = 5000, amount = 5000
- Expected: True (exactly enough)
- Actual: False ✗ **ERROR FOUND!**

**Error:** The condition should be \`>=\` not \`>\`

When points equals amount, the customer should be able to purchase, but the current code returns False.

**Fix:** Change line 3 to: \`IF points >= amount THEN\`

## Creating Good Test Cases

### 1. Boundary Testing
- Test exactly at the limit
- Test one above the limit
- Test one below the limit

### 2. Typical Cases
- Normal expected inputs
- Common scenarios

### 3. Edge Cases
- Minimum values (0, empty)
- Maximum values
- Negative numbers (if applicable)

## Writing Test Tables

1. **Identify parameters** - What inputs does the function take?
2. **Choose test values** - Cover different scenarios
3. **Calculate expected** - Work through manually
4. **Run the code** - Get actual results
5. **Compare** - Find mismatches = errors`,
      pseudocode_example: 'BEGIN ValidatePassword(password)\n    valid ← False\n    IF password.length >= 8 THEN\n        IF password.hasNumber = True THEN\n            valid ← True\n        END IF\n    END IF\n    RETURN valid\nEND'
    },
    {
      id: 'lesson-7-4',
      chapter_id: 'b8df4821-9c3f-4b21-b2e1-9d4e8f2a1c5d',
      order_num: 4,
      title: 'Code Completion Challenges',
      content: `# Code Completion Challenges

In exams, you may need to **complete partial pseudocode** based on a description.

## Example from 2024 Exam

**Scenario:** CompletePayment function processes payments

**Requirements:**
- If paid with points: deduct points from account
- If paid with currency: add 1 point per cent spent

\`\`\`
BEGIN CompletePayment(price, points, payByPoints)
    IF payByPoints = True THEN
        points ← points - price
    ELSE
        points ← points + price
    END IF
    RETURN points
END CompletePayment
\`\`\`

## Strategies for Code Completion

### 1. Read ALL Requirements
- Understand what the code must do
- Note any special conditions
- Check for multiple cases

### 2. Match Data Types
- If parameter is Boolean, use TRUE/FALSE
- If parameter is integer, use numbers
- Check what should be returned

### 3. Use Proper Syntax
- Match the pseudocode style used
- Include proper indentation
- Use correct operators (←, ≥, etc.)

### 4. Handle All Cases
- Use IF/ELSE for two options
- Use multiple ELSE IF for many options
- Consider edge cases

## Common Completion Tasks

**Task 1: Add Missing Condition**
\`\`\`
IF score >= 90 THEN
    grade ← "A"
[MISSING LINE FOR B GRADE]
    grade ← "B"
\`\`\`
Answer: \`ELSE IF score >= 80 THEN\`

**Task 2: Complete Loop**
\`\`\`
total ← 0
[MISSING LOOP TO SUM ARRAY]
    total ← total + numbers[i]
END FOR
\`\`\`
Answer: \`FOR i FROM 0 TO numbers.length - 1\`

**Task 3: Add Validation**
\`\`\`
INPUT age
[MISSING VALIDATION]
    OUTPUT "Invalid age"
ELSE
    OUTPUT "Age accepted"
END IF
\`\`\`
Answer: \`IF age < 0 OR age > 120 THEN\``,
      pseudocode_example: 'BEGIN CalculateDiscount(total)\n    discount ← 0\n    IF total >= 10000 THEN\n        discount ← 15\n    ELSE IF total >= 5000 THEN\n        discount ← 10\n    ELSE IF total >= 1000 THEN\n        discount ← 5\n    END IF\n    RETURN discount\nEND'
    }
  ],
  exercises: [
    {
      id: 'ex-1-1',
      lesson_id: 'lesson-1-1',
      order_num: 1,
      title: 'Your First Program',
      description: 'Write pseudocode to display a welcome message.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    OUTPUT "Welcome to programming!"\nEND',
      hints: ['Use the OUTPUT keyword', 'Text messages go in quotes']
    },
    {
      id: 'ex-2-1',
      lesson_id: 'lesson-2-1',
      order_num: 1,
      title: 'Store and Display',
      description: 'Create variables to store your name and favorite number, then display them.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    name ← "Alex"\n    favoriteNum ← 7\n    OUTPUT "Name: " + name\n    OUTPUT "Favorite number: " + favoriteNum\nEND',
      hints: ['Use ← to store values', 'Remember quotes for text', 'Use OUTPUT to display']
    },
    {
      id: 'ex-2-2',
      lesson_id: 'lesson-2-2',
      order_num: 1,
      title: 'Calculate Rectangle Area',
      description: 'Write pseudocode to calculate and display the area of a rectangle.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n    length ← 5\n    width ← 3\n\nEND',
      solution: 'BEGIN\n    length ← 5\n    width ← 3\n    area ← length × width\n    OUTPUT "Area: " + area\nEND',
      hints: ['Area = length × width', 'Store the result in a variable', 'Use × for multiplication']
    },
    {
      id: 'ex-3-1',
      lesson_id: 'lesson-3-1',
      order_num: 1,
      title: 'Personal Greeting',
      description: 'Ask the user for their name and greet them personally.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    OUTPUT "What is your name?"\n    INPUT name\n    OUTPUT "Hello, " + name + "!"\nEND',
      hints: ['Use OUTPUT to ask a question', 'Use INPUT to get the answer', 'Combine text with +']
    },
    {
      id: 'ex-4-1',
      lesson_id: 'lesson-4-1',
      order_num: 1,
      title: 'Age Check',
      description: 'Check if someone is old enough to vote (18 or older).',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n    INPUT age\n\nEND',
      solution: 'BEGIN\n    INPUT age\n    IF age ≥ 18 THEN\n        OUTPUT "You can vote!"\n    END IF\nEND',
      hints: ['Use IF and THEN', 'Use ≥ for greater than or equal', 'Don\'t forget END IF']
    },
    {
      id: 'ex-4-2',
      lesson_id: 'lesson-4-2',
      order_num: 1,
      title: 'Grade Calculator',
      description: 'Input a score (0-10) and output the letter grade.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    INPUT grade\n\nEND',
      solution: 'BEGIN\n    INPUT grade\n    IF grade = 10 THEN\n        OUTPUT "A+"\n    ELSE IF grade ≥ 9 THEN\n        OUTPUT "A"\n    ELSE IF grade ≥ 8 THEN\n        OUTPUT "B"\n    ELSE IF grade ≥ 7 THEN\n        OUTPUT "C"\n    ELSE IF grade ≥ 6 THEN\n        OUTPUT "D"\n    ELSE\n        OUTPUT "F"\n    END IF\nEND',
      hints: ['Use ELSE IF for multiple conditions', 'Check from highest to lowest', 'ELSE handles remaining cases']
    },
    {
      id: 'ex-5-1',
      lesson_id: 'lesson-5-1',
      order_num: 1,
      title: 'Number Counter',
      description: 'Display numbers from 1 to 10 using a FOR loop.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    FOR i FROM 1 TO 10\n        OUTPUT i\n    END FOR\nEND',
      hints: ['Use FOR FROM TO', 'Choose a variable name for the counter', 'Don\'t forget END FOR']
    },
    {
      id: 'ex-5-2',
      lesson_id: 'lesson-5-2',
      order_num: 1,
      title: 'Countdown',
      description: 'Count down from 5 to 1 using a WHILE loop, then output "Go!"',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    count ← 5\n    WHILE count ≥ 1\n        OUTPUT count\n        count ← count - 1\n    END WHILE\n    OUTPUT "Go!"\nEND',
      hints: ['Start count at 5', 'Decrease count each time', 'Check if count ≥ 1']
    },
    {
      id: 'ex-6-1',
      lesson_id: 'lesson-6-1',
      order_num: 1,
      title: 'Your First Function',
      description: 'Create a function called displayInfo that outputs your name and favorite subject.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    DEFINE displayInfo()\n        OUTPUT "Name: Student"\n        OUTPUT "Subject: Computer Science"\n    END\n\n    displayInfo()\nEND',
      hints: ['Use DEFINE to create the function', 'Add OUTPUT statements inside', 'Call the function with its name followed by ()']
    },
    {
      id: 'ex-6-2',
      lesson_id: 'lesson-6-2',
      order_num: 1,
      title: 'Reusable Banner',
      description: 'Create a function that displays a decorative line of stars. Call it three times.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n    DEFINE showLine()\n\n    END\n\nEND',
      solution: 'BEGIN\n    DEFINE showLine()\n        OUTPUT "********************"\n    END\n\n    showLine()\n    OUTPUT "Welcome to the program"\n    showLine()\n    OUTPUT "Have a great day!"\n    showLine()\nEND',
      hints: ['Complete the function definition', 'Use OUTPUT inside the function', 'Call showLine() three times']
    },
    {
      id: 'ex-6-3',
      lesson_id: 'lesson-6-3',
      order_num: 1,
      title: 'Personal Greeting Function',
      description: 'Create a function that takes a name as a parameter and outputs a personalized greeting.',
      difficulty: 'beginner' as const,
      starter_code: 'BEGIN\n    DEFINE greetPerson()\n\n    END\n\nEND',
      solution: 'BEGIN\n    DEFINE greetPerson(name)\n        OUTPUT "Hello, " + name + "!"\n        OUTPUT "Welcome to our program!"\n    END\n\n    greetPerson("Alice")\n    greetPerson("Bob")\n    greetPerson("Charlie")\nEND',
      hints: ['Add parameter name in parentheses', 'Use the parameter in OUTPUT statements', 'Call the function with different names']
    },
    {
      id: 'ex-6-3-2',
      lesson_id: 'lesson-6-3',
      order_num: 2,
      title: 'Rectangle Area Function',
      description: 'Create a function that takes length and width as parameters and displays the area.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    DEFINE displayArea(length, width)\n        area ← length × width\n        OUTPUT "Length: " + length\n        OUTPUT "Width: " + width\n        OUTPUT "Area: " + area\n    END\n\n    displayArea(5, 3)\n    displayArea(10, 8)\nEND',
      hints: ['Function needs two parameters', 'Calculate area inside the function', 'Display all three values']
    },
    {
      id: 'ex-6-4',
      lesson_id: 'lesson-6-4',
      order_num: 1,
      title: 'Return the Sum',
      description: 'Create a function that takes two numbers and returns their sum.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    DEFINE addNumbers()\n\n    END\n\nEND',
      solution: 'BEGIN\n    DEFINE addNumbers(a, b)\n        RETURN a + b\n    END\n\n    total ← addNumbers(15, 27)\n    OUTPUT "Sum: " + total\n\n    OUTPUT "Another sum: " + addNumbers(100, 250)\nEND',
      hints: ['Add two parameters', 'Use RETURN instead of OUTPUT', 'Store the result in a variable or use directly']
    },
    {
      id: 'ex-6-4-2',
      lesson_id: 'lesson-6-4',
      order_num: 2,
      title: 'Find the Minimum',
      description: 'Create a function that returns the smaller of two numbers.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    DEFINE findMin()\n\n    END\n\nEND',
      solution: 'BEGIN\n    DEFINE findMin(x, y)\n        IF x < y THEN\n            RETURN x\n        ELSE\n            RETURN y\n        END IF\n    END\n\n    smaller ← findMin(10, 25)\n    OUTPUT "The minimum is: " + smaller\n\n    OUTPUT "Min of 5 and 3: " + findMin(5, 3)\nEND',
      hints: ['Compare the two parameters', 'Use IF to decide which to return', 'RETURN the smaller value']
    },
    {
      id: 'ex-6-4-3',
      lesson_id: 'lesson-6-4',
      order_num: 3,
      title: 'Calculate Circle Area',
      description: 'Create a function that takes a radius and returns the area of a circle (use 3.14 for pi).',
      difficulty: 'advanced' as const,
      starter_code: 'BEGIN\n\nEND',
      solution: 'BEGIN\n    DEFINE calculateCircleArea(radius)\n        pi ← 3.14\n        area ← pi × radius × radius\n        RETURN area\n    END\n\n    INPUT userRadius\n    circleArea ← calculateCircleArea(userRadius)\n    OUTPUT "Circle area: " + circleArea\n\n    OUTPUT "Area with radius 10: " + calculateCircleArea(10)\nEND',
      hints: ['Use formula: pi × radius × radius', 'Store pi as 3.14', 'Return the calculated area', 'Test with input and direct call']
    },
    {
      id: 'ex-7-1',
      lesson_id: 'lesson-7-1',
      order_num: 1,
      title: 'Trace the Loop (VCE Style)',
      description: 'Predict the final output of this code. Create a trace table if it helps.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    x ← 1\n    y ← 1\n    WHILE x < 5\n        x ← x + y\n        y ← x + y\n    END WHILE\n    OUTPUT y\nEND',
      solution: 'The output is 8.\n\nTrace:\nx=1, y=1\nLoop 1: x=2, y=3\nLoop 2: x=5, y=8\nCondition false, outputs y=8',
      hints: ['Create a trace table with columns for x, y, and the condition', 'Update x first, then y uses the NEW x value', 'Loop stops when x >= 5']
    },
    {
      id: 'ex-7-1-2',
      lesson_id: 'lesson-7-1',
      order_num: 2,
      title: 'Number Accumulator',
      description: 'What does this pseudocode output? Trace through each iteration.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    number ← 2\n    FOR i FROM 1 TO 3\n        number ← number + 5\n        OUTPUT number\n    END FOR\n    OUTPUT "done"\nEND',
      solution: 'Outputs:\n7\n12\n17\ndone\n\nTrace:\ni=1: number=2+5=7, output 7\ni=2: number=7+5=12, output 12\ni=3: number=12+5=17, output 17\nLoop ends, output "done"',
      hints: ['Loop runs 3 times (i=1, i=2, i=3)', 'Number increases by 5 each time', 'OUTPUT happens inside AND outside the loop']
    },
    {
      id: 'ex-7-2',
      lesson_id: 'lesson-7-2',
      order_num: 1,
      title: 'Find the Bug',
      description: 'This code should check if a student passes (score >= 50). Find and fix the error.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    INPUT score\n    IF score > 50 THEN\n        OUTPUT "Pass"\n    ELSE\n        OUTPUT "Fail"\n    END IF\nEND',
      solution: 'Error on line 3: Should be >= not >\n\nCorrect line:\nIF score >= 50 THEN\n\nReason: A score of exactly 50 should pass, but current code marks it as fail.',
      hints: ['What happens if score is exactly 50?', 'Should 50 be a pass or fail?', 'Check the comparison operator']
    },
    {
      id: 'ex-7-2-2',
      lesson_id: 'lesson-7-2',
      order_num: 2,
      title: 'REPEAT-UNTIL Bug',
      description: 'This REPEAT-UNTIL loop has a logic error. When small=3 and big=3, it should stop but outputs wrong values.',
      difficulty: 'advanced' as const,
      starter_code: 'BEGIN\n    INPUT small\n    INPUT big\n    cycles ← 0\n    REPEAT\n        small ← small + 2\n        big ← big + 3\n        cycles ← cycles + 1\n    UNTIL small > big\n    OUTPUT small, big, cycles\nEND',
      solution: 'Error: Condition should be >= not >\n\nCorrect line:\nUNTIL small >= big\n\nReason: When small equals big, they have met so loop should stop. Current code continues one more cycle.',
      hints: ['Test with small=3, big=3', 'What should happen when they are equal?', 'Loop continues while small <= big']
    },
    {
      id: 'ex-7-3',
      lesson_id: 'lesson-7-3',
      order_num: 1,
      title: 'Complete the Test Table',
      description: 'Fill in the Expected Result column for this CheckAge function.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN CheckAge(age)\n    canVote ← False\n    IF age >= 18 THEN\n        canVote ← True\n    END IF\n    RETURN canVote\nEND\n\nTest cases:\n1. age = 17: Expected = ?\n2. age = 18: Expected = ?\n3. age = 25: Expected = ?',
      solution: 'Test Results:\n1. age = 17: Expected = False (under 18)\n2. age = 18: Expected = True (exactly 18)\n3. age = 25: Expected = True (over 18)',
      hints: ['Test the boundary at 18', 'What happens one below, at, and above the threshold?', 'canVote starts as False']
    },
    {
      id: 'ex-7-3-2',
      lesson_id: 'lesson-7-3',
      order_num: 2,
      title: 'Find Test Failure',
      description: 'This function checks if points are sufficient. One test case fails. Identify which line causes it.',
      difficulty: 'advanced' as const,
      starter_code: 'BEGIN CheckPoints(balance, cost)\n    sufficient ← False\n    IF balance > cost THEN\n        sufficient ← True\n    END IF\n    RETURN sufficient\nEND\n\nTest: balance=5000, cost=5000\nExpected: True\nActual: False',
      solution: 'Error on line 3: Should be >= not >\n\nCorrect line:\nIF balance >= cost THEN\n\nReason: When balance equals cost, user has exactly enough points. Current code requires MORE than cost.',
      hints: ['When balance = cost, what should happen?', 'Having exactly enough should be sufficient', 'The comparison operator is wrong']
    },
    {
      id: 'ex-7-4',
      lesson_id: 'lesson-7-4',
      order_num: 1,
      title: 'Complete the Discount Code',
      description: 'Fill in the missing line to give 5% discount for totals $1000-$4999.',
      difficulty: 'intermediate' as const,
      starter_code: 'BEGIN\n    INPUT total\n    discount ← 0\n    [MISSING LINE]\n        discount ← 5\n    ELSE IF total >= 5000 THEN\n        discount ← 10\n    END IF\n    OUTPUT discount\nEND',
      solution: 'IF total >= 1000 AND total < 5000 THEN\n\nOR\n\nIF total >= 1000 THEN',
      hints: ['Need to check range $1000 to $4999', 'Use AND to combine two conditions', 'Could also check just >= 1000 since next ELSE IF handles >= 5000']
    },
    {
      id: 'ex-7-4-2',
      lesson_id: 'lesson-7-4',
      order_num: 2,
      title: 'Complete Payment Function',
      description: 'Complete this function: deduct points if paying with points, otherwise add points (1 point per dollar).',
      difficulty: 'advanced' as const,
      starter_code: 'BEGIN CompletePayment(price, points, usePoints)\n    [COMPLETE THE FUNCTION]\n    RETURN points\nEND',
      solution: 'BEGIN CompletePayment(price, points, usePoints)\n    IF usePoints = True THEN\n        points ← points - price\n    ELSE\n        points ← points + price\n    END IF\n    RETURN points\nEND',
      hints: ['Use IF to check the usePoints boolean', 'If True: subtract price from points', 'If False: add price to points', 'Return the updated points value']
    },
    {
      id: 'ex-7-4-3',
      lesson_id: 'lesson-7-4',
      order_num: 3,
      title: 'VCE Exam Challenge',
      description: 'Complete this age validation algorithm with nested conditions for under 18, 18-75, and over 75.',
      difficulty: 'advanced' as const,
      starter_code: 'BEGIN\n    INPUT age\n    [COMPLETE WITH NESTED IF STATEMENTS]\n    OUTPUT status\nEND',
      solution: 'BEGIN\n    INPUT age\n    IF age >= 18 THEN\n        IF age > 75 THEN\n            status ← "Senior"\n        ELSE\n            status ← "Adult"\n        END IF\n    ELSE\n        status ← "Minor"\n    END IF\n    OUTPUT status\nEND',
      hints: ['First check if >= 18', 'If yes, nest another IF for > 75', 'Three outcomes: Minor, Adult, Senior', 'Use ELSE to handle remaining cases']
    }
  ]
};
