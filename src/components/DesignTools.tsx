import React, { useState } from 'react';
import { GitBranch, Table2, ArrowRightLeft, Users, Loader2, RefreshCw, Network } from 'lucide-react';
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
} from '../utils/aiService';

type Tab = 'flowchart' | 'dataDictionary' | 'ipo' | 'ucd' | 'dfd';

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
  { id: 'dfd', label: 'Data Flow Diagram', icon: <Network className="w-4 h-4" /> },
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
            {activeTab === 'dfd' && <DfdView levels={data.dfd} />}
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
const ACTOR_BODY_TOP = 22;
const ACTOR_BODY_MID = 35;
const ACTOR_BODY_BOT = 50;
const ACTOR_LEGS_BOT = 66;
const ACTOR_LABEL_Y = 82;
const ACTOR_TOTAL_H = 94;
const UC_W = 170;
const UC_H = 52;
const UC_COL_GAP = 24;
const SYSTEM_PAD_X = 36;
const SYSTEM_PAD_Y = 48;
const SYSTEM_TITLE_H = 28;

interface UcdLayout {
  actors: (UcdActor & { cx: number; cy: number })[];
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

  const ucCols = ucCount <= 3 ? 1 : ucCount <= 6 ? 2 : 3;
  const ucRows = Math.ceil(ucCount / ucCols);

  const innerW = ucCols * UC_W + (ucCols - 1) * UC_COL_GAP;
  const innerH = ucRows * UC_H + (ucRows - 1) * UC_COL_GAP;
  const systemW = innerW + SYSTEM_PAD_X * 2;
  const systemH = innerH + SYSTEM_PAD_Y * 2 + SYSTEM_TITLE_H;

  const maxLeftH = Math.max(leftActors.length * (ACTOR_TOTAL_H + 16), systemH);
  const maxRightH = Math.max(rightActors.length * (ACTOR_TOTAL_H + 16), systemH);
  const totalH = Math.max(maxLeftH, maxRightH, systemH) + 80;

  const systemY = (totalH - systemH) / 2;
  const systemX = 80 + ACTOR_W / 2 + 50;
  const rightX = systemX + systemW + 50;
  const totalW = rightX + ACTOR_W + 80;

  const placeActors = (actors: UcdActor[], baseX: number) => {
    const totalGroupH = actors.length * ACTOR_TOTAL_H + (actors.length - 1) * 16;
    const startY = (totalH - totalGroupH) / 2;
    return actors.map((a, i) => ({
      ...a,
      cx: baseX,
      cy: startY + i * (ACTOR_TOTAL_H + 16) + 12,
    }));
  };

  const placedLeft = placeActors(leftActors, 80 + ACTOR_W / 2);
  const placedRight = placeActors(rightActors, rightX + ACTOR_W / 2);

  const ucStartX = systemX + SYSTEM_PAD_X;
  const ucStartY = systemY + SYSTEM_TITLE_H + SYSTEM_PAD_Y;

