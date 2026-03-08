import React, { useState, useRef, useCallback } from 'react';
import {
  Download,
  Upload,
  Trash2,
  FileText,
  HelpCircle,
  ChevronDown,
  Code2,
  RefreshCw,
  Wand2,
  Loader2,
  LayoutDashboard,
  FolderOpen,
} from 'lucide-react';

interface ToolbarProps {
  onClear: () => void;
  onConvertToPython: () => void;
  onConvertToJavaScript: () => void;
  onDownloadPython: () => void;
  onDownloadJavaScript: () => void;
  onDownloadPDF: () => void;
  onTemplateSelect: (code: string) => void;
  templates: Array<{ name: string; description: string; code: string }>;
  onShowHelp: () => void;
  onImportCode: (code: string, language: 'python' | 'javascript') => void;
  onCorrectPseudocode: () => void;
  onGenerateDesignTools: () => void;
  hasAI: boolean;
  aiLoading: boolean;
  designToolsActive: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onClear,
  onConvertToPython,
  onConvertToJavaScript,
  onDownloadPython,
  onDownloadJavaScript,
  onDownloadPDF,
  onTemplateSelect,
  templates,
  onShowHelp,
  onImportCode,
  onCorrectPseudocode,
  onGenerateDesignTools,
  hasAI,
  aiLoading,
  designToolsActive,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importLanguage, setImportLanguage] = useState<'python' | 'javascript'>('python');
  const [isDragging, setIsDragging] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    if (importCode.trim()) {
      onImportCode(importCode, importLanguage);
      setImportCode('');
      setImportFileName('');
      setShowImport(false);
    }
  };

  const readFile = useCallback((file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'js' || ext === 'mjs' || ext === 'ts') {
      setImportLanguage('javascript');
    } else {
      setImportLanguage('python');
    }
    setImportFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImportCode((e.target?.result as string) ?? '');
    };
    reader.readAsText(file);
  }, []);

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, [readFile]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
    e.target.value = '';
  }, [readFile]);

  const closeImport = () => {
    setShowImport(false);
    setImportCode('');
    setImportFileName('');
    setIsDragging(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 py-2 sm:p-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors text-sm"
              title="Templates"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showTemplates && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowTemplates(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.name}
                      onClick={() => {
                        onTemplateSelect(template.code);
                        setShowTemplates(false);
                      }}
                      className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.description}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowConvert(!showConvert)}
              disabled={aiLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              title="Convert"
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Convert</span>
              {hasAI && <span className="hidden sm:inline text-xs bg-green-500 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showConvert && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowConvert(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={() => {
                      onConvertToPython();
                      setShowConvert(false);
                    }}
                    className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      To Python
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onConvertToJavaScript();
                      setShowConvert(false);
                    }}
                    className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      To JavaScript
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDownload(!showDownload)}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-slate-600 hover:bg-slate-700 text-white transition-colors text-sm"
              title="Download"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {showDownload && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowDownload(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20">
                  <button
                    onClick={() => {
                      onDownloadPython();
                      setShowDownload(false);
                    }}
                    className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      As Python (.py)
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onDownloadJavaScript();
                      setShowDownload(false);
                    }}
                    className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      As JavaScript (.js)
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onDownloadPDF();
                      setShowDownload(false);
                    }}
                    className="block w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="font-medium text-gray-800 dark:text-gray-200">
                      As PDF
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setShowImport(true)}
            disabled={aiLoading}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            title="Import Code"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Import Code</span>
            {hasAI && <span className="hidden sm:inline text-xs bg-teal-500 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
          </button>

          {hasAI && (
            <button
              onClick={onCorrectPseudocode}
              disabled={aiLoading}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              title="AI Correct"
            >
              {aiLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">AI Correct</span>
            </button>
          )}

          <button
            onClick={onGenerateDesignTools}
            disabled={aiLoading && !designToolsActive}
            className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-sm ${
              designToolsActive
                ? 'bg-sky-700 hover:bg-sky-800 text-white ring-2 ring-sky-400'
                : 'bg-sky-600 hover:bg-sky-700 text-white'
            }`}
            title="Design Tools"
          >
            {aiLoading && !designToolsActive ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LayoutDashboard className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Design Tools</span>
            {hasAI && <span className="hidden sm:inline text-xs bg-sky-500 px-1.5 py-0.5 rounded-full font-semibold">AI</span>}
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors text-sm"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowHelp}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Help"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  Import Code to Pseudocode
                </h2>
                {hasAI && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">AI-powered conversion</p>
                )}
              </div>
              <button onClick={closeImport} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Language
                </label>
                <select
                  value={importLanguage}
                  onChange={(e) => setImportLanguage(e.target.value as 'python' | 'javascript')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                >
                  <option value="python">Python (.py)</option>
                  <option value="javascript">JavaScript / TypeScript (.js, .ts)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Upload File
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all select-none ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20 scale-[1.01]'
                      : 'border-gray-300 dark:border-gray-600 hover:border-teal-400 hover:bg-gray-50 dark:hover:bg-gray-700/40'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".py,.js,.ts,.mjs,.jsx,.tsx"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDragging ? 'bg-teal-100 dark:bg-teal-800/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <FolderOpen className={`w-6 h-6 ${isDragging ? 'text-teal-600 dark:text-teal-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  {importFileName ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-teal-700 dark:text-teal-400">{importFileName}</p>
                      <p className="text-xs text-gray-500 mt-0.5">File loaded — or drop a new one to replace</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Drag &amp; drop your file here
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        or <span className="text-teal-600 dark:text-teal-400 font-medium">click to browse files</span> on your computer
                      </p>
                      <p className="text-xs text-gray-400 mt-1">.py, .js, .ts, .jsx, .tsx supported</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Or paste code directly
                </label>
                <textarea
                  value={importCode}
                  onChange={(e) => { setImportCode(e.target.value); setImportFileName(''); }}
                  className="w-full h-40 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  placeholder={importLanguage === 'python' ? 'def main():\n    print("Hello, world!")' : 'function main() {\n  console.log("Hello, world!");\n}'}
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={closeImport}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importCode.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Convert to Pseudocode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
