import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { Handle, Position, ReactFlow, ReactFlowProvider, useReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { hierarchy, tree } from 'd3-hierarchy';
import {
  TAXONOMY_TREE,
  getAnimalsForNode,
  getNodeById,
  getNodePath,
  getNodeStats,
  getSimpleTaxFilterForNode,
} from './taxonomy-tree';

const MYSTERY_PLACEHOLDER = '/icone_unknown/mystery_animal.png';
const STATUS_ORDER = ['catturato', 'avvistato', 'ricercato', 'misterioso'];

const normalizeStatus = (status) => {
  const s = String(status || '').toLowerCase().trim();
  if (['misterioso', 'locked', 'bloccato'].includes(s)) return 'misterioso';
  if (['avvistato', 'seen', 'visto'].includes(s)) return 'avvistato';
  if (['catturato', 'captured', 'fotografato'].includes(s)) return 'catturato';
  return 'ricercato';
};

const toArray = (value) => Array.isArray(value) ? value : (value ? [value] : []);
const animalCountries = (animal) => toArray(animal?.distribution?.countries_present || animal?.geo?.iso?.primary || animal?.geo?.iso || animal?.iso);
const resolveStatus = (animal, statusMap = {}, visitedCountries = []) => {
  const manual = normalizeStatus(statusMap?.[animal?.id] ?? animal?.status);
  if (manual === 'avvistato' || manual === 'catturato' || manual === 'misterioso') return manual;
  const visited = new Set((visitedCountries || []).map(c => String(c).toUpperCase()));
  if (!visited.size) return manual;
  const compatible = animalCountries(animal).some(code => visited.has(String(code).toUpperCase()));
  return compatible ? 'ricercato' : 'misterioso';
};

const getAnimalName = (animal) => animal?.com || animal?.com_en || animal?.sci || 'Animale';
const getAnimalImageUrl = (animal) => animal?.image_url || animal?.image || '';

const text = (theme, dark = '#f8f2e8') => (theme === 'light' ? '#171717' : dark);
const muted = (theme, dark = 'rgba(248,242,232,.62)') => (theme === 'light' ? 'rgba(0,0,0,.58)' : dark);
const panel = (theme) => (theme === 'light' ? 'rgba(255,252,245,.90)' : 'rgba(18,20,23,.78)');
const border = (theme) => (theme === 'light' ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.11)');

function ProgressRing({ value = 0, color = '#d9b86f', size = 44 }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `conic-gradient(${color} ${pct}%, rgba(255,255,255,.12) 0)`, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
      <div style={{ width: size - 9, height: size - 9, borderRadius: '50%', background: 'rgba(8,10,12,.86)', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 10, fontWeight: 1000 }}>{pct}%</div>
    </div>
  );
}

function TaxonomyNodeCard({ data }) {
  const { node, stats, selected, onOpen } = data;
  return (
    <button
      onClick={() => onOpen?.(node.id)}
      style={{
        width: 232,
        border: `1.5px solid ${node.color}`,
        borderRadius: 22,
        background: selected
          ? `linear-gradient(135deg, ${node.color}33, rgba(18,20,23,.96))`
          : 'linear-gradient(135deg, rgba(255,255,255,.10), rgba(16,18,22,.92))',
        color: '#fff',
        boxShadow: `0 18px 38px rgba(0,0,0,.22), 0 0 0 1px ${node.color}22 inset`,
        padding: 13,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ width: 34, height: 34, borderRadius: 13, background: `${node.color}22`, border: `1px solid ${node.color}88`, display: 'grid', placeItems: 'center', fontSize: 17 }}>✦</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 1000, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.label}</div>
          <div style={{ marginTop: 2, color: 'rgba(255,255,255,.56)', fontSize: 9.5, fontWeight: 850, textTransform: 'uppercase' }}>{node.rank} · {stats.total} specie</div>
        </div>
        <ProgressRing value={stats.completion} color={node.color} size={38} />
      </div>
      {node.subtitle && <div style={{ marginTop: 8, color: 'rgba(255,255,255,.64)', fontSize: 10.5, lineHeight: 1.35, minHeight: 28 }}>{node.subtitle}</div>}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </button>
  );
}

const nodeTypes = { taxonomy: TaxonomyNodeCard };

