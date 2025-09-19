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
            id: generateId(),
            name: from,
            type: getNodeType(from),
            label: from,
          });
        }
        
        if (!nodeMap.has(to)) {
          nodeMap.set(to, {
            id: generateId(),
            name: to,
            type: getNodeType(to),
            label: to,
          });
        }
        
        edges.push({
          id: generateId(),
          from: nodeMap.get(from)!.id,
          to: nodeMap.get(to)!.id,
          label: label || '',
        });
      }
    }

    // Position nodes with hierarchical layered layout (like Mermaid)
    const nodeArray = Array.from(nodeMap.values());
    const layeredNodes = positionNodesHierarchically(nodeArray, edges);

    return {
      success: true,
      data: {
        nodes: layeredNodes,
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

/**
 * Position nodes in hierarchical layers with better end node handling
 * This reduces edge crossings and prevents path overlaps
 */
function positionNodesHierarchically(nodeArray: any[], edges: any[]): any[] {
  // Build adjacency map
  const adjacencyMap = new Map<string, string[]>();
  const incomingMap = new Map<string, string[]>();
  
  nodeArray.forEach(node => {
    adjacencyMap.set(node.id, []);
    incomingMap.set(node.id, []);
  });
  
  edges.forEach(edge => {
    const fromConnections = adjacencyMap.get(edge.from) || [];
    fromConnections.push(edge.to);
    adjacencyMap.set(edge.from, fromConnections);
    
    const toConnections = incomingMap.get(edge.to) || [];
    toConnections.push(edge.from);
    incomingMap.set(edge.to, toConnections);
  });
  
  // Find root nodes and end nodes
  const rootNodes = nodeArray.filter(node => 
    (incomingMap.get(node.id) || []).length === 0 || node.type === 'start'
  );
  
  const endNodes = nodeArray.filter(node => 
    (adjacencyMap.get(node.id) || []).length === 0 || node.type === 'end'
  );
  
  if (rootNodes.length === 0) {
    rootNodes.push(nodeArray[0]);
  }
  
  // Assign layers using modified BFS to handle multiple flows
  const layers: any[][] = [];
  const nodeToLayer = new Map<string, number>();
  const visited = new Set<string>();
  
  // Start with root nodes
  const queue: Array<{node: any, layer: number}> = rootNodes.map(node => ({node, layer: 0}));
  
  while (queue.length > 0) {
    const {node, layer} = queue.shift()!;
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    
    // Ensure layer array exists
    while (layers.length <= layer) {
      layers.push([]);
    }
    
    layers[layer].push(node);
    nodeToLayer.set(node.id, layer);
    
    // Add children to next layer, but handle end nodes specially
    const children = adjacencyMap.get(node.id) || [];
    children.forEach(childId => {
      const childNode = nodeArray.find(n => n.id === childId);
      if (childNode && !visited.has(childId)) {
        // For end nodes, place them in a final layer
        const childLayer = childNode.type === 'end' ? layer + 2 : layer + 1;
        queue.push({node: childNode, layer: childLayer});
      }
    });
  }
  
  // Add any unvisited nodes
  nodeArray.forEach(node => {
    if (!visited.has(node.id)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(node);
    }
  });
  
  // Consolidate end nodes to avoid overlaps
  consolidateEndNodes(layers, nodeToLayer, endNodes);
  
  // Position nodes within each layer with better spacing
  const positioned: any[] = [];
  const layerHeight = 140;
  const baseNodeSpacing = 160;
  const startY = 80;
  
  layers.forEach((layerNodes, layerIndex) => {
    const y = startY + layerIndex * layerHeight;
    
    // Dynamic spacing based on number of nodes in layer
    const nodeSpacing = layerNodes.length > 3 ? baseNodeSpacing * 0.8 : baseNodeSpacing;
    const totalWidth = (layerNodes.length - 1) * nodeSpacing;
    const startX = 200 - totalWidth / 2; // Center the layer
    
    layerNodes.forEach((node, nodeIndex) => {
      let x = layerNodes.length === 1 
        ? 200  // Center single nodes
        : startX + (nodeIndex * nodeSpacing);
        
      // Special sizing for different node types
      let width = 120;
      let height = 60;
      
      if (node.type === 'decision') {
        width = 100;
        height = 80;
      } else if (node.type === 'start' || node.type === 'end') {
        width = 100;
        height = 50;
        
        // For end nodes, ensure they're not too close to boundaries
        // Add extra margin to avoid clipping issues with ellipse rendering
        if (x < 100) x = 100; // Minimum left margin
        if (x + width > 500) x = 500 - width; // Maximum right boundary (adjust based on typical diagram width)
      }
        
      positioned.push({
        ...node,
        x,
        y,
        width,
        height,
      });
    });
  });
  
  return positioned;
}

/**
 * Consolidate end nodes to prevent path overlaps
 */
function consolidateEndNodes(layers: any[][], nodeToLayer: Map<string, number>, endNodes: any[]) {
  if (endNodes.length <= 1) return;
  
  // Find the maximum layer with end nodes
  let maxEndLayer = 0;
  endNodes.forEach(endNode => {
    const layer = nodeToLayer.get(endNode.id) || 0;
    maxEndLayer = Math.max(maxEndLayer, layer);
  });
  
  // Move all end nodes to the final layer and remove from other layers
  endNodes.forEach(endNode => {
    const currentLayer = nodeToLayer.get(endNode.id) || 0;
    if (currentLayer < maxEndLayer) {
      // Remove from current layer
      const layer = layers[currentLayer];
      const index = layer.indexOf(endNode);
      if (index > -1) {
        layer.splice(index, 1);
      }
      
      // Add to final layer if not already there
      if (!layers[maxEndLayer].includes(endNode)) {
        layers[maxEndLayer].push(endNode);
        nodeToLayer.set(endNode.id, maxEndLayer);
      }
    }
  });
}