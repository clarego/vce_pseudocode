import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Code2, BookOpen, CreditCard as Edit, Settings, Loader2, Sun, Moon, Terminal, AlignJustify, X, Trophy } from 'lucide-react';
import { PseudocodeEditor } from './components/PseudocodeEditor';
import { ReservedWordPanel } from './components/ReservedWordPanel';
import { ConversionPanel } from './components/ConversionPanel';
import { DesignTools } from './components/DesignTools';
import { Toolbar } from './components/Toolbar';
import { HelpModal } from './components/HelpModal';
import { StudyMode } from './components/StudyMode';
import { LoginModal } from './components/LoginModal';
import { Leaderboard } from './components/Leaderboard';
import { SessionScorePanel } from './components/SessionScorePanel';
import { templates } from './data/templates';
import { createSession, upsertLeaderboard, getSessionScores, QuestionScore } from './lib/scoringService';
import { pseudocodeToCode, codeToPseudocode } from './utils/converters';
import { aiPseudocodeToCode, aiCodeToPseudocode, aiCorrectPseudocode, aiGenerateDesignTools } from './utils/aiService';
import type { DesignTools as DesignToolsData } from './utils/aiService';
import { exportToPDF, downloadFile } from './utils/pdfExport';

type ApiKeyStatus = 'unchecked' | 'valid' | 'invalid';
type Theme = 'dark' | 'light' | 'hacker';

