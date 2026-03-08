import React, { useState, useRef, useEffect } from 'react';
import { Code2, BookOpen, Edit } from 'lucide-react';
import { PseudocodeEditor } from './components/PseudocodeEditor';
import { ReservedWordPanel } from './components/ReservedWordPanel';
import { ConversionPanel } from './components/ConversionPanel';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import { StudyMode } from './components/StudyMode';
import { templates } from './data/templates';
import { pseudocodeToCode, codeToPseudocode } from './utils/converters';
import { exportToPDF, downloadFile } from './utils/pdfExport';

function App() {
  const [mode, setMode] = useState<'editor' | 'study'>('study');
  const [pseudocode, setPseudocode] = useState('BEGIN\n\nEND');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConversion, setShowConversion] = useState(false);
  const [convertedCode, setConvertedCode] = useState('');
  const [convertedLanguage, setConvertedLanguage] = useState<'python' | 'javascript'>('python');
  const [showHelp, setShowHelp] = useState(false);
  const [filename, setFilename] = useState('pseudocode');
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getIndentLevel = (line: string): number => {
    let spaces = 0;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === ' ') spaces++;
      else break;
    }
    return Math.floor(spaces / 4);
  };

  const shouldOutdent = (word: string): boolean => {
    return word === 'END' || word === 'END IF' || word === 'END FOR' || word === 'END WHILE' || word === 'ELSE' || word.startsWith('ELSE IF');
  };

  const insertAtCursor = (text: string) => {
    const before = pseudocode.slice(0, cursorPosition);
    const after = pseudocode.slice(cursorPosition);

    const lines = before.split('\n');
    const currentLine = lines[lines.length - 1];
    const currentIndent = getIndentLevel(currentLine);
    const currentLineTrimmed = currentLine.trim();

    let finalText = text;
    let additionalOffset = 1;

    if (shouldOutdent(text) && currentLineTrimmed === '') {
      const newIndent = Math.max(0, currentIndent - 1);
      const indentString = '    '.repeat(newIndent);

      const lineStart = before.lastIndexOf('\n') + 1;
      const beforeWithoutCurrentLine = before.substring(0, lineStart);

      finalText = indentString + text + ' ';
      const newText = beforeWithoutCurrentLine + finalText + after;
      setPseudocode(newText);

      setTimeout(() => {
        const newPosition = beforeWithoutCurrentLine.length + finalText.length;
        setCursorPosition(newPosition);
      }, 0);
      return;
    }

    const newText = before + text + ' ' + after;
    setPseudocode(newText);

    setTimeout(() => {
      const newPosition = cursorPosition + text.length + 1;
      setCursorPosition(newPosition);
    }, 0);
  };

  const handleWordClick = (word: string) => {
    insertAtCursor(word);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all content?')) {
      setPseudocode('BEGIN\n\nEND');
      setCursorPosition(0);
      setShowConversion(false);
    }
  };

  const handleConvertToPython = () => {
    const converted = pseudocodeToCode(pseudocode, 'python');
    setConvertedCode(converted);
    setConvertedLanguage('python');
    setShowConversion(true);
  };

  const handleConvertToJavaScript = () => {
    const converted = pseudocodeToCode(pseudocode, 'javascript');
    setConvertedCode(converted);
    setConvertedLanguage('javascript');
    setShowConversion(true);
  };

  const handleDownloadPython = () => {
    const converted = pseudocodeToCode(pseudocode, 'python');
    downloadFile(converted, filename, 'py');
  };

  const handleDownloadJavaScript = () => {
    const converted = pseudocodeToCode(pseudocode, 'javascript');
    downloadFile(converted, filename, 'js');
  };

  const handleDownloadPDF = () => {
    exportToPDF(pseudocode, filename, 'VCE Pseudocode');
  };

  const handleTemplateSelect = (code: string) => {
    setPseudocode(code);
    setCursorPosition(0);
    setShowConversion(false);
  };

  const handleToggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleImportCode = (code: string, language: 'python' | 'javascript') => {
    const converted = codeToPseudocode(code, language);
    setPseudocode(converted);
    setCursorPosition(0);
    setShowConversion(false);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-3">
            <Code2 className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">VCE Pseudocode Learning Platform</h1>
              <p className="text-blue-100 text-sm">Victorian Curriculum Standards</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white/10 rounded-lg p-1">
              <button
                onClick={() => setMode('study')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  mode === 'study'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Study
              </button>
              <button
                onClick={() => setMode('editor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  mode === 'editor'
                    ? 'bg-white text-blue-600 font-semibold'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <Edit className="w-4 h-4" />
                Editor
              </button>
            </div>
            {mode === 'editor' && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium">Filename:</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-48"
                  placeholder="Enter filename"
                />
              </div>
            )}
          </div>
        </div>
      </header>

      {mode === 'study' ? (
        <div className="flex-1 overflow-hidden">
          <StudyMode />
        </div>
      ) : (
        <>
          <Toolbar
            onClear={handleClear}
            onConvertToPython={handleConvertToPython}
            onConvertToJavaScript={handleConvertToJavaScript}
            onDownloadPython={handleDownloadPython}
            onDownloadJavaScript={handleDownloadJavaScript}
            onDownloadPDF={handleDownloadPDF}
            onToggleTheme={handleToggleTheme}
            isDarkMode={isDarkMode}
            onTemplateSelect={handleTemplateSelect}
            templates={templates}
            onShowHelp={() => setShowHelp(true)}
            onImportCode={handleImportCode}
          />

          <div className="flex-1 flex overflow-hidden">
            <div className="w-64 flex-shrink-0">
              <ReservedWordPanel onWordClick={handleWordClick} />
            </div>

            <div className="flex-1 flex overflow-hidden">
              <div className={`${showConversion ? 'w-1/2' : 'w-full'} transition-all duration-300 border-r border-gray-200 dark:border-gray-700`}>
                <div className="h-full bg-white dark:bg-gray-800 rounded-tl-lg shadow-inner">
                  <div className="h-full p-2">
                    <PseudocodeEditor
                      value={pseudocode}
                      onChange={setPseudocode}
                      onCursorPositionChange={setCursorPosition}
                    />
                  </div>
                </div>
              </div>

              {showConversion && (
                <div className="w-1/2">
                  <ConversionPanel
                    content={convertedCode}
                    language={convertedLanguage}
                    onClose={() => setShowConversion(false)}
                  />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          VCE Software Development Pseudocode Editor - Built for Victorian Curriculum Standards
        </p>
      </footer>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
