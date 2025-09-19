// Utility functions for intelligent edge connection and routing

export interface Point {
  x: number;
  y: number;
}

export interface NodeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: string; // Node type for shape-specific calculations
}

/**
 * Calculate the best connection point on a node's border given a direction to another node
 * Prioritizes top/bottom connections for better flowchart flow
 */
export function getNodeConnectionPoint(node: NodeBounds, targetNode: NodeBounds): Point {
  // Handle different node shapes
  if (node.type === 'decision') {
    return getDiamondConnectionPoint(node, targetNode);
  }
  
  // Handle mindmap nodes (where x,y represents center, not top-left)
  let nodeCenterX, nodeCenterY, nodeLeft, nodeTop, nodeRight, nodeBottom;
  
  if (node.type && ['root', 'branch', 'leaf'].includes(node.type)) {
    // For mindmap nodes, x,y is already the center
    nodeCenterX = node.x;
    nodeCenterY = node.y;
    nodeLeft = node.x - node.width / 2;
    nodeTop = node.y - node.height / 2;
    nodeRight = node.x + node.width / 2;
    nodeBottom = node.y + node.height / 2;
  } else {
    // For other nodes, x,y is top-left corner
    nodeCenterX = node.x + node.width / 2;
    nodeCenterY = node.y + node.height / 2;
    nodeLeft = node.x;
    nodeTop = node.y;
    nodeRight = node.x + node.width;
    nodeBottom = node.y + node.height;
  }
  
  // Get target center (handle both coordinate systems)
  let targetCenterX, targetCenterY;
  if (targetNode.type && ['root', 'branch', 'leaf'].includes(targetNode.type)) {
    targetCenterX = targetNode.x;
    targetCenterY = targetNode.y;
  } else {
    targetCenterX = targetNode.x + targetNode.width / 2;
    targetCenterY = targetNode.y + targetNode.height / 2;
  }

  // Calculate direction vector
  const dx = targetCenterX - nodeCenterX;
  const dy = targetCenterY - nodeCenterY;

  // For flowcharts, prioritize vertical connections (top/bottom) over horizontal
  // This creates better flow readability
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  
  // Use a bias factor to prefer vertical connections in flowcharts
  const verticalBias = (node.type && ['start', 'end', 'process', 'decision', 'input', 'output'].includes(node.type)) ? 1.3 : 1.0;
  const effectiveAbsY = absY * verticalBias;

  if (effectiveAbsY > absX) {
    // Connect to top or bottom side (preferred for flowcharts)
    if (dy > 0) {
      // Connect to bottom side
      return {
        x: nodeCenterX,
        y: nodeBottom
      };
    } else {
      // Connect to top side
      return {
        x: nodeCenterX,
        y: nodeTop
      };
    }
  } else {
    // Connect to left or right side (only when horizontal distance is clearly dominant)
    if (dx > 0) {
      // Connect to right side
      return {
        x: nodeRight,
        y: nodeCenterY
      };
    } else {
      // Connect to left side
      return {
        x: nodeLeft,
        y: nodeCenterY
      };
    }
  }
}

/**
 * Calculate connection point for diamond-shaped nodes (decision nodes in flow diagrams)
 * Prioritizes top/bottom connections for better flow
 */
function getDiamondConnectionPoint(node: NodeBounds, targetNode: NodeBounds): Point {
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  const targetCenterX = targetNode.x + targetNode.width / 2;
  const targetCenterY = targetNode.y + targetNode.height / 2;

  // Calculate direction vector
  const dx = targetCenterX - centerX;
  const dy = targetCenterY - centerY;

  // For decision diamonds, strongly prefer top/bottom connections for flow
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  
  // Apply strong vertical bias for decision nodes in flowcharts
  const verticalBias = 1.8;
  const effectiveAbsY = absY * verticalBias;

  if (effectiveAbsY > absX) {
    // Vertical direction is stronger - use top/bottom points
    if (dy > 0) {
      return { x: centerX, y: node.y + node.height }; // Bottom point
    } else {
      return { x: centerX, y: node.y }; // Top point
    }
  } else {
    // Horizontal direction is stronger - use left/right points
    if (dx > 0) {
      return { x: node.x + node.width, y: centerY }; // Right point
    } else {
      return { x: node.x, y: centerY }; // Left point
    }
  }
}

