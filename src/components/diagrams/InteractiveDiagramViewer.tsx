import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import { SVGRenderer } from './SVGRenderer';
import { CanvasRenderer } from './CanvasRenderer';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

interface InteractiveDiagramViewerProps {
  className?: string;
}

export function InteractiveDiagramViewer({ className = '' }: InteractiveDiagramViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { config, currentDiagram, viewport, setViewport, resetViewport } = useDiagramStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartViewport, setDragStartViewport] = useState({ translateX: 0, translateY: 0 });

  // Zoom settings
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.1;
  const ZOOM_WHEEL_SENSITIVITY = 0.001;

  // Zoom functions
  const zoomIn = useCallback(() => {
    const newScale = Math.min(viewport.scale + ZOOM_STEP, MAX_ZOOM);
    setViewport({ scale: newScale });
  }, [viewport.scale, setViewport]);

  const zoomOut = useCallback(() => {
    const newScale = Math.max(viewport.scale - ZOOM_STEP, MIN_ZOOM);
    setViewport({ scale: newScale });
  }, [viewport.scale, setViewport]);

  const zoomToFit = useCallback(() => {
    if (!currentDiagram || !containerRef.current) return;

    // Calculate bounds of all nodes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    currentDiagram.nodes.forEach(node => {
      minX = Math.min(minX, node.x);
      minY = Math.min(minY, node.y);
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });

    if (minX === Infinity) return; // No nodes

    const diagramWidth = maxX - minX;
    const diagramHeight = maxY - minY;
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Add padding
    const padding = 50;
    const scaleX = (containerRect.width - padding * 2) / diagramWidth;
    const scaleY = (containerRect.height - padding * 2) / diagramHeight;
    const scale = Math.min(scaleX, scaleY, MAX_ZOOM);
    
    // Center the diagram
    const centerX = (containerRect.width / 2) - ((minX + diagramWidth / 2) * scale);
    const centerY = (containerRect.height / 2) - ((minY + diagramHeight / 2) * scale);

    setViewport({
      scale,
      translateX: centerX,
      translateY: centerY
    });
  }, [currentDiagram, setViewport]);

  // Mouse wheel zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    if (!containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - containerRect.left;
    const mouseY = e.clientY - containerRect.top;
    
    // Calculate zoom
    const delta = e.deltaY * ZOOM_WHEEL_SENSITIVITY;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, viewport.scale * (1 - delta)));
    
    // Zoom towards mouse position
    const scaleRatio = newScale / viewport.scale;
    const newTranslateX = mouseX - (mouseX - viewport.translateX) * scaleRatio;
    const newTranslateY = mouseY - (mouseY - viewport.translateY) * scaleRatio;
    
    setViewport({
      scale: newScale,
      translateX: newTranslateX,
      translateY: newTranslateY
    });
  }, [viewport, setViewport]);

  // Mouse drag panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragStartViewport({ translateX: viewport.translateX, translateY: viewport.translateY });
    
    // Prevent text selection
    e.preventDefault();
  }, [viewport.translateX, viewport.translateY]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    setViewport({
      translateX: dragStartViewport.translateX + deltaX,
      translateY: dragStartViewport.translateY + deltaY
    });
  }, [isDragging, dragStart, dragStartViewport, setViewport]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target !== document.body && !(e.target as HTMLElement)?.closest('.diagram-viewer')) return;
    
    switch (e.key) {
      case '+':
      case '=':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomIn();
        }
        break;
      case '-':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomOut();
        }
        break;
      case '0':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          resetViewport();
        }
        break;
      case 'f':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          zoomToFit();
        }
        break;
    }
  }, [zoomIn, zoomOut, resetViewport, zoomToFit]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add wheel listener for zoom
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    // Add global mouse listeners for dragging
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Add keyboard listeners
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp, handleKeyDown]);

  // Render the diagram content
  useEffect(() => {
    if (!contentRef.current || !currentDiagram) return;

    // Clear previous content
    contentRef.current.innerHTML = '';

    try {
      if (config.renderingEngine === 'svg') {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '1000');
        svg.setAttribute('height', '800');
        
        // Calculate dynamic viewBox based on diagram content instead of fixed 0 0 1000 800
        let minX = 0, minY = 0, maxX = 1000, maxY = 800;
        
        if (currentDiagram?.nodes && currentDiagram.nodes.length > 0) {
          // Calculate bounds considering actual rendered shapes
          const nodeBounds = currentDiagram.nodes.map(n => {
            let extraPadding = 80; // Base padding
            
            // For start/end nodes (circles), add extra padding for radius and effects
            if (n.type === 'start' || n.type === 'end') {
              const radius = Math.max(Math.min(n.width, n.height) / 2, 35);
              extraPadding = Math.max(extraPadding, radius + 50);
            }
            
            return {
              minX: n.x - extraPadding,
              minY: n.y - extraPadding,
              maxX: n.x + n.width + extraPadding,
              maxY: n.y + n.height + extraPadding
            };
          });
          
          minX = Math.min(...nodeBounds.map(b => b.minX));
          minY = Math.min(...nodeBounds.map(b => b.minY));
          maxX = Math.max(...nodeBounds.map(b => b.maxX));
          maxY = Math.max(...nodeBounds.map(b => b.maxY));
          
          // Ensure minimum size and round to avoid floating point issues
          const width = Math.max(maxX - minX, 1000);
          const height = Math.max(maxY - minY, 800);
          maxX = minX + width;
          maxY = minY + height;
          
          // Round values to avoid SVG rendering issues
          minX = Math.floor(minX);
          minY = Math.floor(minY);
          maxX = Math.ceil(maxX);
          maxY = Math.ceil(maxY);
        }
        
        svg.setAttribute('viewBox', `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
        console.log(`InteractiveDiagramViewer SVG viewBox set to: ${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
        console.log(`ViewBox covers area from (${minX},${minY}) to (${maxX},${maxY})`);
        
        svg.style.background = config.theme === 'dark' ? '#1f2937' : '#ffffff';
        svg.style.border = `1px solid ${config.theme === 'dark' ? '#374151' : '#e5e7eb'}`;
        svg.style.borderRadius = '8px';
        
        contentRef.current.appendChild(svg);
        
        // Render using SVG renderer
        SVGRenderer.render(svg, currentDiagram, config);
      } else {
        // Create Canvas element
        const canvas = document.createElement('canvas');
        canvas.width = 1000;
        canvas.height = 800;
        canvas.style.border = `1px solid ${config.theme === 'dark' ? '#374151' : '#e5e7eb'}`;
        canvas.style.borderRadius = '8px';
        canvas.style.background = config.theme === 'dark' ? '#1f2937' : '#ffffff';
        
        contentRef.current.appendChild(canvas);
        
        // Render using Canvas renderer
        CanvasRenderer.render(canvas, currentDiagram, config);
      }
    } catch (error) {
      console.error('Rendering error:', error);
      
      // Show error message
      const errorDiv = document.createElement('div');
      errorDiv.className = 'flex items-center justify-center h-full text-red-500';
      errorDiv.innerHTML = `
        <div class="text-center">
          <div class="text-lg font-medium">Rendering Error</div>
          <div class="text-sm mt-2">${error instanceof Error ? error.message : 'Unknown error'}</div>
        </div>
      `;
      contentRef.current.appendChild(errorDiv);
    }
  }, [currentDiagram, config]);

  // Auto-fit on diagram change
  useEffect(() => {
    if (currentDiagram) {
      // Small delay to ensure rendering is complete
      setTimeout(zoomToFit, 100);
    }
  }, [currentDiagram, zoomToFit]);

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-50 dark:bg-gray-900 ${className}`}>
      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
        <button
          onClick={zoomIn}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom In (Ctrl/Cmd + +)"
        >
          <ZoomIn className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={zoomOut}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom Out (Ctrl/Cmd + -)"
        >
          <ZoomOut className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={zoomToFit}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Zoom to Fit (Ctrl/Cmd + F)"
        >
          <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={resetViewport}
          className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          title="Reset View (Ctrl/Cmd + 0)"
        >
          <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Zoom Level Display */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm text-gray-600 dark:text-gray-300">
          {Math.round(viewport.scale * 100)}%
        </div>
      </div>

      {/* Instructions Overlay */}
      {!currentDiagram && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <svg
                className="w-24 h-24 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
              Interactive Diagram Viewer
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Enter your diagram code in the left panel and click "Draw Code" to visualize your diagram here.
            </p>
            <div className="text-sm text-gray-400 dark:text-gray-500 space-y-1">
              <div>🖱️ <strong>Mouse Wheel:</strong> Zoom in/out</div>
              <div>🖱️ <strong>Click & Drag:</strong> Pan around</div>
              <div>⌨️ <strong>Ctrl/Cmd + Plus:</strong> Zoom in</div>
              <div>⌨️ <strong>Ctrl/Cmd + Minus:</strong> Zoom out</div>
              <div>⌨️ <strong>Ctrl/Cmd + 0:</strong> Reset view</div>
              <div>⌨️ <strong>Ctrl/Cmd + F:</strong> Zoom to fit</div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Diagram Container */}
      <div
        ref={containerRef}
        className={`diagram-viewer w-full h-full overflow-hidden ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div
          ref={contentRef}
          className="diagram-content origin-top-left"
          style={{
            transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          }}
        />
      </div>
    </div>
  );
}