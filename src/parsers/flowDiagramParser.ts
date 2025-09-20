import { positionNodesWithDagre } from '../utils/layoutUtils';
import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';

export function parseFlowDiagram(input: string): ParserResult {
  try {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const nodeMap = new Map<string, any>();
    const edges: any[] = [];
    
    for (const line of lines) {
      const arrowMatch = line.match(/(\w+)\s*->\s*(\w+)(?::\s*(.+))?/);
      if (arrowMatch) {
        const [, from, to, label] = arrowMatch;
        
        // Create nodes if they don't exist
        if (!nodeMap.has(from)) {
          nodeMap.set(from, {
            id: from, // Use name as ID for Dagre
            name: from,
            type: getNodeType(from),
            label: from,
          });
        }
        
        if (!nodeMap.has(to)) {
          nodeMap.set(to, {
            id: to, // Use name as ID for Dagre
            name: to,
            type: getNodeType(to),
            label: to,
          });
        }
        
        edges.push({
          id: generateId(),
          from: from, // Use name as ID for Dagre
          to: to,     // Use name as ID for Dagre
          label: label || '',
        });
      }
    }

    // Position nodes with Dagre.js for a clean, hierarchical layout
    const nodeArray = Array.from(nodeMap.values());
    const layeredNodes = positionNodesWithDagre(nodeArray, edges);

    // Convert LayoutNodes to DiagramNodes by ensuring required properties
    const diagramNodes = layeredNodes.map(node => ({
      ...node,
      x: node.x || 0,
      y: node.y || 0,
      width: node.width || 120,
      height: node.height || 60,
      type: node.type || 'process',
    }));

    return {
      success: true,
      data: {
        nodes: diagramNodes,
        edges,
        metadata: { title: 'Flow Diagram', created: new Date() },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse flow diagram',
    };
  }
}

function getNodeType(nodeName: string): string {
  if (nodeName.toLowerCase().includes('start')) return 'start';
  if (nodeName.toLowerCase().includes('end')) return 'end';
  if (nodeName.toLowerCase().includes('decision')) return 'decision';
  return 'process';
}