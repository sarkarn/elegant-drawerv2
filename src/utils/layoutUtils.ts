import * as dagre from 'dagre';

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
      
      // Use actual node dimensions but with better spacing logic
      const actualWidth = node.width || nodeWidth;
      const actualHeight = node.height || nodeHeight;
      
      if (layoutDirection === 'left-right') {
        // Left-to-right layout
        x = startX + layerIndex * horizontalSpacing;
        y = layerNodes.length === 1 
          ? startY + 200  // Center single nodes
          : startY + (nodeIndex * verticalSpacing);
      } else {
        // Top-down layout (default) - use cumulative positioning for better spacing
        if (layerNodes.length === 1) {
          x = startX + 200;  // Center single nodes
        } else {
          // Calculate cumulative x position based on actual widths of previous nodes
          let cumulativeX = startX;
          for (let i = 0; i < nodeIndex; i++) {
            const prevNode = layerNodes[i];
            const prevWidth = prevNode.width || nodeWidth;
            cumulativeX += prevWidth + 70; // Increased margin from 50px to 70px
          }
          x = cumulativeX;
        }
        y = startY + layerIndex * verticalSpacing;
      }
      
      positioned.push({
        ...node,
        x,
        y,
        width: actualWidth,  // Preserve calculated width
        height: actualHeight, // Preserve calculated height
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
 * Advanced dual-sided, balanced tree layout for mind maps.
 * The root is centered, and branches are split to the left and right.
 */
export function positionMindmapNodesTree(nodes: LayoutNode[], edges: LayoutEdge[]): any[] {
  const positioned: any[] = [];
  if (nodes.length === 0) return positioned;

  const centerX = 600;
  const centerY = 400;
  const horizontalSpacing = 250;
  const verticalSpacing = 60;

  // 1. Find root and build children map
  const rootNode = nodes.find(node => !edges.some(edge => edge.to === node.id)) || nodes[0];
  const childrenMap = new Map<string, LayoutNode[]>();
  edges.forEach(edge => {
    if (!childrenMap.has(edge.from)) childrenMap.set(edge.from, []);
    const child = nodes.find(n => n.id === edge.to);
    if (child) childrenMap.get(edge.from)!.push(child);
  });

  // Sort children for stable layout
  childrenMap.forEach(children => children.sort((a, b) => (a.label || '').localeCompare(b.label || '')));

  // 2. Position Root Node
  const rootWidth = Math.max(180, (rootNode.label?.length || 10) * 9);
  positioned.push({
    ...rootNode,
    x: centerX - rootWidth / 2,
    y: centerY - 30,
    width: rootWidth,
    height: 60,
  });

  // 3. Recursive function to calculate subtree heights
  const heightCache = new Map<string, number>();
  function getSubtreeHeight(nodeId: string): number {
    if (heightCache.has(nodeId)) return heightCache.get(nodeId)!;

    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return verticalSpacing;

    const totalHeight = children.reduce((sum, child) => sum + getSubtreeHeight(child.id), 0);
    heightCache.set(nodeId, totalHeight);
    return totalHeight;
  }

  // 4. Recursive function to position nodes
  function positionBranch(nodeId: string, parentX: number, parentY: number, direction: 'left' | 'right', level: number) {
    const children = childrenMap.get(nodeId) || [];
    if (children.length === 0) return;

    const totalSubtreeHeight = getSubtreeHeight(nodeId);
    let currentY = parentY - totalSubtreeHeight / 2;

    children.forEach(child => {
      const childSubtreeHeight = getSubtreeHeight(child.id);
      const nodeY = currentY + childSubtreeHeight / 2;
      
      const nodeWidth = Math.max(140, Math.min(220, (child.label?.length || 10) * 8));
      const nodeHeight = level > 1 ? 40 : 50;
      const nodeX = direction === 'right'
        ? parentX + horizontalSpacing
        : parentX - horizontalSpacing - nodeWidth;

      positioned.push({
        ...child,
        x: nodeX,
        y: nodeY - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
      });

      positionBranch(child.id, nodeX + nodeWidth / 2, nodeY, direction, level + 1);
      currentY += childSubtreeHeight;
    });
  }

  // 5. Split root children into left and right branches
  const rootChildren = childrenMap.get(rootNode.id) || [];
  const rightBranchNodes = rootChildren.slice(0, Math.ceil(rootChildren.length / 2));
  const leftBranchNodes = rootChildren.slice(Math.ceil(rootChildren.length / 2));

  // Position Right Branch
  const rightBranchHeight = rightBranchNodes.reduce((sum, child) => sum + getSubtreeHeight(child.id), 0);
  let rightY = centerY - rightBranchHeight / 2;
  rightBranchNodes.forEach(child => {
    const childSubtreeHeight = getSubtreeHeight(child.id);
    const nodeY = rightY + childSubtreeHeight / 2;
    const nodeWidth = Math.max(150, Math.min(240, (child.label?.length || 10) * 8));
    const nodeHeight = 50;

    positioned.push({
      ...child,
      x: centerX + horizontalSpacing,
      y: nodeY - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    });
    positionBranch(child.id, centerX + horizontalSpacing + nodeWidth / 2, nodeY, 'right', 2);
    rightY += childSubtreeHeight;
  });

  // Position Left Branch
  const leftBranchHeight = leftBranchNodes.reduce((sum, child) => sum + getSubtreeHeight(child.id), 0);
  let leftY = centerY - leftBranchHeight / 2;
  leftBranchNodes.forEach(child => {
    const childSubtreeHeight = getSubtreeHeight(child.id);
    const nodeY = leftY + childSubtreeHeight / 2;
    const nodeWidth = Math.max(150, Math.min(240, (child.label?.length || 10) * 8));
    const nodeHeight = 50;

    positioned.push({
      ...child,
      x: centerX - horizontalSpacing - nodeWidth,
      y: nodeY - nodeHeight / 2,
      width: nodeWidth,
      height: nodeHeight,
    });
    positionBranch(child.id, centerX - horizontalSpacing - nodeWidth / 2, nodeY, 'left', 2);
    leftY += childSubtreeHeight;
  });
  
  return positioned;
}

/**
 * Use Dagre.js to layout the graph for flowcharts
 */
export function positionNodesWithDagre(nodes: LayoutNode[], edges: LayoutEdge[]): LayoutNode[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'TB', // Top to bottom layout
    nodesep: 50,   // Horizontal separation between nodes
    ranksep: 70,   // Vertical separation between levels
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach(node => {
    const width = node.width || Math.max(150, (node.label?.length || 0) * 9);
    const height = node.height || 60;
    g.setNode(node.id, { label: node.label, width, height });
  });

  edges.forEach(edge => {
    g.setEdge(edge.from, edge.to);
  });

  dagre.layout(g);

  return nodes.map(node => {
    const { x, y, width, height } = g.node(node.id);
    return {
      ...node,
      x: x - width / 2,
      y: y - height / 2,
      width,
      height,
    };
  });
}