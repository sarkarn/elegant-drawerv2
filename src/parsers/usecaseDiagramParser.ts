import type { ParserResult } from '../types/diagram';
import { generateId } from '../utils/helpers';

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

    // Position usecases first in a vertical arrangement
    const usecaseSpacing = 120;
    const usecaseLeftMargin = 350;
    
    const positionedUsecases = usecases.map((usecase, index) => ({
      ...usecase,
      x: usecaseLeftMargin,
      y: 100 + index * usecaseSpacing,
      width: Math.max(160, usecase.label.length * 12), // Dynamic width based on text
      height: 80,
    }));

    // Position actors based on their connected use cases
    let actorIndex = 0;
    const positionedActors = actors.map((actor) => {
      // Find all use cases connected to this actor
      const connectedUsecases = edges
        .filter(edge => edge.from === actor.id)
        .map(edge => positionedUsecases.find(uc => uc.id === edge.to))
        .filter(Boolean);

      let actorY = 180; // Default Y position
      
      if (connectedUsecases.length > 0) {
        // Calculate the center Y position of connected use cases
        const usecaseYPositions = connectedUsecases.map(uc => uc.y + uc.height / 2);
        const avgY = usecaseYPositions.reduce((sum, y) => sum + y, 0) / usecaseYPositions.length;
        actorY = avgY - 60; // Center the actor with respect to use cases (accounting for actor height)
      } else {
        // If no connections, place actors in a fallback vertical arrangement
        actorY = 100 + actorIndex * 150;
        actorIndex++;
      }

      return {
        ...actor,
        x: 100, // Keep actors on the left
        y: actorY,
        width: 100,
        height: 120,
      };
    });

    const allNodes = [
      ...positionedActors,
      ...positionedUsecases,
    ];

    // Use our custom positioning instead of hierarchical layout
    // const layoutNodes = positionNodesHierarchically(allNodes, edges, {
    //   nodeWidth: 140,
    //   nodeHeight: 80,
    //   horizontalSpacing: 200,
    //   verticalSpacing: 150,
    //   layoutDirection: 'left-right' // Use left-right for use case diagrams
    // });

    return {
      success: true,
      data: {
        nodes: allNodes, // Use our custom positioned nodes
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