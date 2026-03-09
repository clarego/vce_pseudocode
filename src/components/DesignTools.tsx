import React, { useState, useRef, useCallback } from 'react';
import { GitBranch, Table2, ArrowRightLeft, Users, Loader2, RefreshCw, Network, Database, Monitor, X, Copy, FileDown, Check, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type {
  DesignTools as DesignToolsData,
  FlowchartNode,
  DataDictionaryRow,
  IpoChart,
  UcdActor,
  UcdUseCase,
  UcdRelationship,
  DfdLevel,
  DfdElement,
  DfdFlow,
  MockupScreen,
  MockupWidget,
} from '../utils/aiService';

type Tab = 'flowchart' | 'dataDictionary' | 'ipo' | 'ucd' | 'dfd' | 'erdChen' | 'erdCrowsFoot' | 'mockup';

interface DesignToolsProps {
  data: DesignToolsData | null;
  isLoading: boolean;
  error?: string | null;
  onRegenerate: () => void;
  onClose: () => void;
}

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'flowchart', label: 'Flowchart', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'dataDictionary', label: 'Data Dictionary', icon: <Table2 className="w-4 h-4" /> },
  { id: 'ipo', label: 'IPO Chart', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 'ucd', label: 'Use Case Diagram', icon: <Users className="w-4 h-4" /> },
  { id: 'dfd', label: 'Data Flow Diagram', icon: <Network className="w-4 h-4" /> },
  { id: 'erdChen', label: "ERD (Chen's)", icon: <Database className="w-4 h-4" /> },
  { id: 'erdCrowsFoot', label: "ERD (Crow's Foot)", icon: <Database className="w-4 h-4" /> },
  { id: 'mockup', label: 'GUI Mockup', icon: <Monitor className="w-4 h-4" /> },
];

function getTabTextContent(tab: Tab, data: DesignToolsData): string {
  const lines: string[] = [];

  if (tab === 'flowchart' && data.flowchart) {
    lines.push('FLOWCHART');
    lines.push('='.repeat(40));
    data.flowchart.forEach(n => {
      const type = n.type.toUpperCase();
      lines.push(`[${type}] ${n.label}`);
      if (n.yes) lines.push(`  -> YES: ${n.yes}`);
      if (n.no) lines.push(`  -> NO: ${n.no}`);
      if (n.next) lines.push(`  -> NEXT: ${n.next}`);
    });
  }

  if (tab === 'dataDictionary' && data.dataDictionary) {
    lines.push('DATA DICTIONARY');
    lines.push('='.repeat(80));
    const cols = ['name', 'dataType', 'formatForDisplay', 'sizeBytes', 'sizeDisplay', 'description', 'example', 'validation'] as const;
    lines.push(cols.map(c => c.padEnd(16)).join(' | '));
    lines.push('-'.repeat(80));
    data.dataDictionary.forEach(row => {
      lines.push(cols.map(c => (row[c] || '—').toString().padEnd(16)).join(' | '));
    });
  }

  if (tab === 'ipo' && data.ipoChart) {
    const c = data.ipoChart;
    lines.push(`IPO CHART: ${c.title}`);
    lines.push('='.repeat(60));
    const maxRows = Math.max(c.inputs?.length ?? 0, c.process?.length ?? 0, c.outputs?.length ?? 0);
    lines.push('INPUT'.padEnd(22) + 'PROCESS'.padEnd(22) + 'OUTPUT');
    lines.push('-'.repeat(66));
    for (let i = 0; i < maxRows; i++) {
      const inp = (c.inputs?.[i] ?? '').padEnd(22);
      const proc = (c.process?.[i] ? `${i + 1}. ${c.process[i]}` : '').padEnd(22);
      const out = c.outputs?.[i] ?? '';
      lines.push(`${inp}${proc}${out}`);
    }
  }

  if (tab === 'ucd' && data.ucd) {
    const u = data.ucd;
    lines.push(`USE CASE DIAGRAM: ${u.systemName}`);
    lines.push('='.repeat(60));
    lines.push('\nACTORS:');
    u.actors.forEach(a => lines.push(`  - ${a.name} (${a.side})`));
    lines.push('\nUSE CASES:');
    u.useCases.forEach(uc => lines.push(`  - ${uc.label}`));
    lines.push('\nRELATIONSHIPS:');
    u.relationships.forEach(r => lines.push(`  ${r.from} --[${r.type}]--> ${r.to}`));
  }

  if (tab === 'dfd' && data.dfd) {
    lines.push('DATA FLOW DIAGRAM');
    lines.push('='.repeat(60));
    data.dfd.forEach(level => {
      lines.push(`\nLevel ${level.level}:`);
      level.elements.forEach(e => lines.push(`  [${e.type}] ${e.label}`));
      level.flows.forEach(f => lines.push(`  ${f.from} --> ${f.to}: ${f.label}`));
    });
  }

  if ((tab === 'erdChen' || tab === 'erdCrowsFoot') && data.erd) {
    const label = tab === 'erdChen' ? "ERD (Chen's Notation)" : "ERD (Crow's Foot Notation)";
    lines.push(label);
    lines.push('='.repeat(60));
    lines.push('\nENTITIES:');
    data.erd.entities.forEach(e => {
      lines.push(`  ${e.name}`);
      e.attributes.forEach(a => lines.push(`    - ${a}`));
    });
    lines.push('\nRELATIONSHIPS:');
    data.erd.relationships.forEach(r => {
      lines.push(`  ${r.entity1} [${r.cardinality1}] --${r.label}--> [${r.cardinality2}] ${r.entity2}`);
    });
  }

  if (tab === 'mockup' && data.mockup) {
    lines.push('GUI MOCKUP');
    lines.push('='.repeat(60));
    data.mockup.forEach(screen => {
      lines.push(`\nScreen: ${screen.title}`);
      screen.widgets.forEach(w => lines.push(`  [${w.type}] ${w.label}${w.content ? ': ' + w.content : ''}`));
    });
  }

  return lines.join('\n');
}

