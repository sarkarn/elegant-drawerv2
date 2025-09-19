import type { DiagramData, DiagramConfig } from '../../types/diagram';
import { getConnectionPoints } from '../../utils/edgeUtils';

export class CanvasRenderer {
  static render(canvas: HTMLCanvasElement, data: DiagramData, config: DiagramConfig) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set background
    ctx.fillStyle = config.theme === 'dark' ? '#1f2937' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Basic rendering - nodes as rectangles
    ctx.strokeStyle = config.theme === 'dark' ? '#6b7280' : '#374151';
    ctx.fillStyle = config.theme === 'dark' ? '#374151' : '#f9fafb';
    ctx.font = '12px sans-serif';

    // Render nodes
    data.nodes.forEach(node => {
      ctx.fillRect(node.x, node.y, node.width, node.height);
      ctx.strokeRect(node.x, node.y, node.width, node.height);
      
      // Node label
      ctx.fillStyle = config.theme === 'dark' ? '#e5e7eb' : '#111827';
      ctx.textAlign = 'center';
      ctx.fillText(
        node.label,
        node.x + node.width / 2,
        node.y + node.height / 2 + 5
      );
      ctx.fillStyle = config.theme === 'dark' ? '#374151' : '#f9fafb';
    });

    // Render edges with intelligent connection points
    ctx.strokeStyle = config.theme === 'dark' ? '#6b7280' : '#374151';
    const nodeMap = new Map(data.nodes.map(n => [n.id, n]));
    data.edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;
      
      // Get intelligent connection points
      const { from: fromPoint, to: toPoint } = getConnectionPoints(fromNode, toNode);
      
      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.lineTo(toPoint.x, toPoint.y);
      ctx.stroke();
      
      // Draw arrowhead
      const angle = Math.atan2(toPoint.y - fromPoint.y, toPoint.x - fromPoint.x);
      const headLength = 10;
      
      ctx.beginPath();
      ctx.moveTo(toPoint.x, toPoint.y);
      ctx.lineTo(
        toPoint.x - headLength * Math.cos(angle - Math.PI / 6),
        toPoint.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(toPoint.x, toPoint.y);
      ctx.lineTo(
        toPoint.x - headLength * Math.cos(angle + Math.PI / 6),
        toPoint.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    });
  }
}