import React, { useState, useRef } from 'react';
import { BookOpen, ChevronRight, ChevronLeft, Code, Play, Check, Lightbulb, Terminal, Eye } from 'lucide-react';
import { studyContentData } from '../data/studyContent';
import { pseudocodeToCode } from '../utils/converters';
import { runJavaScript, runPython, ExecutionResult } from '../utils/codeRunner';

export const StudyMode: React.FC = () => {
  const [selectedChapter, setSelectedChapter] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);
  const [exerciseCode, setExerciseCode] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [convertedCode, setConvertedCode] = useState<{ python: string; javascript: string } | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [pythonResult, setPythonResult] = useState<ExecutionResult | null>(null);
  const [jsResult, setJsResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isRunningPython, setIsRunningPython] = useState(false);
  const [isRunningJs, setIsRunningJs] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentChapter = studyContentData.chapters[selectedChapter];
  const chaptersLessons = studyContentData.lessons.filter(
    l => l.chapter_id === currentChapter.id
  );
  const currentLesson = chaptersLessons[selectedLesson];
  const lessonsExercises = currentLesson
    ? studyContentData.exercises.filter(e => e.lesson_id === currentLesson.id)
    : [];
  const currentExercise = selectedExercise !== null ? lessonsExercises[selectedExercise] : null;

  const handleChapterChange = (index: number) => {
    setSelectedChapter(index);
    setSelectedLesson(0);
    setSelectedExercise(null);
    setExerciseCode('');
    setShowHint(false);
    setShowSolution(false);
    setShowAnswer(false);
    setConvertedCode(null);
  };

  const handleLessonChange = (index: number) => {
    setSelectedLesson(index);
    setSelectedExercise(null);
    setExerciseCode('');
    setShowHint(false);
    setShowSolution(false);
    setShowAnswer(false);
    setConvertedCode(null);
  };

  const autoIndentCode = (code: string): string => {
    const lines = code.split('\n');
    let indentLevel = 0;
    return lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '    '.repeat(indentLevel);

      const dedentWords = ['END IF', 'END FOR', 'END WHILE', 'END', 'ELSE IF ', 'ELSE', 'UNTIL '];
      const shouldDedent = dedentWords.some(w =>
        trimmed === w || (w.endsWith(' ') && trimmed.startsWith(w))
      );
      if (shouldDedent && indentLevel > 0) indentLevel--;

      const indented = '    '.repeat(indentLevel) + trimmed;

      const indentWords = ['BEGIN', 'ELSE IF ', 'ELSE', 'DEFINE ', 'FOR ', 'WHILE ', 'REPEAT'];
      const endsWithThen = trimmed.endsWith('THEN');
      const shouldIndent = indentWords.some(w =>
        trimmed === w || (w.endsWith(' ') && trimmed.startsWith(w))
      ) || endsWithThen;
      if (shouldIndent) indentLevel++;

      return indented;
    }).join('\n');
  };

  const handleExerciseSelect = (index: number) => {
    const exercise = lessonsExercises[index];
    setSelectedExercise(index);
    setExerciseCode(autoIndentCode(exercise.starter_code || ''));
    setShowHint(false);
    setShowSolution(false);
    setShowAnswer(false);
    setConvertedCode(null);
    setExecutionResult(null);
  };

  const handleConvert = (language: 'python' | 'javascript') => {
    if (!exerciseCode) return;
    const python = pseudocodeToCode(exerciseCode, 'python');
    const javascript = pseudocodeToCode(exerciseCode, 'javascript');
    setConvertedCode({ python, javascript });
  };

  const handleRunCode = async () => {
    if (!exerciseCode) return;

    setIsRunning(true);
    setExecutionResult(null);

    try {
      const jsCode = pseudocodeToCode(exerciseCode, 'javascript');
      const result = runJavaScript(jsCode);
      setExecutionResult(result);
    } catch (error: any) {
      setExecutionResult({
        output: [],
        error: `Failed to run code: ${error.message}`
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunPython = async () => {
    if (!convertedCode?.python) return;

    setIsRunningPython(true);
    setPythonResult(null);

    try {
      const result = await runPython(convertedCode.python);
      setPythonResult(result);
    } catch (error: any) {
      setPythonResult({
        output: [],
        error: `Failed to run Python code: ${error.message}`
      });
    } finally {
      setIsRunningPython(false);
    }
  };

  const handleRunJavaScript = async () => {
    if (!convertedCode?.javascript) return;

    setIsRunningJs(true);
    setJsResult(null);

    try {
      const result = runJavaScript(convertedCode.javascript);
      setJsResult(result);
    } catch (error: any) {
      setJsResult({
        output: [],
        error: `Failed to run JavaScript code: ${error.message}`
      });
    } finally {
      setIsRunningJs(false);
    }
  };

  const getIndentLevel = (line: string): number => {
    let spaces = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') spaces++;
      else break;
    }
    return Math.floor(spaces / 4);
  };

  const calculateIndentForNextLine = (currentLine: string): number => {
    const trimmed = currentLine.trim();
    let currentIndent = getIndentLevel(currentLine);

    if (trimmed === 'BEGIN' || trimmed.startsWith('IF ') || trimmed === 'ELSE' ||
        trimmed.startsWith('ELSE IF ') || trimmed.startsWith('FOR ') ||
        trimmed.startsWith('WHILE ') || trimmed.startsWith('REPEAT') ||
        trimmed.startsWith('DEFINE ') || trimmed.endsWith('THEN')) {
      return currentIndent + 1;
    }

    if (trimmed === 'END' || trimmed === 'END IF' || trimmed === 'END FOR' ||
        trimmed === 'END WHILE' || trimmed.startsWith('UNTIL ') ||
        trimmed === 'ELSE' || trimmed.startsWith('ELSE IF ')) {
      return Math.max(0, currentIndent - 1);
    }

    return currentIndent;
  };

  const handleExerciseChange = (value: string) => {
    setExerciseCode(value);

    const textarea = textareaRef.current;
    if (!textarea) return;

    const cursorPos = textarea.selectionStart;
    const textBefore = value.substring(0, cursorPos);
    const lines = textBefore.split('\n');
    const currentLine = lines[lines.length - 1];
    const trimmed = currentLine.trim();

    const shouldDedent =
      trimmed === 'END' || trimmed === 'END IF' || trimmed === 'END FOR' ||
      trimmed === 'END WHILE' || trimmed === 'ELSE' ||
      trimmed.startsWith('ELSE IF ') || trimmed.startsWith('UNTIL ');

    if (shouldDedent && currentLine.startsWith('    ')) {
      const currentIndent = getIndentLevel(currentLine);
      if (currentIndent > 0) {
        const newIndent = Math.max(0, currentIndent - 1);
        const newIndentString = '    '.repeat(newIndent);
        const newLine = newIndentString + trimmed;
        const linesBeforeCurrent = lines.slice(0, -1);
        const textAfter = value.substring(cursorPos);
        const newValue = [...linesBeforeCurrent, newLine].join('\n') + textAfter;

        setExerciseCode(newValue);

        setTimeout(() => {
          const newCursorPos = cursorPos - 4;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      }
    }
  };

  const handleExerciseKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (e.key === 'Enter') {
      e.preventDefault();

      const cursorPos = textarea.selectionStart;
      const textBefore = exerciseCode.substring(0, cursorPos);
      const textAfter = exerciseCode.substring(cursorPos);

      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      let indent = calculateIndentForNextLine(currentLine);
      const indentString = '    '.repeat(indent);

      const newValue = textBefore + '\n' + indentString + textAfter;
      setExerciseCode(newValue);

      setTimeout(() => {
        const newCursorPos = cursorPos + 1 + indentString.length;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    } else if (e.key === 'Tab') {
      e.preventDefault();

      const cursorPos = textarea.selectionStart;
      const textBefore = exerciseCode.substring(0, cursorPos);
      const textAfter = exerciseCode.substring(cursorPos);

      const newValue = textBefore + '    ' + textAfter;
      setExerciseCode(newValue);

      setTimeout(() => {
        const newCursorPos = cursorPos + 4;
        textarea.selectionStart = textarea.selectionEnd = newCursorPos;
      }, 0);
    } else if (e.key === 'Backspace') {
      const cursorPos = textarea.selectionStart;
      const selEnd = textarea.selectionEnd;
      if (cursorPos !== selEnd) return;

      const textBefore = exerciseCode.substring(0, cursorPos);
      const lines = textBefore.split('\n');
      const currentLine = lines[lines.length - 1];

      if (currentLine.length > 0 && currentLine.trim() === '' && currentLine.length % 4 === 0) {
        e.preventDefault();
        const textAfter = exerciseCode.substring(cursorPos);
        const newLine = currentLine.substring(4);
        const newValue = [...lines.slice(0, -1), newLine].join('\n') + textAfter;
        setExerciseCode(newValue);

        setTimeout(() => {
          const newCursorPos = cursorPos - 4;
          textarea.selectionStart = textarea.selectionEnd = newCursorPos;
        }, 0);
      }
    }
  };

  const nextLesson = () => {
    if (selectedLesson < chaptersLessons.length - 1) {
      handleLessonChange(selectedLesson + 1);
    } else if (selectedChapter < studyContentData.chapters.length - 1) {
      handleChapterChange(selectedChapter + 1);
    }
  };

  const prevLesson = () => {
    if (selectedLesson > 0) {
      handleLessonChange(selectedLesson - 1);
    } else if (selectedChapter > 0) {
      const prevChapterLessons = studyContentData.lessons.filter(
        l => l.chapter_id === studyContentData.chapters[selectedChapter - 1].id
      );
      setSelectedChapter(selectedChapter - 1);
      setSelectedLesson(prevChapterLessons.length - 1);
    }
  };

  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];
    let i = 0;
    let inCodeBlock = false;
    let codeBlockLines: string[] = [];

    while (i < lines.length) {
      const line = lines[i];

      if (line.startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${i}`} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto my-3">
              <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                {codeBlockLines.join('\n')}
              </code>
            </pre>
          );
          codeBlockLines = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        i++;
        continue;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        i++;
        continue;
      }

      if (line.startsWith('# ')) {
        elements.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{line.slice(2)}</h2>);
      } else if (line.startsWith('## ')) {
        elements.push(<h3 key={i} className="text-xl font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-100">{line.slice(3)}</h3>);
      } else if (line.startsWith('### ')) {
        elements.push(<h4 key={i} className="text-lg font-semibold mt-3 mb-2 text-gray-700 dark:text-gray-200">{line.slice(4)}</h4>);
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(<p key={i} className="font-bold my-2 text-gray-800 dark:text-gray-100">{line.slice(2, -2)}</p>);
      } else if (line.startsWith('- ')) {
        elements.push(<li key={i} className="ml-6 my-1 text-gray-700 dark:text-gray-300">{line.slice(2)}</li>);
      } else if (line.trim() === '') {
        elements.push(<br key={i} />);
      } else {
        elements.push(<p key={i} className="my-2 text-gray-700 dark:text-gray-300">{line}</p>);
      }

      i++;
    }

    return elements;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
            <BookOpen className="w-5 h-5" />
            Study Guide
          </h2>
        </div>

        <div className="p-2">
          {studyContentData.chapters.map((chapter, idx) => (
            <div key={chapter.id} className="mb-2">
              <button
                onClick={() => handleChapterChange(idx)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedChapter === idx
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 font-semibold'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <div className="text-sm font-medium">
                  Chapter {chapter.order_num}
                </div>
                <div className="text-xs mt-1">{chapter.title}</div>
              </button>

              {selectedChapter === idx && (
                <div className="ml-4 mt-1 space-y-1">
                  {chaptersLessons.map((lesson, lessonIdx) => (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonChange(lessonIdx)}
                      className={`w-full text-left px-2 py-1.5 rounded text-sm transition-colors ${
                        selectedLesson === lessonIdx
                          ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {lesson.order_num}. {lesson.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {currentLesson && (
            <>
              <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Chapter {currentChapter.order_num} - Lesson {currentLesson.order_num}
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {currentLesson.title}
                  </h1>
                </div>

                <div className="prose dark:prose-invert max-w-none">
                  {renderMarkdown(currentLesson.content)}
                </div>

                {currentLesson.pseudocode_example && (
                  <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Code className="w-4 h-4" />
                      Example
                    </h3>
                    <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                      <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                        {currentLesson.pseudocode_example}
                      </code>
                    </pre>
                  </div>
                )}

                {lessonsExercises.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                      Practice Exercises
                    </h3>
                    <div className="space-y-3">
                      {lessonsExercises.map((exercise, idx) => (
                        <button
                          key={exercise.id}
                          onClick={() => handleExerciseSelect(idx)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedExercise === idx
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-400'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {exercise.title}
                                </span>
                                <span className={`text-xs px-2 py-0.5 rounded ${getDifficultyColor(exercise.difficulty)}`}>
                                  {exercise.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {exercise.description}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {currentExercise && (
                  <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-blue-500 dark:border-blue-400">
                    <h4 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                      Exercise: {currentExercise.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {currentExercise.description}
                    </p>

                    <textarea
                      ref={textareaRef}
                      value={exerciseCode}
                      onChange={(e) => handleExerciseChange(e.target.value)}
                      onKeyDown={handleExerciseKeyDown}
                      className="w-full h-64 p-3 font-mono text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                      placeholder="Write your pseudocode here..."
                      spellCheck={false}
                    />

                    <div className="flex flex-wrap gap-2 mt-4">
                      <button
                        onClick={handleRunCode}
                        disabled={isRunning || !exerciseCode}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
                      >
                        <Terminal className="w-4 h-4" />
                        {isRunning ? 'Running...' : 'Run Code'}
                      </button>
                      <button
                        onClick={() => handleConvert('python')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Convert to Python
                      </button>
                      <button
                        onClick={() => handleConvert('javascript')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Code className="w-4 h-4" />
                        Convert to JavaScript
                      </button>
                      {currentExercise.hints && (
                        <button
                          onClick={() => setShowHint(!showHint)}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                        >
                          <Lightbulb className="w-4 h-4" />
                          {showHint ? 'Hide' : 'Show'} Hint
                        </button>
                      )}
                      {currentExercise.solution && currentChapter.order_num !== 7 && (
                        <button
                          onClick={() => setShowSolution(!showSolution)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4" />
                          {showSolution ? 'Hide' : 'Show'} Solution
                        </button>
                      )}
                    </div>

                    {executionResult && (
                      <div className={`mt-4 p-4 rounded-lg border-2 ${
                        executionResult.error
                          ? 'bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700'
                          : 'bg-emerald-50 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Terminal className="w-5 h-5" />
                          <h5 className={`font-semibold ${
                            executionResult.error
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-emerald-900 dark:text-emerald-100'
                          }`}>
                            {executionResult.error ? 'Execution Error' : 'Output'}
                          </h5>
                        </div>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-300 dark:border-gray-700 font-mono text-sm">
                          {executionResult.error ? (
                            <div className="text-red-700 dark:text-red-300 whitespace-pre-wrap">
                              {executionResult.error}
                            </div>
                          ) : executionResult.output.length > 0 ? (
                            <div className="text-gray-800 dark:text-gray-200 space-y-1">
                              {executionResult.output.map((line, i) => (
                                <div key={i}>{line}</div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 dark:text-gray-400 italic">
                              No output
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {showHint && currentExercise.hints && (
                      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
                        <h5 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Hints:</h5>
                        <ul className="list-disc ml-5 space-y-1">
                          {currentExercise.hints.map((hint, i) => (
                            <li key={i} className="text-yellow-800 dark:text-yellow-200">{hint}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentExercise.solution && currentChapter.order_num === 7 && (
                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="font-semibold text-purple-900 dark:text-purple-100">Answer:</h5>
                          {!showAnswer && (
                            <button
                              onClick={() => setShowAnswer(true)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              Reveal Answer
                            </button>
                          )}
                        </div>
                        {showAnswer ? (
                          <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-purple-200 dark:border-purple-700 overflow-x-auto">
                            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                              {currentExercise.solution}
                            </code>
                          </pre>
                        ) : (
                          <div className="bg-purple-100 dark:bg-purple-950 p-4 rounded border border-purple-300 dark:border-purple-800 text-center">
                            <p className="text-purple-700 dark:text-purple-300 text-sm italic">
                              Click "Reveal Answer" to see the solution
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {showSolution && currentExercise.solution && currentChapter.order_num !== 7 && (
                      <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900 border border-purple-200 dark:border-purple-700 rounded-lg">
                        <h5 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Solution:</h5>
                        <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-purple-200 dark:border-purple-700 overflow-x-auto">
                          <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                            {currentExercise.solution}
                          </code>
                        </pre>
                      </div>
                    )}

                    {convertedCode && (
                      <div className="mt-4 space-y-4">
                        <div className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-blue-900 dark:text-blue-100">Python Code</h5>
                            <button
                              onClick={handleRunPython}
                              disabled={isRunningPython}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              {isRunningPython ? 'Running...' : 'Run Python'}
                            </button>
                          </div>
                          <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-blue-200 dark:border-blue-700 overflow-x-auto mb-3">
                            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                              {convertedCode.python}
                            </code>
                          </pre>
                          {pythonResult && (
                            <div className={`p-3 rounded border ${
                              pythonResult.error
                                ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                                : 'bg-white dark:bg-gray-900 border-blue-300 dark:border-blue-700'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Terminal className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                                  {pythonResult.error ? 'Error' : 'Output'}
                                </span>
                              </div>
                              <div className="font-mono text-xs">
                                {pythonResult.error ? (
                                  <div className="text-red-700 dark:text-red-300 whitespace-pre-wrap">
                                    {pythonResult.error}
                                  </div>
                                ) : pythonResult.output.length > 0 ? (
                                  <div className="text-gray-800 dark:text-gray-200 space-y-1">
                                    {pythonResult.output.map((line, i) => (
                                      <div key={i}>{line}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 dark:text-gray-400 italic">
                                    No output
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-semibold text-green-900 dark:text-green-100">JavaScript Code</h5>
                            <button
                              onClick={handleRunJavaScript}
                              disabled={isRunningJs}
                              className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded text-sm transition-colors"
                            >
                              <Play className="w-3 h-3" />
                              {isRunningJs ? 'Running...' : 'Run JavaScript'}
                            </button>
                          </div>
                          <pre className="bg-white dark:bg-gray-900 p-3 rounded border border-green-200 dark:border-green-700 overflow-x-auto mb-3">
                            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre">
                              {convertedCode.javascript}
                            </code>
                          </pre>
                          {jsResult && (
                            <div className={`p-3 rounded border ${
                              jsResult.error
                                ? 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                                : 'bg-white dark:bg-gray-900 border-green-300 dark:border-green-700'
                            }`}>
                              <div className="flex items-center gap-2 mb-2">
                                <Terminal className="w-4 h-4 text-green-700 dark:text-green-300" />
                                <span className="text-xs font-semibold text-green-900 dark:text-green-100">
                                  {jsResult.error ? 'Error' : 'Output'}
                                </span>
                              </div>
                              <div className="font-mono text-xs">
                                {jsResult.error ? (
                                  <div className="text-red-700 dark:text-red-300 whitespace-pre-wrap">
                                    {jsResult.error}
                                  </div>
                                ) : jsResult.output.length > 0 ? (
                                  <div className="text-gray-800 dark:text-gray-200 space-y-1">
                                    {jsResult.output.map((line, i) => (
                                      <div key={i}>{line}</div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-gray-500 dark:text-gray-400 italic">
                                    No output
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button
              onClick={prevLesson}
              disabled={selectedChapter === 0 && selectedLesson === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              Lesson {selectedLesson + 1} of {chaptersLessons.length}
            </div>

            <button
              onClick={nextLesson}
              disabled={
                selectedChapter === studyContentData.chapters.length - 1 &&
                selectedLesson === chaptersLessons.length - 1
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
