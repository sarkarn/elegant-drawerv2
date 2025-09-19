import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';
import { positionMindmapNodesTree } from '../utils/layoutUtils';

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
      
      // Skip empty lines and comments
      if (!text || text.startsWith('//')) continue;
      
      const node = {
        id: generateId(),
        type: level === 0 ? 'root' : level === 1 ? 'branch' : 'leaf',
        label: text,
        level, // Store level for positioning algorithm
        x: 0, // Will be positioned later
        y: 0,
        width: Math.max(120, text.length * 7),
        height: level === 0 ? 50 : level === 1 ? 45 : 35,
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
    if (nodes.length === 0) {
      return {
        success: false,
        error: 'No valid nodes found in mindmap input',
      };
    }

    // Validate that all nodes have IDs
    const nodesWithoutIds = nodes.filter(node => !node.id);
    if (nodesWithoutIds.length > 0) {
      return {
        success: false,
        error: `Found ${nodesWithoutIds.length} nodes without IDs`,
      };
    }

    const layoutNodes = positionMindmapNodesTree(nodes, edges);

    if (!layoutNodes || layoutNodes.length === 0) {
      return {
        success: false,
        error: 'Layout positioning failed - no nodes positioned',
      };
    }

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