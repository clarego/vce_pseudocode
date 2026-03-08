import React, { useState, useEffect, useRef } from 'react';
import { GitBranch, Table2, ArrowRightLeft, Users, Loader2, RefreshCw, Download } from 'lucide-react';
import type {
  DesignTools as DesignToolsData,
  FlowchartNode,
  DataDictionaryRow,
  IpoChart,
  UcdActor,
  UcdUseCase,
  UcdRelationship,
} from '../utils/aiService';

type Tab = 'flowchart' | 'dataDictionary' | 'ipo' | 'ucd';

interface DesignToolsProps {
  data: DesignToolsData;
  isLoading: boolean;
  onRegenerate: () => void;
}

const TAB_CONFIG: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'flowchart', label: 'Flowchart', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'dataDictionary', label: 'Data Dictionary', icon: <Table2 className="w-4 h-4" /> },
  { id: 'ipo', label: 'IPO Chart', icon: <ArrowRightLeft className="w-4 h-4" /> },
  { id: 'ucd', label: 'Use Case Diagram', icon: <Users className="w-4 h-4" /> },
];

export const DesignTools: React.FC<DesignToolsProps> = ({ data, isLoading, onRegenerate }) => {
  const [activeTab, setActiveTab] = useState<Tab>('flowchart');

  return (
    <div className="mt-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h5 className="font-semibold text-gray-900 dark:text-white text-sm flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          VCAA Design Tools
        </h5>
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {isLoading ? 'Generating...' : 'Regenerate'}
        </button>
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

      <div className="p-4 overflow-auto max-h-[600px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 dark:text-gray-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
            <p className="text-sm">AI is generating your VCAA design tools...</p>
          </div>
        ) : (
          <>
            {activeTab === 'flowchart' && <FlowchartView nodes={data.flowchart} />}
            {activeTab === 'dataDictionary' && <DataDictionaryView rows={data.dataDictionary} />}
            {activeTab === 'ipo' && <IpoChartView chart={data.ipoChart} />}
            {activeTab === 'ucd' && <UcdView ucd={data.ucd} />}
          </>
        )}
      </div>
    </div>
  );
};

const SHAPE_H = 48;
const SHAPE_W = 180;
const COL_CENTER = 250;
const V_GAP = 64;
const DECISION_H = 56;
const BRANCH_INDENT = 200;

interface NodeLayout {
  node: FlowchartNode;
  x: number;
  y: number;
  w: number;
  h: number;
}

