import React, { useState } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Sun,
  Moon,
  FileText,
  HelpCircle,
  ChevronDown,
  Code2,
  RefreshCw
} from 'lucide-react';

interface ToolbarProps {
  onClear: () => void;
  onConvertToPython: () => void;
  onConvertToJavaScript: () => void;
  onDownloadPython: () => void;
  onDownloadJavaScript: () => void;
  onDownloadPDF: () => void;
  onToggleTheme: () => void;
  isDarkMode: boolean;
  onTemplateSelect: (code: string) => void;
  templates: Array<{ name: string; description: string; code: string }>;
  onShowHelp: () => void;
  onImportCode: (code: string, language: 'python' | 'javascript') => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onClear,
  onConvertToPython,
  onConvertToJavaScript,
  onDownloadPython,
  onDownloadJavaScript,
  onDownloadPDF,
  onToggleTheme,
  isDarkMode,
  onTemplateSelect,
  templates,
  onShowHelp,
  onImportCode,
}) => {
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importLanguage, setImportLanguage] = useState<'python' | 'javascript'>('python');

  const handleImport = () => {
    if (importCode.trim()) {
      onImportCode(importCode, importLanguage);
      setImportCode('');
      setShowImport(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <button
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              Templates
              <ChevronDown className="w-4 h-4" />
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
            >
              <Code2 className="w-4 h-4" />
              Convert
              <ChevronDown className="w-4 h-4" />
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
              <ChevronDown className="w-4 h-4" />
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
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Code
          </button>

          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear
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

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Import Code to Pseudocode
              </h2>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Language
                </label>
                <select
                  value={importLanguage}
                  onChange={(e) => setImportLanguage(e.target.value as 'python' | 'javascript')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Paste your code here
                </label>
                <textarea
                  value={importCode}
                  onChange={(e) => setImportCode(e.target.value)}
                  className="w-full h-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm resize-none"
                  placeholder={importLanguage === 'python' ? 'def main():\n    print("Hello")' : 'function main() {\n  console.log("Hello");\n}'}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowImport(false);
                    setImportCode('');
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Convert to Pseudocode
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