/**
 * Calculate target connection point for diamond-shaped nodes (decision nodes)
 * When a connection is coming TO a decision node
 */
function getDiamondTargetConnectionPoint(node: NodeBounds, fromNode: NodeBounds): Point {
  const centerX = node.x + node.width / 2;
  const centerY = node.y + node.height / 2;
  const fromCenterX = fromNode.x + fromNode.width / 2;
  const fromCenterY = fromNode.y + fromNode.height / 2;

  // Calculate direction vector (FROM source TO target)
  const dx = centerX - fromCenterX;
  const dy = centerY - fromCenterY;

  // For decision diamonds, prefer top connection when coming from above
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  
  // Strong preference for top connections
  if (dy > 0 && absY > absX * 0.3) {
    // Coming from above - connect to top point
    return { x: centerX, y: node.y }; // Top point
  } else if (dy < 0 && absY > absX * 0.3) {
    // Coming from below - connect to bottom point
    return { x: centerX, y: node.y + node.height }; // Bottom point
  } else if (dx > 0) {
    // Coming from left - connect to left point
    return { x: node.x, y: centerY }; // Left point
  } else {
    // Coming from right - connect to right point
    return { x: node.x + node.width, y: centerY }; // Right point
  }
}

/**
 * Calculate the best connection point on a target node's border where an edge should arrive
 * For flowcharts, prefer top connection points for better flow
 */
export function getTargetConnectionPoint(node: NodeBounds, fromNode: NodeBounds): Point {
  // Handle different node shapes
  if (node.type === 'decision') {
    return getDiamondTargetConnectionPoint(node, fromNode);
  }
  
  // Handle mindmap nodes (where x,y represents center, not top-left)
  let nodeCenterX, nodeCenterY, nodeLeft, nodeTop, nodeRight, nodeBottom;
  
  if (node.type && ['root', 'branch', 'leaf'].includes(node.type)) {
    // For mindmap nodes, x,y is already the center
    nodeCenterX = node.x;
    nodeCenterY = node.y;
    nodeLeft = node.x - node.width / 2;
    nodeTop = node.y - node.height / 2;
    nodeRight = node.x + node.width / 2;
    nodeBottom = node.y + node.height / 2;
  } else {
    // For other nodes, x,y is top-left corner
    nodeCenterX = node.x + node.width / 2;
    nodeCenterY = node.y + node.height / 2;
    nodeLeft = node.x;
    nodeTop = node.y;
    nodeRight = node.x + node.width;
    nodeBottom = node.y + node.height;
  }
  
  // Get source center for direction calculation
  let fromCenterX, fromCenterY;
  if (fromNode.type && ['root', 'branch', 'leaf'].includes(fromNode.type)) {
    fromCenterX = fromNode.x;
    fromCenterY = fromNode.y;
  } else {
    fromCenterX = fromNode.x + fromNode.width / 2;
    fromCenterY = fromNode.y + fromNode.height / 2;
  }

  // Calculate direction vector (FROM source TO target)
  const dx = nodeCenterX - fromCenterX;
  const dy = nodeCenterY - fromCenterY;

  // For flowcharts, strongly prefer top connections on target nodes
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  
  // Strong preference for top connections in flow diagrams
  if (dy > 0 && absY > absX * 0.3) {
    // Coming from above - connect to top (center-top)
    return {
      x: nodeCenterX,
      y: nodeTop
    };
  } else if (dy < 0 && absY > absX * 0.3) {
    // Coming from below - connect to bottom (center-bottom)
    return {
      x: nodeCenterX,
      y: nodeBottom
    };
  } else if (dx > 0) {
    // Coming from left - connect to left side (center-left)
    return {
      x: nodeLeft,
      y: nodeCenterY
    };
  } else {
    // Coming from right - connect to right side (center-right)
    return {
      x: nodeRight,
      y: nodeCenterY
    };
  }
}

