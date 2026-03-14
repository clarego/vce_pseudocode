import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Code2, FileCode } from 'lucide-react';
import { PseudocodeEditor } from './PseudocodeEditor';
import { CodeEditor } from './CodeEditor';
import { pseudocodeToCode } from '../utils/converters';

interface EditorPaneProps {
  value: string;
  onChange: (value: string) => void;
  onCursorPositionChange: (position: number) => void;
}

export const EditorPane: React.FC<EditorPaneProps> = ({
  value,
  onChange,
  onCursorPositionChange,
}) => {
  const [pseudoCollapsed, setPseudoCollapsed] = useState(false);
  const [pythonCollapsed, setPythonCollapsed] = useState(false);
  const [splitPct, setSplitPct] = useState(50);
  const [mobileTab, setMobileTab] = useState<'pseudo' | 'python'>('pseudo');
  const [isMobile, setIsMobile] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const pythonCode = pseudocodeToCode(value, 'python');

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const raw = ((e.clientX - rect.left) / rect.width) * 100;
      setSplitPct(Math.min(Math.max(raw, 25), 75));
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <button
            onClick={() => setMobileTab('pseudo')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              mobileTab === 'pseudo'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-gray-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Pseudocode
          </button>
          <button
            onClick={() => setMobileTab('python')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
              mobileTab === 'python'
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400 bg-white dark:bg-gray-800'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Python
            <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 uppercase">live</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          {mobileTab === 'pseudo' ? (
            <PseudocodeEditor
              value={value}
              onChange={onChange}
              onCursorPositionChange={onCursorPositionChange}
            />
          ) : (
            <div className="h-full bg-[#1e1e1e]">
              <CodeEditor
                value={pythonCode}
                onChange={() => {}}
                language="python"
                placeholder=""
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  const bothCollapsed = pseudoCollapsed && pythonCollapsed;

  const pseudoWidth = bothCollapsed
    ? '50%'
    : pseudoCollapsed
    ? '40px'
    : pythonCollapsed
    ? 'calc(100% - 40px)'
    : `${splitPct}%`;

  const pythonWidth = bothCollapsed
    ? '50%'
    : pythonCollapsed
    ? '40px'
    : pseudoCollapsed
    ? 'calc(100% - 40px)'
    : `${100 - splitPct}%`;

  const showDivider = !pseudoCollapsed && !pythonCollapsed;

  return (
    <div ref={containerRef} className="h-full flex overflow-hidden">
      <div
        className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: pseudoWidth, minWidth: pseudoCollapsed ? '40px' : '0' }}
      >
        <PaneHeader
          icon={<FileCode className="w-3.5 h-3.5" />}
          label="Pseudocode"
          collapsed={pseudoCollapsed}
          collapseDir="left"
          onToggle={() => setPseudoCollapsed(c => !c)}
        />
        {!pseudoCollapsed && (
          <div className="flex-1 overflow-hidden">
            <PseudocodeEditor
              value={value}
              onChange={onChange}
              onCursorPositionChange={onCursorPositionChange}
            />
          </div>
        )}
        {pseudoCollapsed && (
          <div className="flex-1 flex items-center justify-center">
            <span
              className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-widest"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              PSEUDOCODE
            </span>
          </div>
        )}
      </div>

      {showDivider && (
        <div
          className="w-1.5 flex-shrink-0 cursor-col-resize group relative z-10 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-400 dark:group-hover:bg-blue-500 transition-colors" />
          <div className="absolute inset-y-0 -left-1.5 -right-1.5" />
        </div>
      )}

      {pseudoCollapsed && !pythonCollapsed && (
        <div className="w-px flex-shrink-0 bg-gray-200 dark:bg-gray-700" />
      )}

      <div
        className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: pythonWidth, minWidth: pythonCollapsed ? '40px' : '0' }}
      >
        <PaneHeader
          icon={<Code2 className="w-3.5 h-3.5" />}
          label="Python"
          badge="live"
          collapsed={pythonCollapsed}
          collapseDir="right"
          onToggle={() => setPythonCollapsed(c => !c)}
        />
        {!pythonCollapsed && (
          <div className="flex-1 overflow-hidden bg-[#1e1e1e]">
            <CodeEditor
              value={pythonCode}
              onChange={() => {}}
              language="python"
              placeholder=""
            />
          </div>
        )}
        {pythonCollapsed && (
          <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
            <span
              className="text-xs font-semibold text-gray-500 tracking-widest"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
            >
              PYTHON
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

interface PaneHeaderProps {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  collapsed: boolean;
  collapseDir: 'left' | 'right';
  onToggle: () => void;
}

function PaneHeader({ icon, label, badge, collapsed, collapseDir, onToggle }: PaneHeaderProps) {
  const showChevronLeft = collapseDir === 'left' ? !collapsed : collapsed;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex-shrink-0 select-none">
      {!collapsed && (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider min-w-0">
          {icon}
          <span className="truncate">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 uppercase tracking-wide">
              {badge}
            </span>
          )}
        </div>
      )}
      {collapsed && <div className="flex-1" />}
      <button
        onClick={onToggle}
        title={collapsed ? `Expand ${label}` : `Collapse ${label}`}
        className="ml-auto p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0"
      >
        {showChevronLeft ? (
          <ChevronLeft className="w-3.5 h-3.5" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
