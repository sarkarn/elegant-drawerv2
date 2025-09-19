// Shared layout utilities for consistent diagram positioning

export interface LayoutNode {
  id: string;
  type?: string;
  label: string;
  [key: string]: any;
}

export interface LayoutEdge {
  from: string;
  to: string;
  [key: string]: any;
}

/**
 * Universal hierarchical layout algorithm for all diagram types
 * Based on Mermaid/PlantUML principles
 */
export function positionNodesHierarchically(
  nodes: LayoutNode[], 
  edges: LayoutEdge[],
  options: {
    nodeWidth?: number;
    nodeHeight?: number;
    horizontalSpacing?: number;
    verticalSpacing?: number;
    startX?: number;
    startY?: number;
    layoutDirection?: 'top-down' | 'left-right';
  } = {}
): any[] {
  const {
    nodeWidth = 120,
    nodeHeight = 60,
    horizontalSpacing = 180,
    verticalSpacing = 150,
    startX = 150,
    startY = 100,
    layoutDirection = 'top-down'
  } = options;

  // Build adjacency and incoming edge maps
  const adjacencyMap = new Map<string, string[]>();
  const incomingMap = new Map<string, string[]>();
  
  nodes.forEach(node => {
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
  
  // Find root nodes and assign layers
  const layers: LayoutNode[][] = [];
  const nodeToLayer = new Map<string, number>();
  const visited = new Set<string>();
  
  // Identify root nodes (no incoming edges or special types)
  const rootNodes = nodes.filter(node => {
    const hasNoIncoming = (incomingMap.get(node.id) || []).length === 0;
    const isRootType = node.type === 'start' || node.type === 'root' || node.type === 'actor';
    return hasNoIncoming || isRootType;
  });
  
  if (rootNodes.length === 0) {
    // Fallback: pick nodes that seem like roots based on type or position
    const candidateRoots = nodes.filter(node => 
      node.type === 'class' || node.type === 'usecase' || !node.type
    );
    if (candidateRoots.length > 0) {
      rootNodes.push(candidateRoots[0]);
    } else {
      rootNodes.push(nodes[0]);
    }
  }
  
  // Assign layers using BFS
  const queue: Array<{node: LayoutNode, layer: number}> = 
    rootNodes.map(node => ({node, layer: 0}));
  
  while (queue.length > 0) {
    const {node, layer} = queue.shift()!;
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    
    // Ensure layer exists
    while (layers.length <= layer) {
      layers.push([]);
    }
    
    layers[layer].push(node);
    nodeToLayer.set(node.id, layer);
    
    // Add children to next layer
    const children = adjacencyMap.get(node.id) || [];
    children.forEach(childId => {
      const childNode = nodes.find(n => n.id === childId);
      if (childNode && !visited.has(childId)) {
        queue.push({node: childNode, layer: layer + 1});
      }
    });
  }
  
  // Add unvisited nodes to appropriate layers
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      // Try to place based on type
      let targetLayer = layers.length - 1;
      if (node.type === 'end' || node.type === 'leaf') {
        targetLayer = Math.max(0, layers.length - 1);
      }
      
      while (layers.length <= targetLayer) {
        layers.push([]);
      }
      layers[targetLayer].push(node);
    }
  });
  
  // Position nodes within layers
  const positioned: any[] = [];
  
  layers.forEach((layerNodes, layerIndex) => {
    layerNodes.forEach((node, nodeIndex) => {
      let x, y;
      
      if (layoutDirection === 'left-right') {
        // Left-to-right layout
        x = startX + layerIndex * horizontalSpacing;
        y = layerNodes.length === 1 
          ? startY + 200  // Center single nodes
          : startY + (nodeIndex * verticalSpacing);
      } else {
        // Top-down layout (default)
        x = layerNodes.length === 1 
          ? startX + 200  // Center single nodes
          : startX + (nodeIndex * horizontalSpacing);
        y = startY + layerIndex * verticalSpacing;
      }
      
      positioned.push({
        ...node,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
      });
    });
  });
  
  return positioned;
}

/**
 * Special layout for sequence diagrams (horizontal actors)
 */
export function positionSequenceNodes(nodes: LayoutNode[]): any[] {
  const actors = nodes.filter(node => node.type === 'actor');
  
  const positioned: any[] = [];
  const actorSpacing = 200;
  const startX = 100;
  const startY = 80;
  
  // Position actors horizontally
  actors.forEach((actor, index) => {
    positioned.push({
      ...actor,
      x: startX + index * actorSpacing,
      y: startY,
      width: 120,
      height: 60,
    });
  });
  
  return positioned;
}

/**
 * Radial layout for mind maps with viewport-aware positioning
 */
export function positionMindmapNodesRadial(nodes: LayoutNode[], edges: LayoutEdge[]): any[] {
  const positioned: any[] = [];
  
  // Use larger viewport for mind maps to ensure visibility
  const centerX = 500;
  const centerY = 400;
  const minRadius = 120;
  const radiusGrowth = 80;
  
  // Find root node
  const rootNode = nodes.find(node => node.type === 'root') || nodes[0];
  if (!rootNode) return positioned;
  
  // Position root at center with larger size
  positioned.push({
    ...rootNode,
    x: centerX - 75,
    y: centerY - 25,
    width: 150,
    height: 50,
  });
  
  // Build tree structure
  const childrenMap = new Map<string, LayoutNode[]>();
  edges.forEach(edge => {
    if (!childrenMap.has(edge.from)) {
      childrenMap.set(edge.from, []);
    }
    const child = nodes.find(n => n.id === edge.to);
    if (child) {
      childrenMap.get(edge.from)!.push(child);
    }
  });
  
  // Position children in expanding circles with better spacing
  const positionChildren = (parentId: string, parentX: number, parentY: number, level: number) => {
    const children = childrenMap.get(parentId) || [];
    if (children.length === 0) return;
    
    const radius = minRadius + level * radiusGrowth;
    const angleStep = (2 * Math.PI) / Math.max(children.length, 3);
    const startAngle = level === 1 ? 0 : -Math.PI / 2; // First level spreads horizontally
    
    children.forEach((child, index) => {
      const angle = startAngle + index * angleStep;
      const x = parentX + radius * Math.cos(angle);
      const y = parentY + radius * Math.sin(angle);
      
      // Dynamic sizing based on text length and level
      const textLength = child.label?.length || 10;
      const width = Math.max(100, Math.min(200, textLength * 8));
      const height = level === 1 ? 45 : 35;
      
      positioned.push({
        ...child,
        x: x - width / 2,
        y: y - height / 2,
        width,
        height,
      });
      
      // Recursively position grandchildren
      positionChildren(child.id, x, y, level + 1);
    });
  };
  
  positionChildren(rootNode.id, centerX, centerY, 1);
  
  return positioned;
}