export const DesignTools: React.FC<DesignToolsProps> = ({ data, isLoading, error, onRegenerate, onClose }) => {
  const [activeTab, setActiveTab] = useState<Tab>('flowchart');
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const activeTabLabel = TAB_CONFIG.find(t => t.id === activeTab)?.label ?? activeTab;

  const handleCopy = () => {
    if (!data) return;
    const text = getTabTextContent(activeTab, data);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleExportPDF = async () => {
    if (!contentRef.current || !data) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentW = pageW - margin * 2;
      const contentH = (canvas.height / canvas.width) * contentW;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`VCAA Design Tools — ${activeTabLabel}`, margin, margin + 6);

      const imgY = margin + 12;
      const availH = pageH - imgY - margin;

      if (contentH <= availH) {
        pdf.addImage(imgData, 'PNG', margin, imgY, contentW, contentH);
      } else {
        const scale = availH / contentH;
        pdf.addImage(imgData, 'PNG', margin, imgY, contentW * scale, availH);
      }

      const slug = activeTabLabel.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      pdf.save(`design_tools_${slug}.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mt-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h5 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          VCAA Design Tools
        </h5>
        <div className="flex items-center gap-2">
          {data && !isLoading && (
            <>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title={`Copy ${activeTabLabel} as text`}
              >
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                title={`Export ${activeTabLabel} as PDF`}
              >
                {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
                {exporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </>
          )}
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
          >
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            {isLoading ? 'Generating...' : 'Regenerate'}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            title="Close design tools"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={contentRef} className="p-4 overflow-auto max-h-[600px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">AI is generating your VCAA design tools...</p>
            <p className="text-xs mt-1 text-gray-400">This may take up to 30 seconds</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Generation failed</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Try again
            </button>
          </div>
        ) : !data ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <p className="text-sm">No data available. Click Regenerate to generate design tools.</p>
          </div>
        ) : (
          <>
            {activeTab === 'flowchart' && <FlowchartView nodes={data.flowchart} />}
            {activeTab === 'dataDictionary' && <DataDictionaryView rows={data.dataDictionary} />}
            {activeTab === 'ipo' && <IpoChartView chart={data.ipoChart} />}
            {activeTab === 'ucd' && <UcdView ucd={data.ucd} />}
            {activeTab === 'dfd' && <DfdView levels={data.dfd} />}
            {activeTab === 'erdChen' && <ErdChenView erd={data.erd} />}
            {activeTab === 'erdCrowsFoot' && <ErdCrowsFootView erd={data.erd} />}
            {activeTab === 'mockup' && <MockupView screens={data.mockup} />}
          </>
        )}
      </div>
    </div>
  );
};

function ZoomableView({ children, svgW, svgH }: { children: React.ReactNode; svgW: number; svgH: number }) {
  const [zoom, setZoom] = useState(1);
  const minZoom = 0.25;
  const maxZoom = 3;
  const step = 0.2;

  const zoomIn = useCallback(() => setZoom(z => Math.min(z + step, maxZoom)), []);
  const zoomOut = useCallback(() => setZoom(z => Math.max(z - step, minZoom)), []);
  const resetZoom = useCallback(() => setZoom(1), []);

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-1">
        <button onClick={zoomOut} disabled={zoom <= minZoom} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors" title="Zoom out">
          <ZoomOut className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} disabled={zoom >= maxZoom} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors" title="Zoom in">
          <ZoomIn className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-0.5" />
        <button onClick={resetZoom} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Reset zoom">
          <Maximize2 className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
      <div className="overflow-auto rounded border border-gray-100 dark:border-gray-700/50">
        <div style={{ width: svgW * zoom, height: svgH * zoom, minWidth: '100%' }}>
          <svg
            width={svgW * zoom}
            height={svgH * zoom}
            viewBox={`0 0 ${svgW} ${svgH}`}
            style={{ display: 'block' }}
          >
            {children}
          </svg>
        </div>
      </div>
    </div>
  );
}

const SHAPE_H = 48;
const SHAPE_W = 180;
const COL_CENTER = 300;
const V_GAP = 80;
const DECISION_H = 60;
const BRANCH_INDENT = 260;

interface NodeLayout {
  node: FlowchartNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildFlowchartLayout(nodes: FlowchartNode[]): { layouts: NodeLayout[]; totalH: number } {
  if (nodes.length === 0) return { layouts: [], totalH: 0 };

  const map = new Map(nodes.map(n => [n.id, n]));

  const inDegree = new Map<string, number>();
  nodes.forEach(n => inDegree.set(n.id, 0));
  nodes.forEach(n => {
    const succs = [n.next, n.yes, n.no].filter(Boolean) as string[];
    succs.forEach(s => { if (map.has(s)) inDegree.set(s, (inDegree.get(s) ?? 0) + 1); });
  });

  const nodeH = (n: FlowchartNode) => (n.type === 'decision' ? DECISION_H : SHAPE_H);

  const rank = new Map<string, number>();
  const queue: string[] = [];
  nodes.forEach(n => { if ((inDegree.get(n.id) ?? 0) === 0) queue.push(n.id); });
  if (queue.length === 0) queue.push(nodes[0].id);

  const remaining = new Map(inDegree);
  while (queue.length > 0) {
    const id = queue.shift()!;
    const node = map.get(id);
    if (!node) continue;
    const curRank = rank.get(id) ?? 0;
    const succs = [node.next, node.yes, node.no].filter(Boolean) as string[];
    succs.forEach(s => {
      if (!map.has(s)) return;
      const newRank = curRank + nodeH(node) + V_GAP;
      if (!rank.has(s) || rank.get(s)! < newRank) rank.set(s, newRank);
      const rem = (remaining.get(s) ?? 1) - 1;
      remaining.set(s, rem);
      if (rem <= 0) queue.push(s);
    });
  }

  nodes.forEach(n => { if (!rank.has(n.id)) rank.set(n.id, 0); });

  const xPos = new Map<string, number>();
  const assignX = (id: string, x: number, visited = new Set<string>()) => {
    if (visited.has(id)) return;
    visited.add(id);
    if (!xPos.has(id)) xPos.set(id, x);
    const node = map.get(id);
    if (!node) return;
    if (node.type === 'decision') {
      if (node.yes) assignX(node.yes, x, visited);
      if (node.no) assignX(node.no, x + BRANCH_INDENT, visited);
    } else if (node.next) {
      assignX(node.next, xPos.get(id) ?? x, visited);
    }
  };
  assignX(nodes[0].id, COL_CENTER - SHAPE_W / 2);
  nodes.forEach(n => { if (!xPos.has(n.id)) xPos.set(n.id, COL_CENTER - SHAPE_W / 2); });

  const startY = 40;
  const layouts: NodeLayout[] = nodes.map(n => ({
    node: n,
    x: xPos.get(n.id) ?? COL_CENTER - SHAPE_W / 2,
    y: startY + (rank.get(n.id) ?? 0),
    w: SHAPE_W,
    h: nodeH(n),
  }));

  const totalH = Math.max(...layouts.map(l => l.y + l.h)) + 40;
  return { layouts, totalH };
}

function FlowchartShape({ node, x, y, w, h }: NodeLayout) {
  const cx = x + w / 2;
  const cy = y + h / 2;

  const textEl = (
    <text
      x={cx} y={cy}
      textAnchor="middle" dominantBaseline="middle"
      fontSize="11" fontFamily="monospace"
      fill="currentColor" className="text-gray-800 dark:text-gray-100"
    >
      {node.label.length > 24 ? node.label.slice(0, 24) + '…' : node.label}
    </text>
  );

  if (node.type === 'terminal') {
    return (
      <g>
        <rect x={x} y={y} width={w} height={h} rx={h / 2} ry={h / 2}
          className="fill-slate-700 dark:fill-slate-300" />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
          fontSize="11" fontFamily="monospace" fontWeight="bold"
          fill="white" className="dark:fill-slate-800">{node.label}</text>
      </g>
    );
  }
  if (node.type === 'io') {
    const skew = 14;
    const pts = `${x + skew},${y} ${x + w},${y} ${x + w - skew},${y + h} ${x},${y + h}`;
    return (
      <g>
        <polygon points={pts} className="fill-blue-100 dark:fill-blue-900 stroke-blue-400 dark:stroke-blue-600" strokeWidth="1.5" />
        {textEl}
      </g>
    );
  }
  if (node.type === 'decision') {
    const mx = cx, my = y, rx2 = x + w, ry2 = cy, bx = cx, by = y + h, lx = x, ly = cy;
    return (
      <g>
        <polygon points={`${mx},${my} ${rx2},${ry2} ${bx},${by} ${lx},${ly}`}
          className="fill-amber-100 dark:fill-amber-900 stroke-amber-400 dark:stroke-amber-600" strokeWidth="1.5" />
        {textEl}
      </g>
    );
  }
  if (node.type === 'predefined') {
    const inset = 10;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h}
          className="fill-teal-50 dark:fill-teal-900 stroke-teal-400 dark:stroke-teal-600" strokeWidth="1.5" />
        <line x1={x + inset} y1={y} x2={x + inset} y2={y + h}
          className="stroke-teal-400 dark:stroke-teal-600" strokeWidth="1.5" />
        <line x1={x + w - inset} y1={y} x2={x + w - inset} y2={y + h}
          className="stroke-teal-400 dark:stroke-teal-600" strokeWidth="1.5" />
        {textEl}
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        className="fill-white dark:fill-gray-800 stroke-gray-400 dark:stroke-gray-500" strokeWidth="1.5" />
      {textEl}
    </g>
  );
}

function FlowchartView({ nodes }: { nodes: FlowchartNode[] }) {
  if (!nodes || nodes.length === 0) {
    return <div className="text-center text-gray-500 py-8">No flowchart data available.</div>;
  }

  const { layouts, totalH } = buildFlowchartLayout(nodes);
  const layoutMap = new Map(layouts.map(l => [l.node.id, l]));
  const SVG_W = Math.max(600, ...layouts.map(l => l.x + l.w + 40));

  const arrows: React.ReactNode[] = [];

  layouts.forEach(({ node, x, y, w, h }) => {
    const cx = x + w / 2;
    const bottom = y + h;

    const drawArrow = (fromX: number, fromY: number, toX: number, toY: number, label?: string) => {
      const key = `${fromX}-${fromY}-${toX}-${toY}`;
      if (fromX === toX) {
        arrows.push(
          <g key={key}>
            <line x1={fromX} y1={fromY} x2={toX} y2={toY - 8}
              stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-gray-500" />
            <polygon points={`${toX},${toY} ${toX - 5},${toY - 10} ${toX + 5},${toY - 10}`}
              fill="currentColor" className="text-gray-400 dark:text-gray-500" />
            {label && <text x={fromX + 6} y={(fromY + toY) / 2} fontSize="10" className="fill-gray-500 dark:fill-gray-400">{label}</text>}
          </g>
        );
      } else {
        const midY = (fromY + toY) / 2;
        arrows.push(
          <g key={key}>
            <polyline points={`${fromX},${fromY} ${fromX},${midY} ${toX},${midY} ${toX},${toY - 8}`}
              fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-gray-500" />
            <polygon points={`${toX},${toY} ${toX - 5},${toY - 10} ${toX + 5},${toY - 10}`}
              fill="currentColor" className="text-gray-400 dark:text-gray-500" />
            {label && <text x={(fromX + toX) / 2 + 4} y={midY - 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">{label}</text>}
          </g>
        );
      }
    };

    if (node.type === 'decision') {
      if (node.yes) {
        const target = layoutMap.get(node.yes);
        if (target) drawArrow(cx, bottom, target.x + target.w / 2, target.y, 'Yes');
      }
      if (node.no) {
        const target = layoutMap.get(node.no);
        if (target) {
          const rightEdge = x + w;
          arrows.push(
            <g key={`no-${node.id}`}>
              <polyline
                points={`${rightEdge},${y + h / 2} ${target.x + target.w / 2},${y + h / 2} ${target.x + target.w / 2},${target.y - 8}`}
                fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-400 dark:text-gray-500" />
              <polygon points={`${target.x + target.w / 2},${target.y} ${target.x + target.w / 2 - 5},${target.y - 10} ${target.x + target.w / 2 + 5},${target.y - 10}`}
                fill="currentColor" className="text-gray-400 dark:text-gray-500" />
              <text x={rightEdge + 4} y={y + h / 2 - 4} fontSize="10" className="fill-gray-500 dark:fill-gray-400">No</text>
            </g>
          );
        }
      }
    } else if (node.next) {
      const target = layoutMap.get(node.next);
      if (target) drawArrow(cx, bottom, target.x + target.w / 2, target.y);
    }
  });

  const legend = [
    { color: 'bg-slate-700', label: 'Terminal (Start/End)' },
    { color: 'bg-white border border-gray-400', label: 'Process' },
    { color: 'bg-blue-100 border border-blue-400', label: 'Input/Output' },
    { color: 'bg-amber-100 border border-amber-400', label: 'Decision' },
    { color: 'bg-teal-50 border border-teal-400', label: 'Predefined Process' },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
        {legend.map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-4 h-3 rounded-sm ${l.color}`} />
            <span className="text-gray-600 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
      <ZoomableView svgW={SVG_W} svgH={totalH}>
        <g className="text-gray-800 dark:text-gray-100">
          {arrows}
          {layouts.map(layout => (
            <FlowchartShape key={layout.node.id} {...layout} />
          ))}
        </g>
      </ZoomableView>
    </div>
  );
}

