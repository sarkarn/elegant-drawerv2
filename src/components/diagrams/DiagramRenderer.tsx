import { useEffect, useRef } from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import { SVGRenderer } from './SVGRenderer';
import { CanvasRenderer } from './CanvasRenderer';

export function DiagramRenderer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { config, currentDiagram, viewport } = useDiagramStore();

  useEffect(() => {
    if (!containerRef.current || !currentDiagram) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    try {
      if (config.renderingEngine === 'svg') {
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        // Calculate dynamic viewBox based on diagram content
        let minX = 0, minY = 0, maxX = 1000, maxY = 800;
        
        if (currentDiagram?.nodes && currentDiagram.nodes.length > 0) {
          // Calculate bounds considering actual rendered shapes
          const nodeBounds = currentDiagram.nodes.map(n => {
            let extraPadding = 80; // Base padding
            
            // For start/end nodes (circles), add extra padding for radius and effects
            if (n.type === 'start' || n.type === 'end') {
              const radius = Math.max(Math.min(n.width, n.height) / 2, 25);
              // Add radius plus extra for drop shadow and stroke
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
        svg.style.background = config.theme === 'dark' ? '#1f2937' : '#ffffff';
        svg.style.overflow = 'visible'; // Ensure content isn't clipped even if calculations are slightly off
        
        containerRef.current.appendChild(svg);
        
        // Render using SVG renderer
        SVGRenderer.render(svg, currentDiagram, config);
      } else {
        // Create Canvas element
        const canvas = document.createElement('canvas');
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        
        containerRef.current.appendChild(canvas);
        
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
      containerRef.current.appendChild(errorDiv);
    }
  }, [currentDiagram, config, viewport]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-visible bg-white dark:bg-gray-800"
      style={{
        transform: `translate(${viewport.translateX}px, ${viewport.translateY}px) scale(${viewport.scale})`,
        transformOrigin: '0 0',
      }}
    />
  );
}