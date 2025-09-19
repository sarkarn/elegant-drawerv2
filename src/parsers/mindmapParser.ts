import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';
import { positionMindmapNodesRadial } from '../utils/layoutUtils';

export function parseMindmapDiagram(input: string): ParserResult {
  try {
    // Use raw lines to preserve indentation for level detection
    const rawLines = input.split('\n');
    const nodes: any[] = [];
    const edges: any[] = [];
    const nodeStack: Array<{ node: any; level: number }> = [];
    
    for (const rawLine of rawLines) {
      const level = getIndentLevel(rawLine);
      const text = rawLine.trim();
      
      if (!text) continue;
      
      const node = {
        id: generateId(),
        type: level === 0 ? 'root' : level === 1 ? 'branch' : 'leaf',
        label: text,
        level,
        x: 0, // Will be positioned later
        y: 0,
        width: Math.max(100, text.length * 8),
        height: 40,
      };
      
      nodes.push(node);
      
      // Remove nodes from stack that are at the same level or deeper
      while (nodeStack.length > 0 && nodeStack[nodeStack.length - 1].level >= level) {
        nodeStack.pop();
      }
      
      // Connect to parent
      if (nodeStack.length > 0) {
        const parent = nodeStack[nodeStack.length - 1].node;
        edges.push({
          id: generateId(),
          from: parent.id,
          to: node.id,
          label: '',
        });
      }
      
      nodeStack.push({ node, level });
    }

    // Position nodes in a radial layout using shared utility
    const layoutNodes = positionMindmapNodesRadial(nodes, edges);

    return {
      success: true,
      data: {
        nodes: layoutNodes,
        edges,
        metadata: { title: 'Mind Map', created: new Date() },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse mindmap',
    };
  }
}

function getIndentLevel(line: string): number {
  const match = line.match(/^(\s*)/);
  return match ? Math.floor(match[1].length / 2) : 0;
}