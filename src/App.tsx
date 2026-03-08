import React, { useState, useEffect } from 'react';
import { Code2, BookOpen, CreditCard as Edit, Settings, Loader2 } from 'lucide-react';
import { PseudocodeEditor } from './components/PseudocodeEditor';
import { ReservedWordPanel } from './components/ReservedWordPanel';
import { ConversionPanel } from './components/ConversionPanel';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import { StudyMode } from './components/StudyMode';
import { LoginModal } from './components/LoginModal';
import { templates } from './data/templates';
import { pseudocodeToCode, codeToPseudocode } from './utils/converters';
import { aiPseudocodeToCode, aiCodeToPseudocode, aiCorrectPseudocode } from './utils/aiService';
import { exportToPDF, downloadFile } from './utils/pdfExport';

type ApiKeyStatus = 'unchecked' | 'valid' | 'invalid';

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

  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [openAiKey, setOpenAiKey] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('unchecked');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleLoginSuccess = async (key: string | null, username: string) => {
    setIsLoggedIn(true);
    setLoggedInUser(username);
    setShowLogin(false);
    setOpenAiKey(key);

    if (key) {
      setApiKeyStatus('valid');
    } else {
      setApiKeyStatus('invalid');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    setOpenAiKey(null);
    setApiKeyStatus('unchecked');
    localStorage.removeItem('pseudocode_remembered_user');
  };

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

  const handleConvertToPython = async () => {
    if (openAiKey && apiKeyStatus === 'valid') {
      setAiLoading(true);
      try {
        const converted = await aiPseudocodeToCode(openAiKey, pseudocode, 'python');
        setConvertedCode(converted);
      } catch {
        setConvertedCode(pseudocodeToCode(pseudocode, 'python'));
      } finally {
        setAiLoading(false);
      }
    } else {
      setConvertedCode(pseudocodeToCode(pseudocode, 'python'));
    }
    setConvertedLanguage('python');
    setShowConversion(true);
  };

  const handleConvertToJavaScript = async () => {
    if (openAiKey && apiKeyStatus === 'valid') {
      setAiLoading(true);
      try {
        const converted = await aiPseudocodeToCode(openAiKey, pseudocode, 'javascript');
        setConvertedCode(converted);
      } catch {
        setConvertedCode(pseudocodeToCode(pseudocode, 'javascript'));
      } finally {
        setAiLoading(false);
      }
    } else {
      setConvertedCode(pseudocodeToCode(pseudocode, 'javascript'));
    }
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

  const handleImportCode = async (code: string, language: 'python' | 'javascript') => {
    if (openAiKey && apiKeyStatus === 'valid') {
      setAiLoading(true);
      try {
        const converted = await aiCodeToPseudocode(openAiKey, code, language);
        setPseudocode(converted);
      } catch {
        setPseudocode(codeToPseudocode(code, language));
      } finally {
        setAiLoading(false);
      }
    } else {
      setPseudocode(codeToPseudocode(code, language));
    }
    setCursorPosition(0);
    setShowConversion(false);
  };

  const handleCorrectPseudocode = async () => {
    if (!openAiKey || apiKeyStatus !== 'valid') return;
    setAiLoading(true);
    try {
      const corrected = await aiCorrectPseudocode(openAiKey, pseudocode);
      setPseudocode(corrected);
    } finally {
      setAiLoading(false);
    }
  };

  const gearColor =
    apiKeyStatus === 'valid'
      ? 'text-green-400'
      : apiKeyStatus === 'invalid'
      ? 'text-red-400'
      : 'text-gray-400';

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

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-blue-100">
                  Signed in as <span className="font-semibold text-white">{loggedInUser}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors border border-white/30"
              >
                Sign In
              </button>
            )}

            {isLoggedIn && (
              <div title={apiKeyStatus === 'valid' ? 'AI features active' : 'AI key invalid or unavailable'}>
                {aiLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Settings className={`w-6 h-6 ${gearColor}`} />
                )}
              </div>
            )}

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
          <StudyMode openAiKey={openAiKey} />
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
            onCorrectPseudocode={handleCorrectPseudocode}
            hasAI={isLoggedIn && apiKeyStatus === 'valid'}
            aiLoading={aiLoading}
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
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={(key, username) => handleLoginSuccess(key, username)}
        />
      )}
    </div>
  );
}

export default App;
