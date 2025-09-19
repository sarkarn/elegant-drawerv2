import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';
import { positionNodesHierarchically } from '../utils/layoutUtils';

export function parseUsecaseDiagram(input: string): ParserResult {
  try {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const actors: any[] = [];
    const usecases: any[] = [];
    const edges: any[] = [];
    
    for (const line of lines) {
      // Actor definition
      if (line.startsWith('actor ')) {
        const actorName = line.replace('actor ', '').trim();
        actors.push({
          id: generateId(),
          type: 'actor',
          label: actorName,
          name: actorName,
        });
      }
      // Actor to usecase connection
      else if (line.includes(' -> (') && line.includes(')')) {
        const match = line.match(/(\w+)\s*->\s*\(([^)]+)\)/);
        if (match) {
          const [, actorName, usecaseName] = match;
          
          // Find or create usecase
          let usecase = usecases.find(u => u.label === usecaseName);
          if (!usecase) {
            usecase = {
              id: generateId(),
              type: 'usecase',
              label: usecaseName,
              name: usecaseName,
            };
            usecases.push(usecase);
          }
          
          // Find actor
          const actor = actors.find(a => a.name === actorName);
          if (actor) {
            edges.push({
              id: generateId(),
              from: actor.id,
              to: usecase.id,
              label: '',
            });
          }
        }
      }
    }

    // Position actors and usecases with improved layout
    const actorSpacing = 150;
    const usecaseSpacing = 120;
    const leftMargin = 100;
    const usecaseLeftMargin = 350;
    
    const allNodes = [
      ...actors.map((actor, index) => ({
        ...actor,
        x: leftMargin,
        y: 100 + index * actorSpacing,
        width: 100,
        height: 120,
      })),
      ...usecases.map((usecase, index) => ({
        ...usecase,
        x: usecaseLeftMargin,
        y: 100 + index * usecaseSpacing,
        width: Math.max(160, usecase.label.length * 12), // Dynamic width based on text
        height: 80,
      })),
    ];

    // Apply hierarchical layout for better positioning
    const layoutNodes = positionNodesHierarchically(allNodes, edges, {
      nodeWidth: 140,
      nodeHeight: 80,
      horizontalSpacing: 200,
      verticalSpacing: 150,
      layoutDirection: 'left-right' // Use left-right for use case diagrams
    });

    return {
      success: true,
      data: {
        nodes: layoutNodes,
        edges,
        metadata: { title: 'Use Case Diagram', created: new Date() },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse use case diagram',
    };
  }
}