function App() {
  const [mode, setMode] = useState<'editor' | 'study'>('study');
  const [pseudocode, setPseudocode] = useState('BEGIN\n\nEND');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [theme, setTheme] = useState<Theme>('dark');
  const [showConversion, setShowConversion] = useState(false);
  const [convertedCode, setConvertedCode] = useState('');
  const [convertedLanguage, setConvertedLanguage] = useState<'python' | 'javascript'>('python');
  const [showHelp, setShowHelp] = useState(false);
  const [filename, setFilename] = useState('pseudocode');

  const [showLogin, setShowLogin] = useState(false);
  const [loginReason, setLoginReason] = useState<string | undefined>(undefined);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [openAiKey, setOpenAiKey] = useState<string | null>(null);
  const [apiKeyStatus, setApiKeyStatus] = useState<ApiKeyStatus>('unchecked');
  const [aiLoading, setAiLoading] = useState(false);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionScores, setSessionScores] = useState<QuestionScore[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const [showDesignTools, setShowDesignTools] = useState(false);
  const [designToolsData, setDesignToolsData] = useState<DesignToolsData | null>(null);
  const [isDesignToolsLoading, setIsDesignToolsLoading] = useState(false);
  const [showMobileWordPanel, setShowMobileWordPanel] = useState(false);
  const [rightPanelWidth, setRightPanelWidth] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const totalWidth = rect.width;
    const rightWidth = ((totalWidth - offsetX) / totalWidth) * 100;
    setRightPanelWidth(Math.min(Math.max(rightWidth, 20), 75));
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark' || theme === 'hacker');
    document.documentElement.classList.toggle('hacker', theme === 'hacker');
  }, [theme]);

  const handleLoginSuccess = async (key: string | null, username: string) => {
    setIsLoggedIn(true);
    setLoggedInUser(username);
    setShowLogin(false);
    setLoginReason(undefined);
    setOpenAiKey(key);
    setSessionScores([]);
    setSessionTotal(0);

    if (key) {
      setApiKeyStatus('valid');
    } else {
      setApiKeyStatus('invalid');
    }

    const newSessionId = await createSession(username);
    setSessionId(newSessionId);
  };

  const handleLogout = async () => {
    if (sessionId && loggedInUser) {
      await upsertLeaderboard(loggedInUser, sessionId);
    }
    setIsLoggedIn(false);
    setLoggedInUser('');
    setOpenAiKey(null);
    setApiKeyStatus('unchecked');
    setSessionId(null);
    setSessionScores([]);
    setSessionTotal(0);
    localStorage.removeItem('pseudocode_remembered_user');
  };

  const refreshSessionScores = useCallback(async () => {
    if (!sessionId) return;
    const scores = await getSessionScores(sessionId);
    setSessionScores(scores);
    setSessionTotal(scores.reduce((s, r) => s + r.points_earned, 0));
    if (loggedInUser) {
      await upsertLeaderboard(loggedInUser, sessionId);
    }
  }, [sessionId, loggedInUser]);

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
    setShowDesignTools(false);
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
    setShowDesignTools(false);
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

  const cycleTheme = () => {
    setTheme(t => t === 'light' ? 'dark' : t === 'dark' ? 'hacker' : 'light');
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

  const runDesignToolsGeneration = async () => {
    if (!openAiKey || apiKeyStatus !== 'valid' || !pseudocode.trim()) return;
    setIsDesignToolsLoading(true);
    try {
      const result = await aiGenerateDesignTools(openAiKey, pseudocode, 'pseudocode');
      setDesignToolsData(result);
    } catch {
      setDesignToolsData(null);
    } finally {
      setIsDesignToolsLoading(false);
    }
  };

  const handleGenerateDesignTools = async () => {
    if (!isLoggedIn) {
      setLoginReason('Sign in to access Design Tools — AI-powered flowcharts, data dictionaries, ERDs, and more.');
      setShowLogin(true);
      return;
    }
    if (showDesignTools && designToolsData) {
      setShowDesignTools(false);
      return;
    }
    setShowDesignTools(true);
    setShowConversion(false);
    await runDesignToolsGeneration();
  };

  const gearColor =
    apiKeyStatus === 'valid'
      ? 'text-green-400'
      : apiKeyStatus === 'invalid'
      ? 'text-red-400'
      : 'text-gray-400';

  const themeIcon = theme === 'light' ? <Sun className="w-4 h-4" /> : theme === 'dark' ? <Moon className="w-4 h-4" /> : <Terminal className="w-4 h-4" />;
  const themeLabel = theme === 'light' ? 'Light' : theme === 'dark' ? 'Dark' : 'Hacker';
  const themeButtonClass = theme === 'hacker'
    ? 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-300 border border-green-500/40 transition-colors text-sm font-medium'
    : 'flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors text-sm font-medium';

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <header className={`text-white shadow-lg ${theme === 'hacker' ? 'bg-black border-b border-green-500/40' : 'bg-gradient-to-r from-blue-600 to-teal-600'}`}>
        <div className="max-w-[2000px] mx-auto px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Code2 className={`w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 ${theme === 'hacker' ? 'text-green-400' : ''}`} />
              <div className="min-w-0">
                <h1 className={`text-base sm:text-2xl font-bold leading-tight truncate ${theme === 'hacker' ? 'text-green-400 font-mono' : ''}`}>
                  <span className="hidden sm:inline">VCE Pseudocode Learning Platform</span>
                  <span className="sm:hidden">VCE Pseudocode</span>
                </h1>
                <p className={`text-xs hidden sm:block ${theme === 'hacker' ? 'text-green-400/70 font-mono' : 'text-blue-100'}`}>Victorian Curriculum Standards</p>
              </div>
              <div className={`hidden sm:flex items-center ml-2 pl-3 border-l ${theme === 'hacker' ? 'border-green-500/40' : 'border-white/30'}`}>
                <img
                  src="/cla_sol.png"
                  alt="Clarence's Solutions"
                  className="h-8 w-auto object-contain"
                  style={{ filter: theme === 'hacker' ? 'brightness(0) saturate(100%) invert(74%) sepia(41%) saturate(500%) hue-rotate(82deg) brightness(100%) contrast(90%)' : 'none' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={cycleTheme}
                className={`${themeButtonClass} !px-2 sm:!px-3`}
                title={`Theme: ${themeLabel} (click to cycle)`}
              >
                {themeIcon}
                <span className="hidden sm:inline">{themeLabel}</span>
              </button>

              <div className={`flex rounded-lg p-1 ${theme === 'hacker' ? 'bg-green-500/10 border border-green-500/30' : 'bg-white/10'}`}>
                <button
                  onClick={() => setMode('study')}
                  className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-sm ${
                    mode === 'study'
                      ? theme === 'hacker' ? 'bg-green-500/20 text-green-300 font-semibold border border-green-500/40' : 'bg-white text-blue-600 font-semibold'
                      : theme === 'hacker' ? 'text-green-400 hover:bg-green-500/10' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Study</span>
                </button>
                <button
                  onClick={() => setMode('editor')}
                  className={`flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors text-sm ${
                    mode === 'editor'
                      ? theme === 'hacker' ? 'bg-green-500/20 text-green-300 font-semibold border border-green-500/40' : 'bg-white text-blue-600 font-semibold'
                      : theme === 'hacker' ? 'text-green-400 hover:bg-green-500/10' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden xs:inline sm:inline">Editor</span>
                </button>
              </div>

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-blue-100 hidden sm:inline">
                    <span className="font-semibold text-white">{loggedInUser}</span>
                  </span>
                  {sessionTotal > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-bold">
                      <Trophy className="w-3.5 h-3.5" />
                      {sessionTotal}
                    </div>
                  )}
                  <button
                    onClick={() => setShowLeaderboard(v => !v)}
                    className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm transition-colors ${showLeaderboard ? 'bg-yellow-400/30 text-yellow-200 border border-yellow-400/50' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Board</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-2 sm:px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className="flex items-center gap-1.5 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-medium transition-colors border border-white/30 text-sm"
                >
                  Sign In
                </button>
              )}

              {isLoggedIn && (
                <div title={apiKeyStatus === 'valid' ? 'AI features active' : 'AI key invalid or unavailable'}>
                  {aiLoading ? (
                    <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-spin" />
                  ) : (
                    <Settings className={`w-5 h-5 sm:w-6 sm:h-6 ${gearColor}`} />
                  )}
                </div>
              )}

              {mode === 'editor' && (
                <div className="hidden sm:flex items-center gap-2">
                  <label className="text-sm font-medium whitespace-nowrap">Filename:</label>
                  <input
                    type="text"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-blue-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 w-36 lg:w-48"
                    placeholder="Enter filename"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {mode === 'study' ? (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <StudyMode
              openAiKey={openAiKey}
              sessionId={sessionId}
              username={loggedInUser || undefined}
              onScoreRecorded={refreshSessionScores}
            />
          </div>
          {showLeaderboard && isLoggedIn && (
            <div className="w-80 flex-shrink-0 overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4 space-y-4">
              <Leaderboard currentUsername={loggedInUser} />
              <SessionScorePanel scores={sessionScores} sessionTotal={sessionTotal} />
            </div>
          )}
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
            onTemplateSelect={handleTemplateSelect}
            templates={templates}
            onShowHelp={() => setShowHelp(true)}
            onImportCode={handleImportCode}
            onCorrectPseudocode={handleCorrectPseudocode}
            onGenerateDesignTools={handleGenerateDesignTools}
            hasAI={isLoggedIn && apiKeyStatus === 'valid'}
            aiLoading={aiLoading}
            designToolsActive={showDesignTools}
          />

          <div className="flex-1 flex overflow-hidden relative">
            {showMobileWordPanel && (
              <div
                className="fixed inset-0 bg-black/50 z-30 sm:hidden"
                onClick={() => setShowMobileWordPanel(false)}
              />
            )}

            <div className={`
              fixed sm:relative inset-y-0 left-0 z-40 sm:z-auto
              w-72 sm:w-64 flex-shrink-0
              transition-transform duration-300
              ${showMobileWordPanel ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
            `}>
              <div className="flex items-center justify-between px-4 pt-3 sm:hidden">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Reserved Words</span>
                <button onClick={() => setShowMobileWordPanel(false)} className="p-1 rounded text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ReservedWordPanel onWordClick={(w) => { handleWordClick(w); setShowMobileWordPanel(false); }} />
            </div>

            <div ref={containerRef} className="flex-1 flex flex-col sm:flex-row overflow-hidden min-w-0">
              <div
                className="flex-1 sm:flex-none transition-none border-b sm:border-b-0 sm:border-r border-gray-200 dark:border-gray-700"
                style={(showConversion || showDesignTools) ? { width: `${100 - rightPanelWidth}%` } : { width: '100%' }}
              >
                <div className="h-full bg-white dark:bg-gray-800 rounded-tl-lg shadow-inner">
                  <div className="h-full flex flex-col">
                    <div className="flex items-center gap-2 px-3 py-2 sm:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <button
                        onClick={() => setShowMobileWordPanel(true)}
                        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white"
                      >
                        <AlignJustify className="w-3 h-3" />
                        Words
                      </button>
                      {(showConversion || showDesignTools) && (
                        <button
                          onClick={() => { setShowConversion(false); setShowDesignTools(false); }}
                          className="flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 ml-auto"
                        >
                          <X className="w-3 h-3" />
                          Close Panel
                        </button>
                      )}
                    </div>
                    <div className="flex-1 p-2 overflow-hidden">
                      <PseudocodeEditor
                        value={pseudocode}
                        onChange={setPseudocode}
                        onCursorPositionChange={setCursorPosition}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {(showConversion || showDesignTools) && (
                <div
                  className="hidden sm:flex w-1.5 flex-shrink-0 cursor-col-resize items-center justify-center group relative z-10"
                  onMouseDown={handleMouseDown}
                >
                  <div className="w-0.5 h-full bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
                  <div className="absolute inset-y-0 -left-1 -right-1" />
                </div>
              )}

              {showConversion && (
                <div className="flex-1 sm:flex-none overflow-hidden" style={{ width: `${rightPanelWidth}%` }}>
                  <ConversionPanel
                    content={convertedCode}
                    language={convertedLanguage}
                    onClose={() => setShowConversion(false)}
                  />
                </div>
              )}

              {showDesignTools && (
                <div className="flex-1 sm:flex-none overflow-y-auto bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700" style={{ width: `${rightPanelWidth}%` }}>
                  <DesignTools
                    data={designToolsData}
                    isLoading={isDesignToolsLoading}
                    onRegenerate={() => {
                      setDesignToolsData(null);
                      runDesignToolsGeneration();
                    }}
                    onClose={() => setShowDesignTools(false)}
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
          onClose={() => { setShowLogin(false); setLoginReason(undefined); }}
          onLoginSuccess={(key, username) => handleLoginSuccess(key, username)}
          reason={loginReason}
        />
      )}
    </div>
  );
}

export default App;
