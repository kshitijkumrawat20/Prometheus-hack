import React, { useEffect, useRef, useState, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { forceCollide } from 'd3-force-3d';

const GraphView = ({ graphData, onNodeClick, activeNodeId }) => {
  const containerRef = useRef(null);
  const graphRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [layoutMode, setLayoutMode] = useState('lr'); // 'lr' (Left-Right Roadmap/Mind-Map), 'td' (Top-Down Flow), 'none' (Free Force)

  useEffect(() => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight
      });
    }

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure spacious D3 force simulation parameters
  useEffect(() => {
    if (graphRef.current) {
      if (layoutMode === 'none') {
        graphRef.current.d3Force('charge').strength(-450);
        graphRef.current.d3Force('charge').distanceMax(600);
      } else {
        graphRef.current.d3Force('charge').strength(-250);
      }

      if (graphRef.current.d3Force('link')) {
        graphRef.current.d3Force('link').distance(120);
      }

      graphRef.current.d3Force('collide', forceCollide(40));
    }
  }, [graphData, layoutMode]);

  // Recenter when active node changes or graph loads
  useEffect(() => {
    if (graphRef.current && activeNodeId && graphData?.nodes) {
      const activeNode = graphData.nodes.find(n => n.id === activeNodeId);
      if (activeNode && activeNode.x !== undefined) {
        graphRef.current.centerAt(activeNode.x, activeNode.y, 800);
        graphRef.current.zoom(1.3, 800);
      }
    }
  }, [activeNodeId, graphData]);

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoom(zoomLevel * 1.3, 400);
      setZoomLevel(prev => prev * 1.3);
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoom(zoomLevel / 1.3, 400);
      setZoomLevel(prev => prev / 1.3);
    }
  };

  const handleResetZoom = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(600, 50);
      setZoomLevel(1);
    }
  };

  // 5-Stage Color Palette
  const getStageColor = (stage, mastery) => {
    if (stage === 'MASTERED' || mastery >= 0.85) return '#10b981'; // Emerald Green
    if (stage === 'INDEPENDENT_PRACTICE') return '#f97316'; // Orange
    if (stage === 'GUIDED_PRACTICE') return '#eab308'; // Yellow
    if (stage === 'LEARNING') return '#3b82f6'; // Bright Blue
    return '#64748b'; // UNSEEN - Slate Grey
  };

  const getStageGlowColor = (stage, mastery) => {
    if (stage === 'MASTERED' || mastery >= 0.85) return 'rgba(16, 185, 129, 0.6)';
    if (stage === 'INDEPENDENT_PRACTICE') return 'rgba(249, 115, 22, 0.5)';
    if (stage === 'GUIDED_PRACTICE') return 'rgba(234, 179, 8, 0.5)';
    if (stage === 'LEARNING') return 'rgba(59, 130, 246, 0.5)';
    return 'rgba(100, 116, 139, 0.3)';
  };

  const drawNode = useCallback((node, ctx, globalScale) => {
    const isLocked = node.status === 'locked';
    const mastery = node.mastery || 0;
    const stage = node.stage || 'UNSEEN';
    const baseSize = 7 + mastery * 7;
    const size = isLocked ? 5 : baseSize;
    const color = isLocked ? '#475569' : getStageColor(stage, mastery);
    const isActive = node.id === activeNodeId;

    // Glowing Ring Outer Halo
    if (stage !== 'UNSEEN' || isActive) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * (isActive ? 1.9 : 1.4), 0, 2 * Math.PI, false);
      ctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.55)' : getStageGlowColor(stage, mastery);
      ctx.fill();
    }

    // Node body
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();

    // Node border
    ctx.strokeStyle = isActive ? '#ffffff' : (isLocked ? '#334155' : 'rgba(255, 255, 255, 0.25)');
    ctx.lineWidth = (isActive ? 2.5 : 1.2) / globalScale;
    ctx.stroke();

    // Label pill background & text
    const fontSize = Math.max(11 / globalScale, 4.2);
    ctx.font = `${isActive ? 'bold ' : '600 '}${fontSize}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    const stageLabel = stage === 'MASTERED' ? 'Mastered' : (stage === 'INDEPENDENT_PRACTICE' ? 'Practice' : (stage === 'GUIDED_PRACTICE' ? 'Guided' : (stage === 'LEARNING' ? 'Lesson' : 'Unseen')));
    const labelText = `${node.name} • ${stageLabel}`;
    const textWidth = ctx.measureText(labelText).width;
    const paddingX = 5 / globalScale;
    const paddingY = 2.5 / globalScale;
    
    // Glassy text badge
    ctx.fillStyle = isActive ? 'rgba(99, 102, 241, 0.9)' : 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(
      node.x - textWidth / 2 - paddingX,
      node.y + size + 5 / globalScale,
      textWidth + paddingX * 2,
      fontSize + paddingY * 2
    );

    ctx.fillStyle = isLocked ? '#94a3b8' : '#f8fafc';
    ctx.fillText(labelText, node.x, node.y + size + 6 / globalScale);
  }, [activeNodeId]);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-[#0b0f19]">
        <div className="animate-pulse text-text-muted flex items-center gap-3 font-mono text-sm">
          <svg className="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          Rendering Mind Map Canvas...
        </div>
      </div>
    );
  }

  const activeNode = graphData.nodes.find(n => n.id === activeNodeId);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#080b13] rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
      {/* HUD Top Bar: Legend & Layout Mode Switcher */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* HUD 5-Stage Legend */}
        <div className="glass-panel rounded-2xl p-2.5 px-4 flex items-center gap-3 text-xs shadow-xl backdrop-blur-xl border border-white/10 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-medium text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-[#64748b]"></span>Unseen</div>
          <div className="flex items-center gap-1.5 font-medium text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span>Learning</div>
          <div className="flex items-center gap-1.5 font-medium text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></span>Guided</div>
          <div className="flex items-center gap-1.5 font-medium text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]"></span>Practice</div>
          <div className="flex items-center gap-1.5 font-medium text-text-secondary"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>Mastered</div>
        </div>

        {/* Layout Switcher: Sequential Mind Map vs Top-Down vs Free */}
        <div className="glass-panel rounded-2xl p-1 flex items-center gap-1 text-xs border border-white/10 shadow-xl pointer-events-auto font-heading">
          <button
            onClick={() => setLayoutMode('lr')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              layoutMode === 'lr' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-text-muted hover:text-white'
            }`}
            title="Horizontal Sequential Mind Map Roadmap"
          >
            🗺️ Mind Map (Roadmap)
          </button>

          <button
            onClick={() => setLayoutMode('td')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              layoutMode === 'td' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-text-muted hover:text-white'
            }`}
            title="Vertical Flowchart"
          >
            ⬇️ Vertical Flow
          </button>

          <button
            onClick={() => setLayoutMode('none')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              layoutMode === 'none' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-text-muted hover:text-white'
            }`}
            title="Free Floating Graph"
          >
            🌐 Free Force
          </button>
        </div>
      </div>

      {/* HUD Zoom Controls */}
      <div className="absolute bottom-4 left-4 z-10 glass-panel rounded-2xl p-1.5 flex gap-1 border border-white/10 shadow-xl">
        <button onClick={handleZoomIn} title="Zoom In" className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
        <button onClick={handleZoomOut} title="Zoom Out" className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <button onClick={handleResetZoom} title="Recenter Graph" className="p-2 hover:bg-white/10 rounded-xl text-white transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
        </button>
      </div>

      {/* Active Node Info Drawer (Bottom Right) */}
      {activeNode && (
        <div className="absolute bottom-4 right-4 z-10 glass-panel rounded-2xl p-4 max-w-xs border border-white/10 shadow-2xl space-y-1.5 animate-slide-in">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400">
            Active Focus Concept
          </div>
          <div className="text-sm font-bold text-white font-heading">
            {activeNode.name}
          </div>
          <div className="text-xs text-text-muted flex justify-between items-center pt-1 border-t border-white/10">
            <span>Stage: <strong className="text-white">{activeNode.stage}</strong></span>
            <span>Mastery: <strong className="text-emerald-400">{Math.round((activeNode.mastery || 0) * 100)}%</strong></span>
          </div>
        </div>
      )}

      {/* Sequential Mind-Map Force Canvas */}
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        dagMode={layoutMode !== 'none' ? layoutMode : undefined}
        dagLevelDistance={layoutMode === 'lr' ? 180 : 130}
        nodeLabel={(node) => `${node.name}: ${node.stage || 'UNSEEN'} (${Math.round((node.mastery || 0) * 100)}% Mastery)`}
        nodeCanvasObject={drawNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={(link) => {
          const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
          const targetNode = typeof link.target === 'object' ? link.target : graphData.nodes.find(n => n.id === link.target);
          if (sourceNode && targetNode && (sourceNode.mastery > 0.8 || sourceNode.stage === 'MASTERED')) {
            return '#10b981';
          }
          return '#334155';
        }}
        linkWidth={(link) => {
          const sourceNode = typeof link.source === 'object' ? link.source : graphData.nodes.find(n => n.id === link.source);
          if (sourceNode && (sourceNode.mastery > 0.8 || sourceNode.stage === 'MASTERED')) return 2.5;
          return 1.4;
        }}
        linkCurvature={layoutMode === 'lr' ? 0.2 : 0.15}
        linkDirectionalArrowLength={5}
        linkDirectionalArrowRelPos={1}
        onNodeClick={onNodeClick}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        warmupTicks={150}
        cooldownTicks={150}
      />
    </div>
  );
};

export default GraphView;