function DataDictionaryView({ rows }: { rows: DataDictionaryRow[] }) {
  if (!rows || rows.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data dictionary available.</div>;
  }

  const cols = [
    { key: 'name', label: 'Variable Name' },
    { key: 'dataType', label: 'Data Type' },
    { key: 'formatForDisplay', label: 'Format' },
    { key: 'sizeBytes', label: 'Size (bytes)' },
    { key: 'sizeDisplay', label: 'Display Size' },
    { key: 'description', label: 'Description' },
    { key: 'example', label: 'Example' },
    { key: 'validation', label: 'Validation' },
  ] as const;

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Format notation: N = digit, X = character, .. = variable length
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              {cols.map(c => (
                <th key={c.key} className="text-left px-3 py-2 font-semibold text-xs border border-blue-700 whitespace-nowrap">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                {cols.map(c => (
                  <td key={c.key} className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-xs font-mono">
                    {row[c.key] || '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IpoChartView({ chart }: { chart: IpoChart }) {
  if (!chart) return <div className="text-center text-gray-500 py-8">No IPO chart available.</div>;

  const maxRows = Math.max(chart.inputs?.length ?? 0, chart.process?.length ?? 0, chart.outputs?.length ?? 0);

  return (
    <div>
      <h3 className="text-base font-bold text-center mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        {chart.title}
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-green-600 text-white px-4 py-2.5 font-bold text-sm border border-green-700 w-1/3">
                Input
              </th>
              <th className="bg-blue-600 text-white px-4 py-2.5 font-bold text-sm border border-blue-700 w-1/3">
                Process
              </th>
              <th className="bg-amber-600 text-white px-4 py-2.5 font-bold text-sm border border-amber-700 w-1/3">
                Output
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxRows }).map((_, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm align-top">
                  {chart.inputs?.[i] && (
                    <span className="font-mono text-xs bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded text-green-800 dark:text-green-200">
                      {chart.inputs[i]}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm align-top">
                  {chart.process?.[i] && (
                    <div className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold text-xs mt-0.5 flex-shrink-0">{i + 1}.</span>
                      <span>{chart.process[i]}</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-sm align-top">
                  {chart.outputs?.[i] && (
                    <span className="font-mono text-xs bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded text-amber-800 dark:text-amber-200">
                      {chart.outputs[i]}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const UC_RX = 90;
const UC_RY = 32;
const UC_COL_GAP = 36;
const UC_ROW_GAP = 44;
const SYSTEM_PAD_X = 56;
const SYSTEM_PAD_Y = 50;
const SYSTEM_TITLE_H = 36;
const ACTOR_HEAD_R = 13;
const ACTOR_BODY_H = 44;
const ACTOR_ARM_W = 20;
const ACTOR_LEG_H = 22;
const ACTOR_TOTAL_H = ACTOR_HEAD_R * 2 + ACTOR_BODY_H + ACTOR_LEG_H + 24;

interface UcdLayout {
  actors: (UcdActor & { cx: number; topY: number })[];
  useCases: (UcdUseCase & { cx: number; cy: number })[];
  systemX: number;
  systemY: number;
  systemW: number;
  systemH: number;
  totalW: number;
  totalH: number;
}

function layoutUcd(ucd: DesignToolsData['ucd']): UcdLayout {
  const leftActors = ucd.actors.filter(a => a.side === 'left');
  const rightActors = ucd.actors.filter(a => a.side === 'right');
  const ucCount = ucd.useCases.length;

  const ucCols = ucCount <= 3 ? 1 : ucCount <= 8 ? 2 : 3;
  const ucRows = Math.ceil(ucCount / ucCols);

  const innerW = ucCols * (UC_RX * 2) + (ucCols - 1) * UC_COL_GAP;
  const innerH = ucRows * (UC_RY * 2) + (ucRows - 1) * UC_ROW_GAP;
  const systemW = innerW + SYSTEM_PAD_X * 2;
  const systemH = innerH + SYSTEM_PAD_Y * 2 + SYSTEM_TITLE_H;

  const maxActorCount = Math.max(leftActors.length, rightActors.length, 1);
  const actorGroupH = maxActorCount * ACTOR_TOTAL_H + (maxActorCount - 1) * 28;
  const totalH = Math.max(actorGroupH, systemH) + 100;

  const systemY = (totalH - systemH) / 2;
  const actorColW = ACTOR_HEAD_R * 2 + 24;
  const systemX = actorColW + 70;
  const rightX = systemX + systemW + 70;
  const totalW = rightX + actorColW + 50;

  const placeActors = (actors: UcdActor[], baseX: number) =>
    actors.map((a, i) => {
      const totalGroupH = actors.length * ACTOR_TOTAL_H + (actors.length - 1) * 28;
      const startY = (totalH - totalGroupH) / 2;
      return { ...a, cx: baseX, topY: startY + i * (ACTOR_TOTAL_H + 28) };
    });

  const placedLeft = placeActors(leftActors, actorColW / 2 + 20);
  const placedRight = placeActors(rightActors, rightX + actorColW / 2);

  const ucStartX = systemX + SYSTEM_PAD_X + UC_RX;
  const ucStartY = systemY + SYSTEM_TITLE_H + SYSTEM_PAD_Y + UC_RY;

  const placedUseCases = ucd.useCases.map((uc, i) => {
    const col = i % ucCols;
    const row = Math.floor(i / ucCols);
    return {
      ...uc,
      cx: ucStartX + col * (UC_RX * 2 + UC_COL_GAP),
      cy: ucStartY + row * (UC_RY * 2 + UC_ROW_GAP),
    };
  });

  return {
    actors: [...placedLeft, ...placedRight],
    useCases: placedUseCases,
    systemX,
    systemY,
    systemW,
    systemH,
    totalW,
    totalH,
  };
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [text];
}

function UcdView({ ucd }: { ucd: DesignToolsData['ucd'] }) {
  if (!ucd || !ucd.actors || !ucd.useCases) {
    return <div className="text-center text-gray-500 py-8">No use case diagram available.</div>;
  }

  const layout = layoutUcd(ucd);
  const actorMap = new Map(layout.actors.map(a => [a.id, a]));
  const ucMap = new Map(layout.useCases.map(u => [u.id, u]));

  const actorCenterY = (actor: { topY: number }) =>
    actor.topY + ACTOR_HEAD_R + ACTOR_BODY_H / 2;

  const getCenter = (id: string): { x: number; y: number; isUc: boolean } | null => {
    const a = actorMap.get(id);
    if (a) return { x: a.cx, y: actorCenterY(a), isUc: false };
    const u = ucMap.get(id);
    if (u) return { x: u.cx, y: u.cy, isUc: true };
    return null;
  };

  const getEdgePoint = (c: { x: number; y: number; isUc: boolean }, toward: { x: number; y: number }) => {
    const dx = toward.x - c.x, dy = toward.y - c.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    if (c.isUc) {
      const t = 1 / Math.sqrt((ux / UC_RX) ** 2 + (uy / UC_RY) ** 2);
      return { x: c.x + ux * t, y: c.y + uy * t };
    }
    return { x: c.x + ux * ACTOR_HEAD_R, y: c.y + uy * ACTOR_HEAD_R };
  };

  const STROKE = '#6b7280';

  const relationshipLines = ucd.relationships.map((rel, i) => {
    const fromC = getCenter(rel.from);
    const toC = getCenter(rel.to);
    if (!fromC || !toC) return null;
    const fp = getEdgePoint(fromC, toC);
    const tp = getEdgePoint(toC, fromC);
    const dx = tp.x - fp.x, dy = tp.y - fp.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const midX = (fp.x + tp.x) / 2, midY = (fp.y + tp.y) / 2;

    if (rel.type === 'association') {
      return <line key={i} x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke={STROKE} strokeWidth="1.5" />;
    }
    if (rel.type === 'generalization') {
      const s = 13;
      return (
        <g key={i}>
          <line x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} stroke={STROKE} strokeWidth="1.5" />
          <polygon
            points={`${tp.x},${tp.y} ${tp.x - ux * s - uy * 6},${tp.y - uy * s + ux * 6} ${tp.x - ux * s + uy * 6},${tp.y - uy * s - ux * 6}`}
            fill="white" stroke={STROKE} strokeWidth="1.5" />
        </g>
      );
    }
    const label = rel.type === 'include' ? '«include»' : rel.type === 'extend' ? '«extend»' : '';
    const arrowLen = 10;
    return (
      <g key={i}>
        <line x1={fp.x} y1={fp.y} x2={tp.x - ux * arrowLen} y2={tp.y - uy * arrowLen}
          stroke={STROKE} strokeWidth="1.5" strokeDasharray="6,3" />
        <polygon
          points={`${tp.x},${tp.y} ${tp.x - ux * arrowLen - uy * 5},${tp.y - uy * arrowLen + ux * 5} ${tp.x - ux * arrowLen + uy * 5},${tp.y - uy * arrowLen - ux * 5}`}
          fill="white" stroke={STROKE} strokeWidth="1.5" />
        {label && <text x={midX} y={midY - 7} textAnchor="middle" fontSize="10" fontStyle="italic" fill={STROKE}>{label}</text>}
      </g>
    );
  });

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
        {[
          { line: <line x1="0" y1="8" x2="30" y2="8" stroke="#6b7280" strokeWidth="1.5" />, label: 'Association', w: 30 },
          { line: <><line x1="0" y1="8" x2="24" y2="8" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" /><polygon points="34,8 22,3 22,13" fill="white" stroke="#6b7280" strokeWidth="1.5" /></>, label: '«include» / «extend»', w: 36 },
          { line: <><line x1="0" y1="8" x2="24" y2="8" stroke="#6b7280" strokeWidth="1.5" /><polygon points="34,8 22,3 22,13" fill="white" stroke="#6b7280" strokeWidth="1.5" /></>, label: 'Generalization', w: 36 },
        ].map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            <svg width={l.w} height="16" viewBox={`0 0 ${l.w} 16`}>{l.line}</svg>
            <span className="text-gray-600 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
      </div>
      <ZoomableView svgW={layout.totalW} svgH={layout.totalH}>
        <rect x={layout.systemX} y={layout.systemY} width={layout.systemW} height={layout.systemH}
          fill="none" stroke="#9ca3af" strokeWidth="2" />
        <text x={layout.systemX + layout.systemW / 2} y={layout.systemY + 22}
          textAnchor="middle" fontSize="14" fontWeight="bold" fill="#111827" className="dark:fill-gray-100">
          {ucd.systemName}
        </text>
        <line x1={layout.systemX} y1={layout.systemY + SYSTEM_TITLE_H}
          x2={layout.systemX + layout.systemW} y2={layout.systemY + SYSTEM_TITLE_H}
          stroke="#d1d5db" strokeWidth="1" />

        {relationshipLines}

        {layout.actors.map(actor => {
          const cx = actor.cx;
          const headCY = actor.topY + ACTOR_HEAD_R;
          const neckY = headCY + ACTOR_HEAD_R;
          const bodyBotY = neckY + ACTOR_BODY_H;
          const armY = neckY + ACTOR_BODY_H * 0.35;
          const labelY = bodyBotY + ACTOR_LEG_H + 16;
          return (
            <g key={actor.id}>
              <circle cx={cx} cy={headCY} r={ACTOR_HEAD_R} fill="none" stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
              <line x1={cx} y1={neckY} x2={cx} y2={bodyBotY} stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
              <line x1={cx - ACTOR_ARM_W} y1={armY} x2={cx + ACTOR_ARM_W} y2={armY} stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
              <line x1={cx} y1={bodyBotY} x2={cx - 14} y2={bodyBotY + ACTOR_LEG_H} stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
              <line x1={cx} y1={bodyBotY} x2={cx + 14} y2={bodyBotY + ACTOR_LEG_H} stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
              <text x={cx} y={labelY} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111827" className="dark:fill-gray-100">{actor.name}</text>
            </g>
          );
        })}

        {layout.useCases.map(uc => {
          const lines = wrapText(uc.label, 18);
          const lineH = 14;
          const totalTextH = lines.length * lineH;
          return (
            <g key={uc.id}>
              <ellipse cx={uc.cx} cy={uc.cy} rx={UC_RX} ry={UC_RY}
                fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5"
                className="dark:fill-sky-900/60 dark:stroke-sky-400" />
              {lines.map((line, li) => (
                <text key={li}
                  x={uc.cx}
                  y={uc.cy - totalTextH / 2 + li * lineH + lineH * 0.8}
                  textAnchor="middle" fontSize="11" fill="#0c4a6e" className="dark:fill-sky-100">
                  {line}
                </text>
              ))}
            </g>
          );
        })}
      </ZoomableView>
    </div>
  );
}

const DFD_LEVEL_COLORS: Record<number, { bg: string; border: string; label: string }> = {
  0: { bg: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-300 dark:border-slate-600', label: 'Context Diagram (Level 0)' },
  1: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-700', label: 'Level 1 DFD' },
  2: { bg: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-700', label: 'Level 2 DFD' },
};

const EE_W = 110;
const EE_H = 46;
const PROC_R = 46;
const DS_W = 140;
const DS_H = 38;

interface DfdNodePos {
  el: DfdElement;
  x: number;
  y: number;
}

function computeDfdLayout(level: DfdLevel): { nodes: DfdNodePos[]; svgW: number; svgH: number } {
  const ees = level.elements.filter(e => e.type === 'external_entity');
  const procs = level.elements.filter(e => e.type === 'process');
  const dss = level.elements.filter(e => e.type === 'data_store');
  const nodes: DfdNodePos[] = [];

  const PROC_COL_W = PROC_R * 2 + 40;
  const DS_COL_W = DS_W + 40;
  const EE_SIDE_W = EE_W + 60;

  const procCols = Math.min(procs.length, 3);
  const procRows = Math.ceil(procs.length / procCols);
  const procZoneW = procCols * PROC_COL_W;
  const procZoneH = procRows * (PROC_R * 2 + 50);

  const dsRows = Math.ceil(dss.length / Math.max(1, Math.min(dss.length, 3)));
  const dsZoneH = dsRows * (DS_H + 30);

  const totalInnerH = procZoneH + (dss.length > 0 ? dsZoneH + 40 : 0);
  const svgH = Math.max(380, totalInnerH + 120);
  const svgW = Math.max(640, EE_SIDE_W * 2 + procZoneW + 80);

  const procOffsetX = (svgW - procZoneW) / 2 + PROC_R;
  const procOffsetY = (dss.length > 0 ? 80 : (svgH - procZoneH) / 2) + PROC_R;

  procs.forEach((p, i) => {
    const col = i % procCols;
    const row = Math.floor(i / procCols);
    nodes.push({ el: p, x: procOffsetX + col * PROC_COL_W, y: procOffsetY + row * (PROC_R * 2 + 50) });
  });

  dss.forEach((d, i) => {
    const cols = Math.min(dss.length, 3);
    const col = i % cols;
    const row = Math.floor(i / cols);
    const dsZoneW = cols * DS_COL_W;
    const dsOffsetX = (svgW - dsZoneW) / 2 + DS_W / 2;
    nodes.push({ el: d, x: dsOffsetX + col * DS_COL_W, y: procOffsetY + procZoneH + 60 + row * (DS_H + 30) });
  });

  const leftEes = ees.slice(0, Math.ceil(ees.length / 2));
  const rightEes = ees.slice(Math.ceil(ees.length / 2));

  leftEes.forEach((e, i) => {
    const y = (svgH / (leftEes.length + 1)) * (i + 1);
    nodes.push({ el: e, x: EE_W / 2 + 20, y });
  });
  rightEes.forEach((e, i) => {
    const y = (svgH / (rightEes.length + 1)) * (i + 1);
    nodes.push({ el: e, x: svgW - EE_W / 2 - 20, y });
  });

  return { nodes, svgW, svgH };
}

function dfdEdgePoint(pos: DfdNodePos, toward: { x: number; y: number }): { x: number; y: number } {
  const dx = toward.x - pos.x, dy = toward.y - pos.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const ux = dx / len, uy = dy / len;
  if (pos.el.type === 'process') {
    return { x: pos.x + ux * PROC_R, y: pos.y + uy * PROC_R };
  }
  const hw = pos.el.type === 'data_store' ? DS_W / 2 : EE_W / 2;
  const hh = pos.el.type === 'data_store' ? DS_H / 2 : EE_H / 2;
  const tx = ux === 0 ? Infinity : Math.abs(hw / ux);
  const ty = uy === 0 ? Infinity : Math.abs(hh / uy);
  const t = Math.min(tx, ty);
  return { x: pos.x + ux * t, y: pos.y + uy * t };
}

function DfdSingleLevel({ level }: { level: DfdLevel }) {
  const { nodes, svgW, svgH } = computeDfdLayout(level);
  const nodeMap = new Map(nodes.map(n => [n.el.id, n]));
  const colors = DFD_LEVEL_COLORS[level.level] ?? DFD_LEVEL_COLORS[1];
  const markerId = `dfd-arrow-${level.level}`;

  return (
    <div className={`rounded-lg border ${colors.border} ${colors.bg} p-4 mb-6`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {colors.label}
        </span>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">— {level.title}</span>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-5 bg-white dark:bg-gray-800 border border-gray-400 rounded-sm" />
          <span className="text-gray-600 dark:text-gray-400">External Entity</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900 border border-sky-400" />
          <span className="text-gray-600 dark:text-gray-400">Process</span>
        </div>
        {level.elements.some(e => e.type === 'data_store') && (
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-4 bg-amber-50 dark:bg-amber-900/40 border-t border-b border-amber-400" />
            <span className="text-gray-600 dark:text-gray-400">Data Store</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <svg width="30" height="12" viewBox="0 0 30 12">
            <line x1="0" y1="6" x2="20" y2="6" stroke="#6b7280" strokeWidth="1.5" />
            <polygon points="30,6 19,2 19,10" fill="#6b7280" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Data Flow</span>
        </div>
      </div>

      <ZoomableView svgW={svgW} svgH={svgH}>
          <defs>
            <marker id={markerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>

          {(() => {
            const pairCounts = new Map<string, number>();
            const pairIdx = new Map<string, number>();
            level.flows.forEach(f => {
              const key = [f.from, f.to].sort().join('|');
              pairCounts.set(key, (pairCounts.get(key) ?? 0) + 1);
            });
            return level.flows.map((flow, fi) => {
              const fromNode = nodeMap.get(flow.from);
              const toNode = nodeMap.get(flow.to);
              if (!fromNode || !toNode) return null;
              const pairKey = [flow.from, flow.to].sort().join('|');
              const total = pairCounts.get(pairKey) ?? 1;
              const idx = pairIdx.get(pairKey) ?? 0;
              pairIdx.set(pairKey, idx + 1);

              const fp = dfdEdgePoint(fromNode, toNode);
              const tp = dfdEdgePoint(toNode, fromNode);
              const dx = tp.x - fp.x;
              const dy = tp.y - fp.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              const nx = -dy / len;
              const ny = dx / len;
              const offset = total > 1 ? (idx - (total - 1) / 2) * 28 : 0;
              const cx = (fp.x + tp.x) / 2 + nx * offset;
              const cy = (fp.y + tp.y) / 2 + ny * offset;
              const labelW = flow.label.length * 5.5 + 10;
              const path = total > 1
                ? `M${fp.x},${fp.y} Q${cx},${cy} ${tp.x},${tp.y}`
                : `M${fp.x},${fp.y} L${tp.x},${tp.y}`;
              return (
                <g key={fi}>
                  <path d={path} fill="none" stroke="#6b7280" strokeWidth="1.5" markerEnd={`url(#${markerId})`} />
                  <rect x={cx - labelW / 2} y={cy - 9} width={labelW} height={16}
                    rx="3" fill="white" fillOpacity="0.95" stroke="#d1d5db" strokeWidth="0.5"
                    className="dark:fill-gray-900" />
                  <text x={cx} y={cy + 2}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontFamily="monospace" fill="#374151" className="dark:fill-gray-300">
                    {flow.label}
                  </text>
                </g>
              );
            });
          })()}

          {nodes.map(({ el, x, y }) => {
            if (el.type === 'external_entity') {
              return (
                <g key={el.id}>
                  <rect x={x - EE_W / 2} y={y - EE_H / 2} width={EE_W} height={EE_H}
                    fill="white" stroke="#6b7280" strokeWidth="1.5" rx="3"
                    className="dark:fill-gray-800 dark:stroke-gray-400" />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="600" fill="#111827" className="dark:fill-gray-100">
                    {el.label}
                  </text>
                </g>
              );
            }
            if (el.type === 'process') {
              const lines = wrapText(el.label, 14);
              const lineH = 12;
              const totalTextH = lines.length * lineH;
              return (
                <g key={el.id}>
                  <circle cx={x} cy={y} r={PROC_R}
                    fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5"
                    className="dark:fill-sky-900 dark:stroke-sky-500" />
                  {lines.map((line, li) => (
                    <text key={li} x={x} y={y - totalTextH / 2 + li * lineH + lineH * 0.8}
                      textAnchor="middle" fontSize="10" fill="#0c4a6e" className="dark:fill-sky-100">
                      {line}
                    </text>
                  ))}
                </g>
              );
            }
            if (el.type === 'data_store') {
              const left = x - DS_W / 2;
              const top = y - DS_H / 2;
              const tabW = 26;
              return (
                <g key={el.id}>
                  <rect x={left} y={top} width={DS_W} height={DS_H}
                    fill="#fffbeb" stroke="#d97706" strokeWidth="1.5"
                    className="dark:fill-amber-950 dark:stroke-amber-500" />
                  <line x1={left + tabW} y1={top} x2={left + tabW} y2={top + DS_H}
                    stroke="#d97706" strokeWidth="1.5" className="dark:stroke-amber-500" />
                  <text x={left + tabW / 2} y={y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="9" fontWeight="700" fill="#92400e" className="dark:fill-amber-300">
                    {el.id.replace(/[^0-9]/g, '') || '1'}
                  </text>
                  <text x={left + tabW + (DS_W - tabW) / 2} y={y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fill="#92400e" className="dark:fill-amber-200">
                    {el.label.replace(/^D\d+\s*/, '')}
                  </text>
                </g>
              );
            }
            return null;
          })}
      </ZoomableView>
    </div>
  );
}

function DfdView({ levels }: { levels: DfdLevel[] }) {
  if (!levels || levels.length === 0) {
    return <div className="text-center text-gray-500 py-8">No data flow diagram available.</div>;
  }

  const [activeLevel, setActiveLevel] = useState(0);
  const sortedLevels = [...levels].sort((a, b) => a.level - b.level);
  const current = sortedLevels[activeLevel] ?? sortedLevels[0];

  const levelLabels: Record<number, string> = {
    0: 'Context Diagram',
    1: 'Level 1 DFD',
    2: 'Level 2 DFD',
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">DFD Level:</span>
        {sortedLevels.map((lvl, i) => (
          <button
            key={i}
            onClick={() => setActiveLevel(i)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              activeLevel === i
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            {levelLabels[lvl.level] ?? `Level ${lvl.level}`}
          </button>
        ))}
      </div>

      <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-300">
        {current.level === 0 && 'Context Diagram: Shows the entire system as a single process with all external entities and data flows. No data stores.'}
        {current.level === 1 && 'Level 1 DFD: Decomposes the system into its major numbered processes. Data stores appear. External entities cannot connect directly to data stores.'}
        {current.level === 2 && `Level 2 DFD: Decomposes ${current.parentProcessId ? `process ${current.parentProcessId}` : 'a process'} into sub-processes. Process numbers use dot notation (e.g. 1.1, 1.2). Balanced with parent data flows.`}
      </div>

      <DfdSingleLevel level={current} />

      {sortedLevels.length > 1 && (
        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs text-gray-600 dark:text-gray-400">
          <strong>VCAA Balancing rule:</strong> All data flows entering and leaving a process in a higher-level DFD must be preserved when that process is decomposed into a lower-level DFD.
        </div>
      )}
    </div>
  );
}

// ─── ERD shared helpers ───────────────────────────────────────────────────────

type ErdData = DesignToolsData['erd'];

function useErdLayout(erd: ErdData) {
  if (!erd?.entities?.length) return null;

  const ENT_W = 160;
  const ENT_ATTR_H = 22;
  const ENT_HEADER_H = 32;
  const REL_SIZE = 56;
  const cols = Math.min(erd.entities.length, 3);
  const colGap = 260;
  const rowGap = 300;

  const entityPositions: Record<string, { x: number; y: number; w: number; h: number }> = {};
  erd.entities.forEach((ent, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h = ENT_HEADER_H + ent.attributes.length * ENT_ATTR_H + 8;
    entityPositions[ent.id] = {
      x: 80 + col * colGap,
      y: 80 + row * rowGap,
      w: ENT_W,
      h,
    };
  });

  const relPositions: Record<string, { x: number; y: number }> = {};
  erd.relationships.forEach(rel => {
    const [a, b] = rel.entities;
    const pa = entityPositions[a];
    const pb = entityPositions[b];
    if (!pa || !pb) return;
    relPositions[rel.id] = {
      x: (pa.x + pa.w / 2 + pb.x + pb.w / 2) / 2 - REL_SIZE / 2,
      y: (pa.y + pa.h / 2 + pb.y + pb.h / 2) / 2 - REL_SIZE / 2,
    };
  });

  const allX = Object.values(entityPositions).map(p => p.x + p.w);
  const allY = Object.values(entityPositions).map(p => p.y + p.h);
  const svgW = Math.max(...allX) + 100;
  const svgH = Math.max(...allY) + 100;

  return { entityPositions, relPositions, svgW, svgH, ENT_W, ENT_ATTR_H, ENT_HEADER_H, REL_SIZE };
}

// ─── Chen's Notation ERD ─────────────────────────────────────────────────────

function ErdChenView({ erd }: { erd: ErdData }) {
  if (!erd?.entities?.length) {
    return <div className="text-center text-gray-500 py-8">No ERD data available.</div>;
  }

  const layout = useErdLayout(erd);
  if (!layout) return null;

  const { entityPositions, relPositions, svgW, svgH, ENT_HEADER_H, REL_SIZE } = layout;

  const ATTR_ELLIPSE_RX = 44;
  const ATTR_ELLIPSE_RY = 16;

  const getEntityCenter = (id: string) => {
    const p = entityPositions[id];
    if (!p) return { x: 0, y: 0 };
    return { x: p.x + p.w / 2, y: p.y + p.h / 2 };
  };

  const getRelCenter = (id: string) => {
    const p = relPositions[id];
    if (!p) return { x: 0, y: 0 };
    return { x: p.x + REL_SIZE / 2, y: p.y + REL_SIZE / 2 };
  };

  return (
    <div>
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <rect x="2" y="2" width="36" height="16" fill="none" stroke="#2563eb" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Entity (strong)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <rect x="2" y="2" width="36" height="16" fill="none" stroke="#2563eb" strokeWidth="1.5" />
            <rect x="5" y="5" width="30" height="10" fill="none" stroke="#2563eb" strokeWidth="1" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Weak entity</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <polygon points="20,2 38,10 20,18 2,10" fill="none" stroke="#d97706" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Relationship</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <ellipse cx="20" cy="10" rx="18" ry="8" fill="none" stroke="#16a34a" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Attribute</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <ellipse cx="20" cy="10" rx="18" ry="8" fill="none" stroke="#16a34a" strokeWidth="1.5" />
            <ellipse cx="20" cy="10" rx="14" ry="5" fill="none" stroke="#16a34a" strokeWidth="1" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Multi-valued</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <ellipse cx="20" cy="10" rx="18" ry="8" fill="none" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,2" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Derived</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="40" height="20" viewBox="0 0 40 20">
            <text x="20" y="14" textAnchor="middle" fontSize="11" fontWeight="bold" textDecoration="underline" fill="#374151">pk</text>
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Primary key (underlined)</span>
        </div>
      </div>

      <div className="overflow-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
          {erd.relationships.map(rel => {
            const relC = getRelCenter(rel.id);
            return rel.entities.map(entId => {
              const entC = getEntityCenter(entId);
              const participation = rel.participation?.[entId];
              return (
                <line
                  key={`${rel.id}-${entId}`}
                  x1={relC.x} y1={relC.y}
                  x2={entC.x} y2={entC.y}
                  stroke="#6b7280" strokeWidth={participation === 'total' ? 3 : 1.5}
                  strokeDasharray={participation === 'total' ? undefined : undefined}
                />
              );
            });
          })}

          {erd.entities.map(ent => {
            const p = entityPositions[ent.id];
            if (!p) return null;
            const cx = p.x + p.w / 2;
            const totalAttrs = ent.attributes.length;
            const angleStep = totalAttrs > 0 ? (2 * Math.PI) / totalAttrs : 0;
            const attrOrbitR = 90;

            return (
              <g key={ent.id}>
                {ent.attributes.map((attr, ai) => {
                  const angle = -Math.PI / 2 + ai * angleStep;
                  const ax = cx + Math.cos(angle) * attrOrbitR;
                  const ay = p.y + p.h / 2 + Math.sin(angle) * attrOrbitR;
                  return (
                    <g key={attr.name}>
                      <line x1={cx} y1={p.y + p.h / 2} x2={ax} y2={ay}
                        stroke="#9ca3af" strokeWidth="1" />
                      {attr.isDerived ? (
                        <ellipse cx={ax} cy={ay} rx={ATTR_ELLIPSE_RX} ry={ATTR_ELLIPSE_RY}
                          fill="white" stroke="#16a34a" strokeWidth="1.5" strokeDasharray="4,2"
                          className="dark:fill-gray-900" />
                      ) : attr.isMultiValued ? (
                        <g>
                          <ellipse cx={ax} cy={ay} rx={ATTR_ELLIPSE_RX} ry={ATTR_ELLIPSE_RY}
                            fill="white" stroke="#16a34a" strokeWidth="1.5"
                            className="dark:fill-gray-900" />
                          <ellipse cx={ax} cy={ay} rx={ATTR_ELLIPSE_RX - 4} ry={ATTR_ELLIPSE_RY - 4}
                            fill="none" stroke="#16a34a" strokeWidth="1" />
                        </g>
                      ) : (
                        <ellipse cx={ax} cy={ay} rx={ATTR_ELLIPSE_RX} ry={ATTR_ELLIPSE_RY}
                          fill="white" stroke="#16a34a" strokeWidth="1.5"
                          className="dark:fill-gray-900" />
                      )}
                      {attr.isPrimary ? (
                        <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize="9" fontFamily="sans-serif" textDecoration="underline"
                          fill="#111827" className="dark:fill-gray-100">
                          {attr.name}
                        </text>
                      ) : (
                        <text x={ax} y={ay + 1} textAnchor="middle" dominantBaseline="middle"
                          fontSize="9" fontFamily="sans-serif"
                          fill="#374151" className="dark:fill-gray-300">
                          {attr.name}
                        </text>
                      )}
                    </g>
                  );
                })}

                {ent.isWeak ? (
                  <g>
                    <rect x={p.x} y={p.y} width={p.w} height={ENT_HEADER_H}
                      fill="#eff6ff" stroke="#2563eb" strokeWidth="2"
                      className="dark:fill-blue-950" />
                    <rect x={p.x + 3} y={p.y + 3} width={p.w - 6} height={ENT_HEADER_H - 6}
                      fill="none" stroke="#2563eb" strokeWidth="1" />
                  </g>
                ) : (
                  <rect x={p.x} y={p.y} width={p.w} height={ENT_HEADER_H}
                    fill="#eff6ff" stroke="#2563eb" strokeWidth="2"
                    className="dark:fill-blue-950" />
                )}
                <text x={cx} y={p.y + ENT_HEADER_H / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fontWeight="bold" fill="#1e40af"
                  className="dark:fill-blue-300">
                  {ent.name}
                </text>
              </g>
            );
          })}

          {erd.relationships.map(rel => {
            const rp = relPositions[rel.id];
            if (!rp) return null;
            const rx = rp.x + REL_SIZE / 2;
            const ry = rp.y + REL_SIZE / 2;
            const half = REL_SIZE / 2;

            const cardLabels = rel.entities.map(entId => {
              const entC = getEntityCenter(entId);
              const relC = { x: rx, y: ry };
              const dx = entC.x - relC.x;
              const dy = entC.y - relC.y;
              const len = Math.sqrt(dx * dx + dy * dy) || 1;
              return {
                entId,
                x: relC.x + (dx / len) * (half + 18),
                y: relC.y + (dy / len) * (half + 18),
                label: rel.cardinality?.[entId] === 'many' ? 'N' : '1',
              };
            });

            return (
              <g key={rel.id}>
                {rel.isWeak ? (
                  <g>
                    <polygon points={`${rx},${ry - half} ${rx + half},${ry} ${rx},${ry + half} ${rx - half},${ry}`}
                      fill="#fef3c7" stroke="#d97706" strokeWidth="2"
                      className="dark:fill-amber-950" />
                    <polygon points={`${rx},${ry - half + 5} ${rx + half - 5},${ry} ${rx},${ry + half - 5} ${rx - half + 5},${ry}`}
                      fill="none" stroke="#d97706" strokeWidth="1" />
                  </g>
                ) : (
                  <polygon points={`${rx},${ry - half} ${rx + half},${ry} ${rx},${ry + half} ${rx - half},${ry}`}
                    fill="#fef3c7" stroke="#d97706" strokeWidth="2"
                    className="dark:fill-amber-950" />
                )}
                <text x={rx} y={ry + 1} textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontWeight="600" fill="#92400e" className="dark:fill-amber-200">
                  {rel.name}
                </text>
                {cardLabels.map(cl => (
                  <text key={cl.entId} x={cl.x} y={cl.y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="12" fontWeight="bold" fill="#dc2626"
                    className="dark:fill-red-400">
                    {cl.label}
                  </text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-300">
        <strong>Chen's Notation:</strong> Entities are rectangles, relationships are diamonds, attributes are ellipses. Double border = weak entity/relationship. Underlined attribute = primary key. Double ellipse = multi-valued. Dashed ellipse = derived. Double line = total participation. Single line = partial participation.
      </div>
    </div>
  );
}

// ─── Crow's Foot Notation ERD ────────────────────────────────────────────────

function ErdCrowsFootView({ erd }: { erd: ErdData }) {
  if (!erd?.entities?.length) {
    return <div className="text-center text-gray-500 py-8">No ERD data available.</div>;
  }

  const ENT_W = 190;
  const ENT_ATTR_H = 22;
  const ENT_HEADER_H = 32;
  const cols = Math.min(erd.entities.length, 3);
  const colGap = 300;
  const rowGap = 280;

  const entityPositions: Record<string, { x: number; y: number; w: number; h: number }> = {};
  erd.entities.forEach((ent, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h = ENT_HEADER_H + ent.attributes.length * ENT_ATTR_H + 8;
    entityPositions[ent.id] = {
      x: 60 + col * colGap,
      y: 60 + row * rowGap,
      w: ENT_W,
      h,
    };
  });

  const allX = Object.values(entityPositions).map(p => p.x + p.w);
  const allY = Object.values(entityPositions).map(p => p.y + p.h);
  const svgW = Math.max(...allX) + 80;
  const svgH = Math.max(...allY) + 80;

  const getEntityBorderPoint = (id: string, toward: { x: number; y: number }) => {
    const p = entityPositions[id];
    if (!p) return { x: 0, y: 0 };
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    const dx = toward.x - cx;
    const dy = toward.y - cy;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const hw = p.w / 2;
    const hh = p.h / 2;
    let t: number;
    if (absDx * hh > absDy * hw) {
      t = hw / (absDx || 1);
    } else {
      t = hh / (absDy || 1);
    }
    return { x: cx + dx * t, y: cy + dy * t };
  };

  const drawCrowsFoot = (x: number, y: number, dx: number, dy: number, cardinality: 'one' | 'many', participation: 'partial' | 'total') => {
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const perp = 8;
    const tickOffset = 14;
    const crowOffset = 22;

    const elements: React.ReactNode[] = [];

    if (participation === 'total') {
      elements.push(
        <line key="total1"
          x1={x - ux * tickOffset - uy * perp} y1={y - uy * tickOffset + ux * perp}
          x2={x - ux * tickOffset + uy * perp} y2={y - uy * tickOffset - ux * perp}
          stroke="#374151" strokeWidth="2" className="dark:stroke-gray-300" />,
        <line key="total2"
          x1={x - ux * (tickOffset + 5) - uy * perp} y1={y - uy * (tickOffset + 5) + ux * perp}
          x2={x - ux * (tickOffset + 5) + uy * perp} y2={y - uy * (tickOffset + 5) - ux * perp}
          stroke="#374151" strokeWidth="2" className="dark:stroke-gray-300" />
      );
    } else {
      elements.push(
        <line key="partial"
          x1={x - ux * tickOffset - uy * perp} y1={y - uy * tickOffset + ux * perp}
          x2={x - ux * tickOffset + uy * perp} y2={y - uy * tickOffset - ux * perp}
          stroke="#374151" strokeWidth="2" className="dark:stroke-gray-300" />
      );
    }

    if (cardinality === 'many') {
      elements.push(
        <line key="cf1"
          x1={x - ux * crowOffset} y1={y - uy * crowOffset}
          x2={x - uy * perp} y2={y + ux * perp}
          stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />,
        <line key="cf2"
          x1={x - ux * crowOffset} y1={y - uy * crowOffset}
          x2={x + uy * perp} y2={y - ux * perp}
          stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />,
        <line key="cf3"
          x1={x - ux * crowOffset} y1={y - uy * crowOffset}
          x2={x} y2={y}
          stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
      );
    } else {
      elements.push(
        <line key="one"
          x1={x - ux * crowOffset - uy * perp} y1={y - uy * crowOffset + ux * perp}
          x2={x - ux * crowOffset + uy * perp} y2={y - uy * crowOffset - ux * perp}
          stroke="#374151" strokeWidth="2" className="dark:stroke-gray-300" />
      );
    }

    return elements;
  };

  return (
    <div>
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs flex flex-wrap gap-5">
        <div className="flex items-center gap-2">
          <svg width="50" height="20" viewBox="0 0 50 20">
            <line x1="0" y1="10" x2="50" y2="10" stroke="#374151" strokeWidth="1.5" />
            <line x1="10" y1="4" x2="10" y2="16" stroke="#374151" strokeWidth="2" />
            <line x1="15" y1="4" x2="15" y2="16" stroke="#374151" strokeWidth="2" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Mandatory (total)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="50" height="20" viewBox="0 0 50 20">
            <line x1="0" y1="10" x2="50" y2="10" stroke="#374151" strokeWidth="1.5" />
            <line x1="10" y1="4" x2="10" y2="16" stroke="#374151" strokeWidth="2" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Optional (partial)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="50" height="20" viewBox="0 0 50 20">
            <line x1="0" y1="10" x2="30" y2="10" stroke="#374151" strokeWidth="1.5" />
            <line x1="36" y1="4" x2="36" y2="16" stroke="#374151" strokeWidth="2" />
            <line x1="30" y1="4" x2="50" y2="10" stroke="#374151" strokeWidth="1.5" />
            <line x1="30" y1="16" x2="50" y2="10" stroke="#374151" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">One</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="50" height="20" viewBox="0 0 50 20">
            <line x1="0" y1="10" x2="30" y2="10" stroke="#374151" strokeWidth="1.5" />
            <line x1="36" y1="4" x2="36" y2="16" stroke="#374151" strokeWidth="2" />
            <line x1="50" y1="10" x2="30" y2="4" stroke="#374151" strokeWidth="1.5" />
            <line x1="50" y1="10" x2="30" y2="16" stroke="#374151" strokeWidth="1.5" />
            <line x1="50" y1="10" x2="30" y2="10" stroke="#374151" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Many</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 16 16">
            <rect x="1" y="1" width="14" height="14" fill="#eff6ff" stroke="#2563eb" strokeWidth="1.5" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Entity</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 font-bold underline text-xs">PK</span>
          <span className="text-gray-600 dark:text-gray-400">Primary key</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400 italic text-xs">FK</span>
          <span className="text-gray-600 dark:text-gray-400">Foreign key</span>
        </div>
      </div>

      <div className="overflow-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
          {erd.relationships.map(rel => {
            const [aId, bId] = rel.entities;
            const pa = entityPositions[aId];
            const pb = entityPositions[bId];
            if (!pa || !pb) return null;
            const acx = pa.x + pa.w / 2;
            const acy = pa.y + pa.h / 2;
            const bcx = pb.x + pb.w / 2;
            const bcy = pb.y + pb.h / 2;

            const ptA = getEntityBorderPoint(aId, { x: bcx, y: bcy });
            const ptB = getEntityBorderPoint(bId, { x: acx, y: acy });
            const dxAB = ptB.x - ptA.x;
            const dyAB = ptB.y - ptA.y;
            const dxBA = ptA.x - ptB.x;
            const dyBA = ptA.y - ptB.y;
            const midX = (ptA.x + ptB.x) / 2;
            const midY = (ptA.y + ptB.y) / 2;

            return (
              <g key={rel.id}>
                <line x1={ptA.x} y1={ptA.y} x2={ptB.x} y2={ptB.y}
                  stroke="#9ca3af" strokeWidth="1.5" />
                {drawCrowsFoot(ptA.x, ptA.y, dxAB, dyAB,
                  rel.cardinality?.[aId] ?? 'one',
                  rel.participation?.[aId] ?? 'partial'
                )}
                {drawCrowsFoot(ptB.x, ptB.y, dxBA, dyBA,
                  rel.cardinality?.[bId] ?? 'many',
                  rel.participation?.[bId] ?? 'partial'
                )}
                <rect x={midX - rel.name.length * 3.5 - 4} y={midY - 9}
                  width={rel.name.length * 7 + 8} height={18}
                  rx="3" fill="white" fillOpacity="0.9" className="dark:fill-gray-900" />
                <text x={midX} y={midY + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="10" fontStyle="italic" fill="#374151"
                  className="dark:fill-gray-300">
                  {rel.name}
                </text>
              </g>
            );
          })}

          {erd.entities.map(ent => {
            const p = entityPositions[ent.id];
            if (!p) return null;
            const cx = p.x + p.w / 2;

            return (
              <g key={ent.id}>
                <rect x={p.x} y={p.y} width={p.w} height={p.h}
                  fill="white" stroke="#2563eb" strokeWidth="2" rx="2"
                  className="dark:fill-gray-900" />
                <rect x={p.x} y={p.y} width={p.w} height={ENT_HEADER_H}
                  fill="#eff6ff" stroke="none" rx="2"
                  className="dark:fill-blue-950" />
                <rect x={p.x} y={p.y + ENT_HEADER_H - 1} width={p.w} height={1}
                  fill="#2563eb" />
                <text x={cx} y={p.y + ENT_HEADER_H / 2 + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="12" fontWeight="bold" fill="#1e40af"
                  className="dark:fill-blue-300">
                  {ent.name}
                </text>

                {ent.attributes.map((attr, ai) => {
                  const ay = p.y + ENT_HEADER_H + ai * ENT_ATTR_H + ENT_ATTR_H / 2 + 4;
                  const isPK = attr.isPrimary;
                  const isFK = attr.isForeign;
                  return (
                    <g key={attr.name}>
                      {ai > 0 && (
                        <line x1={p.x} y1={p.y + ENT_HEADER_H + ai * ENT_ATTR_H + 4}
                          x2={p.x + p.w} y2={p.y + ENT_HEADER_H + ai * ENT_ATTR_H + 4}
                          stroke="#e5e7eb" strokeWidth="0.5" className="dark:stroke-gray-700" />
                      )}
                      <text x={p.x + 10} y={ay}
                        dominantBaseline="middle"
                        fontSize="10"
                        fontWeight={isPK ? 'bold' : 'normal'}
                        fontStyle={isFK ? 'italic' : 'normal'}
                        textDecoration={isPK ? 'underline' : 'none'}
                        fill={isPK ? '#1e40af' : isFK ? '#6b7280' : '#374151'}
                        className={isPK ? 'dark:fill-blue-300' : isFK ? 'dark:fill-gray-400' : 'dark:fill-gray-200'}>
                        {isPK ? 'PK ' : isFK ? 'FK ' : '      '}{attr.name}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg text-xs text-blue-700 dark:text-blue-300">
        <strong>Crow's Foot Notation:</strong> Entities are rectangles with a header. Relationship lines connect entities directly. The crow's foot symbol at each end shows cardinality (one / many). Two tick marks = mandatory (total participation). One tick mark = optional (partial participation).
      </div>
    </div>
  );
}

// ─── GUI Mockup View ─────────────────────────────────────────────────────────

function renderWidget(w: MockupWidget, isDark: boolean): React.ReactNode {
  const fill = isDark ? '#1f2937' : '#ffffff';
  const fillLight = isDark ? '#374151' : '#f3f4f6';
  const fillBlue = isDark ? '#1e3a5f' : '#dbeafe';
  const borderColor = isDark ? '#4b5563' : '#9ca3af';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const dimColor = isDark ? '#6b7280' : '#9ca3af';
  const accentColor = '#2563eb';

  const { x, y, width: w2, height: h, label } = w;

  switch (w.type) {
    case 'window':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="1.5" />
          <rect x={x} y={y} width={w2} height={22} fill={accentColor} />
          <text x={x + 8} y={y + 14} fontSize="11" fontWeight="600" fill="white">{label}</text>
          <circle cx={x + w2 - 12} cy={y + 11} r="5" fill="#ef4444" />
          <circle cx={x + w2 - 26} cy={y + 11} r="5" fill="#f59e0b" />
          <circle cx={x + w2 - 40} cy={y + 11} r="5" fill="#22c55e" />
        </g>
      );

    case 'menubar':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="0.5" />
          <text x={x + 10} y={y + h / 2 + 4} fontSize="11" fill={textColor}>{label}</text>
        </g>
      );

    case 'statusbar':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="0.5" />
          <text x={x + 8} y={y + h / 2 + 4} fontSize="10" fill={dimColor}>{label}</text>
        </g>
      );

    case 'label':
      return (
        <text key={w.id} x={x} y={y + h / 2 + 4} fontSize="12" fill={textColor} fontFamily="sans-serif">
          {label}
        </text>
      );

    case 'textbox':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fill} stroke={borderColor} strokeWidth="1" rx="3" />
          <text x={x + 6} y={y + h / 2 + 4} fontSize="11" fill={w.value ? textColor : dimColor} fontFamily="monospace">
            {w.value || w.placeholder || ''}
          </text>
          <line x1={x + 6 + (w.value || w.placeholder || '').length * 6.2} y1={y + 4}
            x2={x + 6 + (w.value || w.placeholder || '').length * 6.2} y2={y + h - 4}
            stroke={accentColor} strokeWidth="1.2" opacity="0.7" />
        </g>
      );

    case 'textarea':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fill} stroke={borderColor} strokeWidth="1" rx="3" />
          <text x={x + 6} y={y + 16} fontSize="11" fill={w.value ? textColor : dimColor} fontFamily="monospace">
            {w.value || w.placeholder || ''}
          </text>
          <line x1={x + w2 - 8} y1={y + h - 12} x2={x + w2 - 4} y2={y + h - 4} stroke={dimColor} strokeWidth="1" />
          <line x1={x + w2 - 12} y1={y + h - 8} x2={x + w2 - 4} y2={y + h - 4} stroke={dimColor} strokeWidth="1" />
        </g>
      );

    case 'button': {
      const isDefault = label.toLowerCase().includes('ok') || label.toLowerCase().includes('submit') || label.toLowerCase().includes('confirm');
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h}
            fill={isDefault ? accentColor : fillLight}
            stroke={isDefault ? accentColor : borderColor}
            strokeWidth="1.5" rx="4" />
          <text x={x + w2 / 2} y={y + h / 2 + 4}
            textAnchor="middle" fontSize="12" fontWeight="600"
            fill={isDefault ? 'white' : textColor}>
            {label}
          </text>
        </g>
      );
    }

    case 'dropdown':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fill} stroke={borderColor} strokeWidth="1" rx="3" />
          <text x={x + 8} y={y + h / 2 + 4} fontSize="11" fill={w.items?.[0] ? textColor : dimColor}>
            {w.items?.[0] || label || 'Select...'}
          </text>
          <polygon points={`${x + w2 - 18},${y + h / 2 - 3} ${x + w2 - 8},${y + h / 2 - 3} ${x + w2 - 13},${y + h / 2 + 4}`}
            fill={dimColor} />
          <line x1={x + w2 - 24} y1={y + 2} x2={x + w2 - 24} y2={y + h - 2} stroke={borderColor} strokeWidth="0.75" />
        </g>
      );

    case 'checkbox': {
      const checked = w.checked ?? false;
      return (
        <g key={w.id}>
          <rect x={x} y={y + (h - 14) / 2} width={14} height={14}
            fill={checked ? accentColor : fill} stroke={checked ? accentColor : borderColor} strokeWidth="1.5" rx="2" />
          {checked && (
            <polyline points={`${x + 3},${y + (h - 14) / 2 + 7} ${x + 6},${y + (h - 14) / 2 + 11} ${x + 11},${y + (h - 14) / 2 + 4}`}
              fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
          )}
          <text x={x + 20} y={y + h / 2 + 4} fontSize="12" fill={textColor}>{label}</text>
        </g>
      );
    }

    case 'radio': {
      const items = w.items?.length ? w.items : [label];
      return (
        <g key={w.id}>
          {items.map((item, i) => (
            <g key={i}>
              <circle cx={x + 7} cy={y + 8 + i * 22} r="6" fill={fill} stroke={borderColor} strokeWidth="1.5" />
              {i === 0 && <circle cx={x + 7} cy={y + 8 + i * 22} r="3" fill={accentColor} />}
              <text x={x + 20} y={y + 8 + i * 22 + 4} fontSize="12" fill={textColor}>{item}</text>
            </g>
          ))}
        </g>
      );
    }

    case 'listbox': {
      const items = w.items || [];
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fill} stroke={borderColor} strokeWidth="1" rx="2" />
          {items.slice(0, Math.floor((h - 4) / 20)).map((item, i) => (
            <g key={i}>
              {i === 0 && (
                <rect x={x + 1} y={y + 1 + i * 20} width={w2 - 2} height={20}
                  fill={fillBlue} rx="1" />
              )}
              <text x={x + 6} y={y + 14 + i * 20} fontSize="11" fill={textColor}>{item}</text>
            </g>
          ))}
          <rect x={x + w2 - 12} y={y} width={12} height={h} fill={fillLight} stroke={borderColor} strokeWidth="0.5" />
          <text x={x + w2 - 6} y={y + 14} textAnchor="middle" fontSize="9" fill={dimColor}>▲</text>
          <text x={x + w2 - 6} y={y + h - 4} textAnchor="middle" fontSize="9" fill={dimColor}>▼</text>
        </g>
      );
    }

    case 'table': {
      const cols = w.columns || [];
      const rows = w.rows || [];
      const colW = cols.length > 0 ? Math.floor(w2 / cols.length) : w2;
      const rowH = 22;
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fill} stroke={borderColor} strokeWidth="1" />
          {cols.map((col, ci) => (
            <g key={ci}>
              <rect x={x + ci * colW} y={y} width={colW} height={rowH}
                fill={fillBlue} stroke={borderColor} strokeWidth="0.5" />
              <text x={x + ci * colW + colW / 2} y={y + rowH / 2 + 4}
                textAnchor="middle" fontSize="10" fontWeight="600" fill={textColor}>{col}</text>
            </g>
          ))}
          {rows.slice(0, Math.floor((h - rowH) / rowH)).map((row, ri) => (
            row.map((cell, ci) => (
              <g key={`${ri}-${ci}`}>
                <rect x={x + ci * colW} y={y + rowH + ri * rowH} width={colW} height={rowH}
                  fill={ri % 2 === 0 ? fill : fillLight} stroke={borderColor} strokeWidth="0.25" />
                <text x={x + ci * colW + 4} y={y + rowH + ri * rowH + rowH / 2 + 4}
                  fontSize="10" fill={textColor}>{cell}</text>
              </g>
            ))
          ))}
        </g>
      );
    }

    case 'image':
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="1" rx="2" />
          <line x1={x} y1={y} x2={x + w2} y2={y + h} stroke={borderColor} strokeWidth="0.75" />
          <line x1={x + w2} y1={y} x2={x} y2={y + h} stroke={borderColor} strokeWidth="0.75" />
          <text x={x + w2 / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="10" fill={dimColor}>{label || 'Image'}</text>
        </g>
      );

    case 'progressbar': {
      const pct = parseFloat(w.value || '0') / 100;
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="1" rx={h / 2} />
          <rect x={x + 1} y={y + 1} width={Math.max(0, (w2 - 2) * pct)} height={h - 2}
            fill={accentColor} rx={(h - 2) / 2} />
          <text x={x + w2 / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="10" fill={textColor}>
            {label || `${Math.round(pct * 100)}%`}
          </text>
        </g>
      );
    }

    case 'groupbox':
      return (
        <g key={w.id}>
          <rect x={x} y={y + 8} width={w2} height={h - 8}
            fill="none" stroke={borderColor} strokeWidth="1.5" rx="4" />
          <rect x={x + 10} y={y} width={label.length * 7 + 8} height={16}
            fill={isDark ? '#111827' : 'white'} />
          <text x={x + 14} y={y + 12} fontSize="11" fontWeight="600" fill={textColor}>{label}</text>
        </g>
      );

    case 'annotation':
      return null;

    default:
      return (
        <g key={w.id}>
          <rect x={x} y={y} width={w2} height={h} fill={fillLight} stroke={borderColor} strokeWidth="1" rx="2" />
          <text x={x + w2 / 2} y={y + h / 2 + 4} textAnchor="middle" fontSize="11" fill={textColor}>{label}</text>
        </g>
      );
  }
}

function MockupSingleScreen({ screen, isDark }: { screen: MockupScreen; isDark: boolean }) {
  const SCALE_W = 560;
  const scale = SCALE_W / screen.width;
  const scaledH = screen.height * scale;

  const annotatedWidgets = screen.widgets.filter(w => w.annotation && w.type !== 'annotation');

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-2">
        <Monitor className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{screen.title}</span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{screen.width} × {screen.height}px</span>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={SCALE_W + 240}
          height={scaledH + 40}
          viewBox={`0 0 ${SCALE_W + 240} ${scaledH + 40}`}
          className="mx-auto"
        >
          <rect x="20" y="20" width={SCALE_W} height={scaledH}
            fill={isDark ? '#0f172a' : '#f8fafc'}
            stroke={isDark ? '#334155' : '#cbd5e1'}
            strokeWidth="1.5"
            rx="4" />

          <g transform={`translate(20, 20) scale(${scale})`}>
            {screen.widgets.map(w => renderWidget(w, isDark))}
          </g>

          {annotatedWidgets.map((w, i) => {
            const sx = 20 + w.x * scale + w.width * scale / 2;
            const sy = 20 + w.y * scale + w.height * scale / 2;
            const ax = SCALE_W + 40 + 20;
            const ay = 30 + i * 36;
            const midX = (sx + ax) / 2;
            return (
              <g key={`ann-${w.id}`}>
                <circle cx={sx} cy={sy} r="4" fill="#f59e0b" stroke="white" strokeWidth="1.5" />
                <path d={`M${sx},${sy} C${midX},${sy} ${midX},${ay} ${ax},${ay}`}
                  fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,2" opacity="0.8" />
                <rect x={ax} y={ay - 11} width={180} height={22} rx="4"
                  fill={isDark ? '#292524' : '#fffbeb'}
                  stroke="#f59e0b" strokeWidth="1" />
                <text x={ax + 6} y={ay + 4} fontSize="10" fill={isDark ? '#fde68a' : '#92400e'}>
                  {w.annotation!.length > 26 ? w.annotation!.slice(0, 26) + '…' : w.annotation}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function MockupView({ screens }: { screens: MockupScreen[] }) {
  const [activeScreen, setActiveScreen] = useState(0);
  const isDark = typeof document !== 'undefined'
    ? document.documentElement.classList.contains('dark')
    : false;

  if (!screens || screens.length === 0) {
    return <div className="text-center text-gray-500 py-8">No mockup data available.</div>;
  }

  const current = screens[activeScreen] ?? screens[0];

  return (
    <div>
      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-600 dark:text-gray-400">
        AI-generated annotated GUI mockup based on the program's input/output structure. Annotations (amber dots) identify each widget's purpose.
      </div>

      {screens.length > 1 && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Screen:</span>
          {screens.map((s, i) => (
            <button
              key={i}
              onClick={() => setActiveScreen(i)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                activeScreen === i
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400'
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <MockupSingleScreen screen={current} isDark={isDark} />

      <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-xs text-amber-700 dark:text-amber-300">
        <strong>Annotated Mockup:</strong> This is a wireframe-style GUI prototype. Amber dots with dashed lines are annotations explaining each control's role in the program.
      </div>
    </div>
  );
}