  const placedUseCases = ucd.useCases.map((uc, i) => {
    const col = i % ucCols;
    const row = Math.floor(i / ucCols);
    return {
      ...uc,
      cx: ucStartX + col * (UC_W + UC_COL_GAP) + UC_W / 2,
      cy: ucStartY + row * (UC_H + UC_COL_GAP) + UC_H / 2,
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

function UcdView({ ucd }: { ucd: DesignToolsData['ucd'] }) {
  if (!ucd || !ucd.actors || !ucd.useCases) {
    return <div className="text-center text-gray-500 py-8">No use case diagram available.</div>;
  }

  const layout = layoutUcd(ucd);
  const actorMap = new Map(layout.actors.map(a => [a.id, a]));
  const ucMap = new Map(layout.useCases.map(u => [u.id, u]));

  const getCenter = (id: string): { x: number; y: number; isActor: boolean } | null => {
    const a = actorMap.get(id);
    if (a) return { x: a.cx, y: a.cy + ACTOR_BODY_MID, isActor: true };
    const u = ucMap.get(id);
    if (u) return { x: u.cx, y: u.cy, isActor: false };
    return null;
  };

  const getEdgePoint = (center: { x: number; y: number; isActor: boolean }, toward: { x: number; y: number }): { x: number; y: number } => {
    const dx = toward.x - center.x;
    const dy = toward.y - center.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    if (center.isActor) {
      return { x: center.x + ux * 10, y: center.y + uy * 10 };
    }
    const rx = UC_W / 2, ry = UC_H / 2;
    const t = Math.min(Math.abs(rx / (ux || 0.001)), Math.abs(ry / (uy || 0.001)));
    return { x: center.x + ux * t, y: center.y + uy * t };
  };

  const DARK_STROKE = '#6b7280';

  const relationshipLines = ucd.relationships.map((rel, i) => {
    const fromC = getCenter(rel.from);
    const toC = getCenter(rel.to);
    if (!fromC || !toC) return null;

    const fromPt = getEdgePoint(fromC, toC);
    const toPt = getEdgePoint(toC, fromC);

    const dx = toPt.x - fromPt.x;
    const dy = toPt.y - fromPt.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const midX = (fromPt.x + toPt.x) / 2;
    const midY = (fromPt.y + toPt.y) / 2;

    if (rel.type === 'association') {
      return (
        <line key={i}
          x1={fromPt.x} y1={fromPt.y} x2={toPt.x} y2={toPt.y}
          stroke={DARK_STROKE} strokeWidth="1.5" />
      );
    }

    if (rel.type === 'generalization') {
      const ax = toPt.x, ay = toPt.y;
      const triSize = 13;
      return (
        <g key={i}>
          <line x1={fromPt.x} y1={fromPt.y} x2={toPt.x} y2={toPt.y}
            stroke={DARK_STROKE} strokeWidth="1.5" />
          <polygon
            points={`${ax},${ay} ${ax - ux * triSize - uy * 7},${ay - uy * triSize + ux * 7} ${ax - ux * triSize + uy * 7},${ay - uy * triSize - ux * 7}`}
            fill="white" stroke={DARK_STROKE} strokeWidth="1.5"
          />
        </g>
      );
    }

    const label = rel.type === 'include' ? '«include»' : rel.type === 'extend' ? '«extend»' : '';
    const arrowTipX = toPt.x, arrowTipY = toPt.y;
    const arrowSize = 10;

    return (
      <g key={i}>
        <line x1={fromPt.x} y1={fromPt.y} x2={arrowTipX - ux * arrowSize} y2={arrowTipY - uy * arrowSize}
          stroke={DARK_STROKE} strokeWidth="1.5" strokeDasharray="6,3" />
        <polygon
          points={`${arrowTipX},${arrowTipY} ${arrowTipX - ux * arrowSize - uy * 5},${arrowTipY - uy * arrowSize + ux * 5} ${arrowTipX - ux * arrowSize + uy * 5},${arrowTipY - uy * arrowSize - ux * 5}`}
          fill="white" stroke={DARK_STROKE} strokeWidth="1.5"
        />
        {label && (
          <text x={midX} y={midY - 6}
            textAnchor="middle" fontSize="10" fontStyle="italic"
            fill={DARK_STROKE}>{label}</text>
        )}
      </g>
    );
  });

  const legend = [
    {
      el: (
        <svg width="30" height="16" viewBox="0 0 30 16">
          <line x1="0" y1="8" x2="30" y2="8" stroke="#6b7280" strokeWidth="1.5" />
        </svg>
      ),
      label: 'Association',
    },
    {
      el: (
        <svg width="40" height="16" viewBox="0 0 40 16">
          <line x1="0" y1="8" x2="26" y2="8" stroke="#6b7280" strokeWidth="1.5" strokeDasharray="4,2" />
          <polygon points="40,8 27,3 27,13" fill="white" stroke="#6b7280" strokeWidth="1.5" />
        </svg>
      ),
      label: '«include» / «extend»',
    },
    {
      el: (
        <svg width="40" height="16" viewBox="0 0 40 16">
          <line x1="0" y1="8" x2="26" y2="8" stroke="#6b7280" strokeWidth="1.5" />
          <polygon points="40,8 27,3 27,13" fill="white" stroke="#6b7280" strokeWidth="1.5" />
        </svg>
      ),
      label: 'Generalization',
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs">
        {legend.map((l, i) => (
          <div key={i} className="flex items-center gap-2">
            {l.el}
            <span className="text-gray-600 dark:text-gray-400">{l.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2 ml-4 text-gray-500 dark:text-gray-400 italic">
          «include»: base→included (mandatory) &nbsp;|&nbsp; «extend»: extension→base (optional)
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={layout.totalW}
          height={layout.totalH}
          viewBox={`0 0 ${layout.totalW} ${layout.totalH}`}
          className="mx-auto"
        >
          <rect
            x={layout.systemX} y={layout.systemY}
            width={layout.systemW} height={layout.systemH}
            fill="none" stroke="#9ca3af" strokeWidth="2"
          />
          <text
            x={layout.systemX + layout.systemW / 2}
            y={layout.systemY + 18}
            textAnchor="middle" fontSize="13" fontWeight="bold"
            fill="#111827" className="dark:fill-gray-100"
          >
            {ucd.systemName}
          </text>
          <line
            x1={layout.systemX} y1={layout.systemY + SYSTEM_TITLE_H}
            x2={layout.systemX + layout.systemW} y2={layout.systemY + SYSTEM_TITLE_H}
            stroke="#d1d5db" strokeWidth="1"
          />

          {relationshipLines}

          {layout.actors.map(actor => {
            const cx = actor.cx;
            const top = actor.cy;
            return (
              <g key={actor.id}>
                <circle cx={cx} cy={top} r={10}
                  fill="none" stroke="#374151" strokeWidth="1.5"
                  className="dark:stroke-gray-300" />
                <line x1={cx} y1={top + ACTOR_BODY_TOP} x2={cx} y2={top + ACTOR_BODY_BOT}
                  stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
                <line x1={cx - 16} y1={top + ACTOR_BODY_MID} x2={cx + 16} y2={top + ACTOR_BODY_MID}
                  stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
                <line x1={cx} y1={top + ACTOR_BODY_BOT} x2={cx - 13} y2={top + ACTOR_LEGS_BOT}
                  stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
                <line x1={cx} y1={top + ACTOR_BODY_BOT} x2={cx + 13} y2={top + ACTOR_LEGS_BOT}
                  stroke="#374151" strokeWidth="1.5" className="dark:stroke-gray-300" />
                <text x={cx} y={top + ACTOR_LABEL_Y}
                  textAnchor="middle" fontSize="11" fontWeight="500"
                  fill="#111827" className="dark:fill-gray-100">
                  {actor.name}
                </text>
              </g>
            );
          })}

          {layout.useCases.map(uc => (
            <g key={uc.id}>
              <ellipse
                cx={uc.cx} cy={uc.cy}
                rx={UC_W / 2} ry={UC_H / 2}
                fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5"
                className="dark:fill-sky-900/50 dark:stroke-sky-500"
              />
              <foreignObject
                x={uc.cx - UC_W / 2 + 8} y={uc.cy - UC_H / 2 + 4}
                width={UC_W - 16} height={UC_H - 8}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', fontSize: '11px', lineHeight: '1.3', color: '#0c4a6e' }}>
                  {uc.label}
                </div>
              </foreignObject>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const DFD_LEVEL_COLORS: Record<number, { bg: string; border: string; label: string }> = {
  0: { bg: 'bg-slate-50 dark:bg-slate-900', border: 'border-slate-300 dark:border-slate-600', label: 'Context Diagram (Level 0)' },
  1: { bg: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-200 dark:border-blue-700', label: 'Level 1 DFD' },
  2: { bg: 'bg-teal-50 dark:bg-teal-950', border: 'border-teal-200 dark:border-teal-700', label: 'Level 2 DFD' },
};

const EE_W = 100;
const EE_H = 44;
const PROC_R = 38;
const DS_W = 130;
const DS_H = 36;
const DFD_PAD = 60;

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
  const svgW = Math.max(700, (procs.length + 1) * 180 + 160);

  const procSpacing = (svgW - 200) / Math.max(procs.length, 1);
  procs.forEach((p, i) => {
    nodes.push({ el: p, x: 100 + i * procSpacing + procSpacing / 2, y: 160 });
  });

  const eeSide = Math.ceil(ees.length / 2);
  ees.forEach((e, i) => {
    const side = i < eeSide ? 'left' : 'right';
    const idx = side === 'left' ? i : i - eeSide;
    const y = DFD_PAD + idx * (EE_H + 40) + (EE_H + 40) / 2;
    nodes.push({ el: e, x: side === 'left' ? DFD_PAD + EE_W / 2 : svgW - DFD_PAD - EE_W / 2, y });
  });

  dss.forEach((d, i) => {
    const x = 100 + i * (DS_W + 40) + DS_W / 2;
    nodes.push({ el: d, x, y: 320 });
  });

  const allY = nodes.map(n => n.y);
  const svgH = Math.max(420, Math.max(...allY) + 120);
  return { nodes, svgW, svgH };
}

function getNodeCenter(nodes: DfdNodePos[], id: string): { x: number; y: number } | null {
  const n = nodes.find(n => n.el.id === id);
  if (!n) return null;
  return { x: n.x, y: n.y };
}

function DfdSingleLevel({ level }: { level: DfdLevel }) {
  const { nodes, svgW, svgH } = computeDfdLayout(level);
  const colors = DFD_LEVEL_COLORS[level.level] ?? DFD_LEVEL_COLORS[1];

  const arrowMarker = `marker-${level.level}`;

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
            <line x1="0" y1="6" x2="22" y2="6" stroke="currentColor" strokeWidth="1.5" className="text-gray-500 dark:text-gray-400" />
            <polygon points="30,6 20,2 20,10" fill="currentColor" className="text-gray-500 dark:text-gray-400" />
          </svg>
          <span className="text-gray-600 dark:text-gray-400">Data Flow</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="mx-auto">
          <defs>
            <marker id={arrowMarker} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
            </marker>
          </defs>

          {level.flows.map((flow, fi) => {
            const from = getNodeCenter(nodes, flow.from);
            const to = getNodeCenter(nodes, flow.to);
            if (!from || !to) return null;
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / len, uy = dy / len;

            const fEl = level.elements.find(e => e.id === flow.from);
            const tEl = level.elements.find(e => e.id === flow.to);
            const fromR = fEl?.type === 'process' ? PROC_R : fEl?.type === 'data_store' ? DS_H / 2 : EE_H / 2;
            const toR = tEl?.type === 'process' ? PROC_R : tEl?.type === 'data_store' ? DS_H / 2 : EE_H / 2;

            const x1 = from.x + ux * fromR;
            const y1 = from.y + uy * fromR;
            const x2 = to.x - ux * (toR + 10);
            const y2 = to.y - uy * (toR + 10);
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key={fi}>
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#6b7280" strokeWidth="1.5"
                  markerEnd={`url(#${arrowMarker})`} />
                <rect x={midX - flow.label.length * 3} y={midY - 10}
                  width={flow.label.length * 6 + 4} height={16}
                  rx="3" fill="white" fillOpacity="0.9" className="dark:fill-gray-900" />
                <text x={midX} y={midY + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="9" fontFamily="monospace"
                  fill="#374151" className="dark:fill-gray-300">
                  {flow.label}
                </text>
              </g>
            );
          })}

          {nodes.map(({ el, x, y }) => {
            if (el.type === 'external_entity') {
              return (
                <g key={el.id}>
                  <rect x={x - EE_W / 2} y={y - EE_H / 2} width={EE_W} height={EE_H}
                    fill="white" stroke="#6b7280" strokeWidth="1.5" rx="2"
                    className="dark:fill-gray-800 dark:stroke-gray-400" />
                  <text x={x} y={y} textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="500" fill="#111827"
                    className="dark:fill-gray-100">
                    {el.label}
                  </text>
                </g>
              );
            }
            if (el.type === 'process') {
              return (
                <g key={el.id}>
                  <circle cx={x} cy={y} r={PROC_R}
                    fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5"
                    className="dark:fill-sky-900 dark:stroke-sky-500" />
                  <foreignObject x={x - PROC_R + 4} y={y - PROC_R + 4}
                    width={(PROC_R - 4) * 2} height={(PROC_R - 4) * 2}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', fontSize: '10px', lineHeight: '1.2', color: '#0c4a6e' }}>
                      {el.label}
                    </div>
                  </foreignObject>
                </g>
              );
            }
            if (el.type === 'data_store') {
              const left = x - DS_W / 2;
              const top = y - DS_H / 2;
              return (
                <g key={el.id}>
                  <line x1={left} y1={top} x2={left + DS_W} y2={top}
                    stroke="#d97706" strokeWidth="1.5" />
                  <line x1={left} y1={top + DS_H} x2={left + DS_W} y2={top + DS_H}
                    stroke="#d97706" strokeWidth="1.5" />
                  <rect x={left} y={top} width={DS_W} height={DS_H}
                    fill="#fffbeb" fillOpacity="0.8" stroke="none"
                    className="dark:fill-amber-950" />
                  <line x1={left + 24} y1={top} x2={left + 24} y2={top + DS_H}
                    stroke="#d97706" strokeWidth="1.5" />
                  <text x={left + 24 + (DS_W - 24) / 2} y={y}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="10" fill="#92400e" className="dark:fill-amber-200">
                    {el.label}
                  </text>
                </g>
              );
            }
            return null;
          })}
        </svg>
      </div>
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
