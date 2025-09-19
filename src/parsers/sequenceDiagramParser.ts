import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';
import { positionSequenceNodes } from '../utils/layoutUtils';

export function parseSequenceDiagram(input: string): ParserResult {
  try {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const actors = new Set<string>();
    const messages: any[] = [];
    
    // Extract actors and messages
    for (const line of lines) {
      const arrowMatch = line.match(/(\w+)\s*(->|-->)\s*(\w+):\s*(.+)/);
      if (arrowMatch) {
        const [, from, arrow, to, message] = arrowMatch;
        actors.add(from);
        actors.add(to);
        
        messages.push({
          id: generateId(),
          from,
          to,
          message,
          type: arrow === '->' ? 'sync' : 'async',
        });
      }
    }

    // Create nodes for actors
    const nodes = Array.from(actors).map((actor, index) => ({
      id: generateId(),
      type: 'actor',
      x: 100 + index * 200,
      y: 50,
      width: 100,
      height: 60,
      label: actor,
      data: { actorName: actor },
    }));

    // Create edges for messages
    const edges = messages.map((msg, index) => {
      const fromNode = nodes.find(n => n.label === msg.from);
      const toNode = nodes.find(n => n.label === msg.to);
      
      return {
        id: msg.id,
        from: fromNode?.id || '',
        to: toNode?.id || '',
        label: msg.message,
        type: msg.type,
        data: { order: index },
      };
    });

    // Apply sequence-specific layout
    const layoutNodes = positionSequenceNodes(nodes);

    return {
      success: true,
      data: {
        nodes: layoutNodes,
        edges,
        metadata: { title: 'Sequence Diagram', created: new Date() },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse sequence diagram',
    };
  }
}