/**
 * Calculate connection points for two nodes with smart border detection
 */
export function getConnectionPoints(fromNode: NodeBounds, toNode: NodeBounds): { from: Point; to: Point } {
  const fromPoint = getNodeConnectionPoint(fromNode, toNode);
  const toPoint = getTargetConnectionPoint(toNode, fromNode);

  return { from: fromPoint, to: toPoint };
}

/**
 * Generate path points for orthogonal routing (good for flow diagrams)
 */
export function getOrthogonalPath(from: Point, to: Point, routingStyle: 'direct' | 'horizontal-first' | 'vertical-first' = 'horizontal-first'): Point[] {
  if (routingStyle === 'direct') {
    return [from, to];
  }

  const midX = from.x + (to.x - from.x) / 2;
  const midY = from.y + (to.y - from.y) / 2;

  if (routingStyle === 'horizontal-first') {
    // Go horizontal first, then vertical
    return [
      from,
      { x: midX, y: from.y },
      { x: midX, y: to.y },
      to
    ];
  } else {
    // Go vertical first, then horizontal
    return [
      from,
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to
    ];
  }
}

/**
 * Simple orthogonal routing similar to Mermaid/PlantUML
 * Uses clean L-shaped or 3-segment paths without complex collision detection
 */
export function getMermaidStylePath(from: Point, to: Point): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Use different routing based on relative positions
  const isVerticalDistance = Math.abs(dy) > Math.abs(dx);
  
  // Simple 3-point path for most connections
  if (isVerticalDistance) {
    // Primarily vertical movement - use horizontal middle segment
    const midY = from.y + dy * 0.5;
    return [
      from,
      { x: from.x, y: midY },
      { x: to.x, y: midY },
      to
    ];
  } else {
    // Primarily horizontal movement - use vertical middle segment  
    const midX = from.x + dx * 0.5;
    return [
      from,
      { x: midX, y: from.y },
      { x: midX, y: to.y },
      to
    ];
  }
}

/**
 * Enhanced Mermaid-style routing with spacing for parallel edges
 */
export function getMermaidStylePathWithSpacing(
  from: Point, 
  to: Point, 
  edgeIndex: number = 0,
  totalParallelEdges: number = 1
): Point[] {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  // Calculate offset for parallel edges
  const spacing = 20;
  const offset = totalParallelEdges > 1 ? 
    (edgeIndex - (totalParallelEdges - 1) / 2) * spacing : 0;
  
  const isVerticalDistance = Math.abs(dy) > Math.abs(dx);
  
  if (isVerticalDistance) {
    // Vertical routing with horizontal offset for parallel edges
    const midY = from.y + dy * 0.5;
    return [
      from,
      { x: from.x, y: midY },
      { x: to.x + offset, y: midY },
      { x: to.x, y: midY },
      to
    ];
  } else {
    // Horizontal routing with vertical offset for parallel edges
    const midX = from.x + dx * 0.5;
    return [
      from,
      { x: midX, y: from.y },
      { x: midX, y: to.y + offset },
      { x: midX, y: to.y },
      to
    ];
  }
}

/**
 * Calculate curved path for better visual appeal (good for mind maps)
 */
export function getCurvedPath(from: Point, to: Point): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Control point offset (adjust curve intensity)
  const controlOffset = Math.min(distance * 0.3, 50);
  
  // Calculate control points for smooth curve
  const midX = from.x + dx / 2;
  const midY = from.y + dy / 2;
  
  // Perpendicular offset for curve
  const perpX = -dy / distance * controlOffset;
  const perpY = dx / distance * controlOffset;
  
  const controlX = midX + perpX;
  const controlY = midY + perpY;

  return `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`;
}

/**
 * Create SVG path string from array of points
 */
export function createPathFromPoints(points: Point[]): string {
  if (points.length < 2) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return path;
}

/**
 * Calculate arrow head position and rotation for a given direction
 */
export function getArrowTransform(from: Point, to: Point): { x: number; y: number; rotation: number } {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
  return {
    x: to.x,
    y: to.y,
    rotation: angle
  };
}