function buildFlow(node, animals, onOpen) {
  const flowRoot = {
    id: node.id,
    node,
    children: node.children || [],
  };
  const root = hierarchy(flowRoot, d => d.children?.map(child => ({ id: child.id, node: child, children: [] })));
  const layout = tree().nodeSize([260, 190]);
  layout(root);
  const nodes = root.descendants().map(d => ({
    id: d.data.node.id,
    type: 'taxonomy',
    position: { x: d.x, y: d.y },
    data: {
      node: d.data.node,
      stats: getNodeStats(d.data.node, animals),
      selected: d.data.node.id === node.id,
      onOpen,
    },
    draggable: false,
  }));
  const edges = root.links().map(link => ({
    id: `${link.source.data.node.id}-${link.target.data.node.id}`,
    source: link.source.data.node.id,
    target: link.target.data.node.id,
    type: 'smoothstep',
    style: { stroke: link.target.data.node.color, strokeWidth: 2, opacity: 0.55 },
  }));
  return { nodes, edges };
}

function TaxonomyFlow({ selectedNode, animals, onOpen }) {
  const { fitView } = useReactFlow();
  const flow = useMemo(() => buildFlow(selectedNode, animals, onOpen), [selectedNode, animals, onOpen]);
  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 420 }), 40);
    return () => clearTimeout(t);
  }, [fitView, selectedNode.id]);

  return (
    <div style={{ height: 330, borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(255,255,255,.10)', background: 'radial-gradient(circle at 50% 0%, rgba(217,184,111,.14), transparent 42%), rgba(4,7,9,.42)' }}>
      <ReactFlow
        nodes={flow.nodes}
        edges={flow.edges}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.38}
        maxZoom={1.35}
        panOnDrag
        zoomOnPinch
        zoomOnScroll={false}
        nodesDraggable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

function Breadcrumb({ path, onOpen, theme }) {
  return (
    <div style={{ display: 'flex', overflowX: 'auto', gap: 7, paddingBottom: 4 }}>
      {path.map((node, index) => (
        <React.Fragment key={node.id}>
          <button onClick={() => onOpen(node.id)} style={{ border: 'none', borderRadius: 999, padding: '7px 10px', background: index === path.length - 1 ? `${node.color}24` : 'transparent', color: index === path.length - 1 ? text(theme) : node.color, fontSize: 11, fontWeight: 950, whiteSpace: 'nowrap', fontFamily: 'inherit' }}>{node.label}</button>
          {index < path.length - 1 && <span style={{ alignSelf: 'center', color: muted(theme), fontSize: 13 }}>›</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function StatChip({ label, value, theme }) {
  return (
    <div style={{ borderRadius: 16, background: theme === 'light' ? 'rgba(0,0,0,.045)' : 'rgba(255,255,255,.065)', border: `1px solid ${border(theme)}`, padding: 11 }}>
      <div style={{ color: muted(theme), fontSize: 10, fontWeight: 900, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ color: text(theme), fontSize: 13, fontWeight: 1000, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function Hero({ node, stats, theme }) {
  return (
    <div style={{ borderRadius: 30, padding: 18, background: `radial-gradient(circle at 92% 8%, ${node.color}33, transparent 38%), ${panel(theme)}`, border: `1.5px solid ${node.color}66`, boxShadow: theme === 'light' ? '0 18px 44px rgba(0,0,0,.10)' : '0 20px 52px rgba(0,0,0,.32)' }}>
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: node.color, fontSize: 10.5, fontWeight: 1000, letterSpacing: .8, textTransform: 'uppercase' }}>{node.rank} · {node.kind}</div>
          <h1 style={{ margin: '5px 0 0', color: text(theme), fontSize: 29, lineHeight: 1.02, letterSpacing: 0 }}>{node.label}</h1>
          <p style={{ margin: '8px 0 0', color: muted(theme), fontSize: 12.5, lineHeight: 1.45 }}>{node.subtitle || 'Questo ramo e presente nell’albero tassonomico Animaldex.'}</p>
        </div>
        <ProgressRing value={stats.completion} color={node.color} size={68} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, marginTop: 15 }}>
        <StatChip label="Catturati" value={`${stats.captured}/${stats.total}`} theme={theme} />
        <StatChip label="Rarità" value={stats.dominantRarity} theme={theme} />
        <StatChip label="Critico" value={stats.criticalConservation} theme={theme} />
      </div>
      <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: theme === 'light' ? 'rgba(0,0,0,.09)' : 'rgba(255,255,255,.09)', marginTop: 14 }}>
        <div style={{ width: `${stats.completion}%`, height: '100%', background: `linear-gradient(90deg, ${node.color}, #f2dca3)`, borderRadius: 999 }} />
      </div>
    </div>
  );
}

function ChildrenGrid({ node, animals, onOpen, theme }) {
  const children = useMemo(() => [...(node.children || [])].sort((a, b) => {
    const ca = getAnimalsForNode(a, animals).length;
    const cb = getAnimalsForNode(b, animals).length;
    if (!!cb !== !!ca) return cb - ca;
    return 0;
  }), [node, animals]);
  if (!children.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 10 }}>
      {children.map(child => {
        const stats = getNodeStats(child, animals);
        return (
          <button key={child.id} onClick={() => onOpen(child.id)} style={{ minHeight: 132, borderRadius: 22, padding: 13, background: panel(theme), border: `1.4px solid ${child.color}70`, color: text(theme), textAlign: 'left', fontFamily: 'inherit', cursor: 'pointer', boxShadow: theme === 'light' ? '0 10px 22px rgba(0,0,0,.07)' : '0 14px 30px rgba(0,0,0,.18)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ color: child.color, fontSize: 9.5, fontWeight: 1000, textTransform: 'uppercase' }}>{child.rank}</div>
              <ProgressRing value={stats.completion} color={child.color} size={34} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 1000, lineHeight: 1.15, marginTop: 7 }}>{child.label}</div>
            <div style={{ color: muted(theme), fontSize: 10.5, lineHeight: 1.35, marginTop: 5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{child.subtitle || 'Ramo Animaldex'}</div>
            <div style={{ marginTop: 9, color: child.color, fontSize: 11, fontWeight: 950 }}>{stats.total} specie · {stats.captured}/{stats.total} catturate</div>
          </button>
        );
      })}
    </div>
  );
}

function AnimalMiniCard({ animal, onOpen, theme }) {
  const status = normalizeStatus(animal.status);
  const mystery = status === 'misterioso';
  const image = mystery ? MYSTERY_PLACEHOLDER : getAnimalImageUrl(animal);
  return (
    <button onClick={() => onOpen?.(animal)} style={{ width: 138, flex: '0 0 138px', borderRadius: 20, overflow: 'hidden', border: `1px solid ${mystery ? 'rgba(255,255,255,.12)' : 'rgba(217,184,111,.34)'}`, background: theme === 'light' ? '#fbf7ef' : 'rgba(16,18,22,.86)', color: text(theme), fontFamily: 'inherit', padding: 0, textAlign: 'left', cursor: 'pointer' }}>
      <div style={{ height: 94, display: 'grid', placeItems: 'center', background: theme === 'light' ? 'rgba(0,0,0,.045)' : 'rgba(255,255,255,.045)', overflow: 'hidden' }}>
        {image ? <img src={image} alt={mystery ? 'misterioso' : getAnimalName(animal)} style={{ width: '100%', height: '100%', objectFit: mystery ? 'contain' : 'contain', padding: mystery ? 14 : 5, boxSizing: 'border-box', opacity: mystery ? .72 : 1 }} /> : <span style={{ fontSize: 28 }}>?</span>}
      </div>
      <div style={{ padding: 10 }}>
        <div style={{ fontSize: 11.5, fontWeight: 1000, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getAnimalName(animal)}</div>
        <div style={{ color: muted(theme), fontSize: 9.5, fontWeight: 800, marginTop: 4 }}>{animal.rarity || 'Rarità'} · {status}</div>
      </div>
    </button>
  );
}

function AnimalStrip({ animals, onOpenAnimal, theme }) {
  if (!animals.length) {
    return <div style={{ borderRadius: 22, padding: 18, background: panel(theme), border: `1px solid ${border(theme)}`, color: muted(theme), fontSize: 12.5, fontWeight: 800 }}>Questo ramo è presente nell’albero tassonomico, ma non ha ancora animali nella collezione.</div>;
  }
  const sorted = [...animals].sort((a, b) => STATUS_ORDER.indexOf(normalizeStatus(a.status)) - STATUS_ORDER.indexOf(normalizeStatus(b.status)));
  return (
    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
      {sorted.slice(0, 24).map(animal => <AnimalMiniCard key={animal.id || animal.sci} animal={animal} onOpen={onOpenAnimal} theme={theme} />)}
    </div>
  );
}

function StatsPanel({ stats, theme }) {
  const name = (animal) => animal ? getAnimalName(animal) : 'Dato non disponibile';
  return (
    <div style={{ display: 'grid', gap: 9 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 9 }}>
        <StatChip label="Avvistati" value={stats.seen} theme={theme} />
        <StatChip label="Ricercati" value={stats.searched} theme={theme} />
        <StatChip label="Misteriosi" value={stats.mystery} theme={theme} />
        <StatChip label="Ramo più ricco" value={stats.mostPopulatedChild?.child?.label || 'Dato non disponibile'} theme={theme} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 9 }}>
        <StatChip label="Più grande" value={name(stats.largestAnimal)} theme={theme} />
        <StatChip label="Più pesante" value={name(stats.heaviestAnimal)} theme={theme} />
        <StatChip label="Più minacciato" value={name(stats.mostThreatenedAnimal)} theme={theme} />
      </div>
    </div>
  );
}

function TaxonomyExplorerInner({
  animals = [],
  statusMap = {},
  visitedCountries = [],
  onBack,
  onOpenAnimal,
  onFilterGrid,
  theme = 'dark',
}) {
  const [selectedId, setSelectedId] = useState('animalia');
  const [viewMode, setViewMode] = useState('tree');
  const selectedNode = getNodeById(selectedId) || TAXONOMY_TREE;
  const path = getNodePath(selectedNode.id);
  const animalsWithStatus = useMemo(() => animals.map(a => ({ ...a, status: resolveStatus(a, statusMap, visitedCountries) })), [animals, statusMap, visitedCountries]);
  const linkedAnimals = useMemo(() => getAnimalsForNode(selectedNode, animalsWithStatus), [selectedNode, animalsWithStatus]);
  const stats = useMemo(() => getNodeStats(selectedNode, animalsWithStatus), [selectedNode, animalsWithStatus]);
  const isLight = theme === 'light';

  const openNode = useCallback((id) => {
    setSelectedId(id);
    setViewMode('tree');
  }, []);

  const filterGrid = () => {
    const tax = getSimpleTaxFilterForNode(selectedNode);
    onFilterGrid?.({
      node: selectedNode,
      tax,
      animalIds: linkedAnimals.map(a => a.id),
    });
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: isLight ? '#F3EFE6' : 'radial-gradient(circle at 50% -10%, rgba(63,183,166,.18), transparent 34%), linear-gradient(180deg,#0d1113,#07090b)', overflow: 'hidden' }}>
      <div style={{ padding: '10px 14px 8px', borderBottom: `1px solid ${border(theme)}`, background: isLight ? 'rgba(243,239,230,.94)' : 'rgba(8,10,12,.82)', backdropFilter: 'blur(14px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} aria-label="Torna al menu" style={{ width: 42, height: 42, borderRadius: 14, border: `1px solid ${border(theme)}`, background: panel(theme), color: text(theme), fontSize: 22, fontWeight: 900 }}>‹</button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ color: text(theme), fontSize: 18, fontWeight: 1000 }}>Albero della Vita</div>
            <div style={{ color: muted(theme), fontSize: 11.5, marginTop: 2 }}>Esplora i grandi rami del regno animale e scopri dove si collocano le specie del tuo Animaldex.</div>
          </div>
        </div>
        <div style={{ marginTop: 10 }}><Breadcrumb path={path} onOpen={openNode} theme={theme} /></div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 14 }}>
        <Hero node={selectedNode} stats={stats} theme={theme} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 9, margin: '12px 0' }}>
          <button onClick={() => setViewMode('animals')} style={actionStyle(theme, viewMode === 'animals')}>Vedi animali</button>
          <button onClick={filterGrid} style={actionStyle(theme, false)}>Filtra in grid</button>
          <button onClick={() => setViewMode('stats')} style={actionStyle(theme, viewMode === 'stats')}>Statistiche</button>
        </div>

        {path.length > 1 && (
          <button onClick={() => openNode(path[path.length - 2].id)} style={{ width: '100%', minHeight: 42, borderRadius: 16, border: `1px solid ${border(theme)}`, background: panel(theme), color: text(theme), fontSize: 12, fontWeight: 950, fontFamily: 'inherit', marginBottom: 12 }}>Torna al ramo precedente</button>
        )}

        <div style={{ display: 'grid', gap: 15 }}>
          {viewMode === 'tree' && (
            <>
              <TaxonomyFlow selectedNode={selectedNode} animals={animalsWithStatus} onOpen={openNode} />
              <ChildrenGrid node={selectedNode} animals={animalsWithStatus} onOpen={openNode} theme={theme} />
            </>
          )}
          {viewMode === 'animals' && <AnimalStrip animals={linkedAnimals} onOpenAnimal={onOpenAnimal} theme={theme} />}
          {viewMode === 'stats' && <StatsPanel stats={stats} theme={theme} />}

          {viewMode === 'tree' && (
            <>
              <div style={{ color: text(theme), fontSize: 15, fontWeight: 1000, marginTop: 2 }}>Animali collegati</div>
              <AnimalStrip animals={linkedAnimals} onOpenAnimal={onOpenAnimal} theme={theme} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function actionStyle(theme, active) {
  return {
    minHeight: 46,
    borderRadius: 16,
    border: `1px solid ${active ? '#d9b86f' : border(theme)}`,
    background: active ? 'linear-gradient(135deg,#d9b86f,#b8664d)' : panel(theme),
    color: active ? '#17120b' : text(theme),
    fontSize: 11.5,
    fontWeight: 1000,
    fontFamily: 'inherit',
    padding: '0 8px',
  };
}

export default function TaxonomyExplorer(props) {
  return (
    <ReactFlowProvider>
      <TaxonomyExplorerInner {...props} />
    </ReactFlowProvider>
  );
}