function buildFlowchartLayout(nodes: FlowchartNode[]): { layouts: NodeLayout[]; totalH: number } {
  const map = new Map(nodes.map(n => [n.id, n]));
  const visited = new Set<string>();
  const layouts: NodeLayout[] = [];
  let currentY = 40;

  const place = (id: string, x: number) => {
    if (!id || visited.has(id)) return;
    visited.add(id);
    const node = map.get(id);
    if (!node) return;

    const isDecision = node.type === 'decision';
    const h = isDecision ? DECISION_H : SHAPE_H;
    layouts.push({ node, x, y: currentY, w: SHAPE_W, h });
    currentY += h + V_GAP;

    if (isDecision) {
      if (node.yes) place(node.yes, x);
      if (node.no) place(node.no, x + BRANCH_INDENT);
    } else if (node.next) {
      place(node.next, x);
    }
  };

  if (nodes.length > 0) place(nodes[0].id, COL_CENTER - SHAPE_W / 2);
  return { layouts, totalH: currentY + 20 };
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
  const SVG_W = 600;

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
      <div className="overflow-x-auto">
        <svg
          width={SVG_W}
          height={totalH}
          viewBox={`0 0 ${SVG_W} ${totalH}`}
          className="text-gray-800 dark:text-gray-100 mx-auto"
        >
          {arrows}
          {layouts.map(layout => (
            <FlowchartShape key={layout.node.id} {...layout} />
          ))}
        </svg>
      </div>
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

const ACTOR_W = 80;
const ACTOR_H = 100;
const UC_W = 160;
const UC_H = 50;
const SYSTEM_PAD = 40;

interface UcdLayout {
  actors: (UcdActor & { x: number; y: number })[];
  useCases: (UcdUseCase & { x: number; y: number })[];
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

  const systemH = Math.max(ucCount * (UC_H + 30) + SYSTEM_PAD * 2, 200);
  const systemW = Math.max(UC_W + SYSTEM_PAD * 2 + 80, 260);

  const leftX = 50;
  const systemX = leftX + ACTOR_W + 60;
  const rightX = systemX + systemW + 60;
  const systemY = 60;
  const totalW = rightX + ACTOR_W + 60;

  const placeActors = (actors: UcdActor[], baseX: number) =>
    actors.map((a, i) => ({
      ...a,
      x: baseX,
      y: systemY + SYSTEM_PAD + i * (ACTOR_H + 20),
    }));

  const placedLeft = placeActors(leftActors, leftX);
  const placedRight = placeActors(rightActors, rightX);

  const placedUseCases = ucd.useCases.map((uc, i) => ({
    ...uc,
    x: systemX + SYSTEM_PAD + 20,
    y: systemY + SYSTEM_PAD + i * (UC_H + 28),
  }));

  const totalH = Math.max(
    systemY + systemH + 60,
    systemY + leftActors.length * (ACTOR_H + 20) + 60,
    systemY + rightActors.length * (ACTOR_H + 20) + 60
  );

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

function UcdView({ ucd }: { ucd: DesignToolsData['ucd'] }) {
  if (!ucd || !ucd.actors || !ucd.useCases) {
    return <div className="text-center text-gray-500 py-8">No use case diagram available.</div>;
  }

  const layout = layoutUcd(ucd);
  const actorMap = new Map(layout.actors.map(a => [a.id, a]));
  const ucMap = new Map(layout.useCases.map(u => [u.id, u]));

  const getCenter = (id: string): { x: number; y: number } | null => {
    const a = actorMap.get(id);
    if (a) return { x: a.x + ACTOR_W / 2, y: a.y + 16 };
    const u = ucMap.get(id);
    if (u) return { x: u.x + UC_W / 2, y: u.y + UC_H / 2 };
    return null;
  };

  const relationshipLines = ucd.relationships.map((rel, i) => {
    const from = getCenter(rel.from);
    const to = getCenter(rel.to);
    if (!from || !to) return null;

    if (rel.type === 'association') {
      return (
        <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400" />
      );
    }

    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const label = rel.type === 'include' ? '«include»' : rel.type === 'extend' ? '«extend»' : '';
    const arrowX = to.x;
    const arrowY = to.y;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;

    if (rel.type === 'generalization') {
      return (
        <g key={i}>
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="currentColor" strokeWidth="1.5" className="text-gray-600 dark:text-gray-400" />
          <polygon
            points={`${arrowX},${arrowY} ${arrowX - ux * 12 - uy * 7},${arrowY - uy * 12 + ux * 7} ${arrowX - ux * 12 + uy * 7},${arrowY - uy * 12 - ux * 7}`}
            fill="white" stroke="currentColor" strokeWidth="1.5" className="dark:fill-gray-900 text-gray-600 dark:text-gray-400"
          />
        </g>
      );
    }

    return (
      <g key={i}>
        <line x1={from.x} y1={from.y} x2={to.x} y2={to.y}
          stroke="currentColor" strokeWidth="1.5" strokeDasharray="6,3"
          className="text-gray-500 dark:text-gray-400" />
        <polygon
          points={`${arrowX},${arrowY} ${arrowX - ux * 10 - uy * 5},${arrowY - uy * 10 + ux * 5} ${arrowX - ux * 10 + uy * 5},${arrowY - uy * 10 - ux * 5}`}
          fill="currentColor" className="text-gray-500 dark:text-gray-400"
        />
        {label && (
          <text x={midX} y={midY - 5} textAnchor="middle" fontSize="10"
            fontStyle="italic" className="fill-gray-500 dark:fill-gray-400">{label}</text>
        )}
      </g>
    );
  });

  return (
    <div className="overflow-x-auto">
      <svg
        width={layout.totalW}
        height={layout.totalH}
        viewBox={`0 0 ${layout.totalW} ${layout.totalH}`}
        className="text-gray-800 dark:text-gray-100 mx-auto"
      >
        <rect
          x={layout.systemX} y={layout.systemY}
          width={layout.systemW} height={layout.systemH}
          fill="none" stroke="currentColor" strokeWidth="2"
          className="text-gray-600 dark:text-gray-400"
        />
        <text x={layout.systemX + layout.systemW / 2} y={layout.systemY - 10}
          textAnchor="middle" fontSize="13" fontWeight="bold"
          className="fill-gray-800 dark:fill-gray-100">
          {ucd.systemName}
        </text>

        {relationshipLines}

        {layout.actors.map(actor => {
          const cx = actor.x + ACTOR_W / 2;
          return (
            <g key={actor.id}>
              <circle cx={cx} cy={actor.y + 12} r={10}
                fill="none" stroke="currentColor" strokeWidth="1.5"
                className="text-gray-700 dark:text-gray-300" />
              <line x1={cx} y1={actor.y + 22} x2={cx} y2={actor.y + 48}
                stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
              <line x1={cx - 16} y1={actor.y + 34} x2={cx + 16} y2={actor.y + 34}
                stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
              <line x1={cx} y1={actor.y + 48} x2={cx - 12} y2={actor.y + 64}
                stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
              <line x1={cx} y1={actor.y + 48} x2={cx + 12} y2={actor.y + 64}
                stroke="currentColor" strokeWidth="1.5" className="text-gray-700 dark:text-gray-300" />
              <text x={cx} y={actor.y + 80} textAnchor="middle" fontSize="11" fontWeight="500"
                className="fill-gray-800 dark:fill-gray-100">{actor.name}</text>
            </g>
          );
        })}

        {layout.useCases.map(uc => (
          <g key={uc.id}>
            <ellipse
              cx={uc.x + UC_W / 2} cy={uc.y + UC_H / 2}
              rx={UC_W / 2} ry={UC_H / 2}
              className="fill-sky-50 dark:fill-sky-900/40 stroke-sky-400 dark:stroke-sky-600"
              strokeWidth="1.5"
            />
            <foreignObject x={uc.x + 8} y={uc.y + 8} width={UC_W - 16} height={UC_H - 16}>
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', fontSize: '11px', lineHeight: '1.2' }}
              >
                {uc.label}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}
