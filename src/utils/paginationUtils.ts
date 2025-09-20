// Pagination utilities for splitting large diagrams across multiple pages

export interface PageInfo {
  pageNumber: number;
  totalPages: number;
  nodes: any[];
  edges: any[];
  viewBox: { x: number; y: number; width: number; height: number };
  title: string;
}

export interface PaginationConfig {
  maxWidth?: number;
  maxHeight?: number;
  overlapMargin?: number;
  preferredBreakPoints?: 'layers' | 'clusters' | 'grid';
  showPageNumbers?: boolean;
  showContinuationIndicators?: boolean;
}

/**
 * Splits a large diagram into multiple pages based on content bounds
 */
export function paginateDiagram(
  nodes: any[],
  edges: any[],
  diagramType: string,
  config: PaginationConfig = {}
): PageInfo[] {
  const {
    maxWidth = 1200,
    maxHeight = 900,
    overlapMargin = 100,
    preferredBreakPoints = 'layers',
    // showPageNumbers = true,
    // showContinuationIndicators = true
  } = config;

  // Calculate overall diagram bounds
  const bounds = calculateDiagramBounds(nodes);
  
  // Check if pagination is needed
  if (bounds.width <= maxWidth && bounds.height <= maxHeight) {
    return [{
      pageNumber: 1,
      totalPages: 1,
      nodes,
      edges,
      viewBox: { x: bounds.minX - 50, y: bounds.minY - 50, width: bounds.width + 100, height: bounds.height + 100 },
      title: `${diagramType} Diagram`
    }];
  }

  // Choose pagination strategy based on diagram type and preference
  switch (diagramType) {
    case 'class':
      return paginateClassDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin);
    case 'flow':
      return paginateFlowDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin, preferredBreakPoints);
    case 'sequence':
      return paginateSequenceDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin);
    case 'mindmap':
      return paginateMindmapDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin);
    case 'usecase':
      return paginateUsecaseDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin);
    default:
      return paginateGenericDiagram(nodes, edges, maxWidth, maxHeight, overlapMargin);
  }
}

/**
 * Calculate the bounding box of all nodes
 */
function calculateDiagramBounds(nodes: any[]) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  nodes.forEach(node => {
    const left = node.x;
    const right = node.x + (node.width || 120);
    const top = node.y;
    const bottom = node.y + (node.height || 60);

    minX = Math.min(minX, left);
    maxX = Math.max(maxX, right);
    minY = Math.min(minY, top);
    maxY = Math.max(maxY, bottom);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

/**
 * Paginate class diagrams by grouping related classes
 */
function paginateClassDiagram(
  nodes: any[],
  edges: any[],
  maxWidth: number,
  maxHeight: number,
  _overlapMargin: number
): PageInfo[] {
  // Group nodes into layers/clusters based on inheritance and relationships
  const clusters = groupClassesByClusters(nodes, edges);
  const pages: PageInfo[] = [];
  
  let currentPage: any[] = [];
  let currentBounds = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };

  clusters.forEach(cluster => {
    const clusterBounds = calculateDiagramBounds(cluster);
    
    // Check if adding this cluster would exceed page bounds
    const newMinX = Math.min(currentBounds.minX, clusterBounds.minX);
    const newMaxX = Math.max(currentBounds.maxX, clusterBounds.maxX);
    const newMinY = Math.min(currentBounds.minY, clusterBounds.minY);
    const newMaxY = Math.max(currentBounds.maxY, clusterBounds.maxY);
    
    const newWidth = newMaxX - newMinX;
    const newHeight = newMaxY - newMinY;

    if (currentPage.length > 0 && (newWidth > maxWidth || newHeight > maxHeight)) {
      // Create page with current nodes
      pages.push(createPageInfo(currentPage, edges, pages.length + 1, 0, 'Class Diagram'));
      currentPage = [...cluster];
      currentBounds = clusterBounds;
    } else {
      // Add cluster to current page
      currentPage.push(...cluster);
      currentBounds = { minX: newMinX, minY: newMinY, maxX: newMaxX, maxY: newMaxY };
    }
  });

  // Add remaining nodes to final page
  if (currentPage.length > 0) {
    pages.push(createPageInfo(currentPage, edges, pages.length + 1, 0, 'Class Diagram'));
  }

  // Update total pages count
  pages.forEach(page => page.totalPages = pages.length);
  
  return pages;
}

/**
 * Paginate flow diagrams by layers (top-down flow)
 */
function paginateFlowDiagram(
  nodes: any[],
  edges: any[],
  maxWidth: number,
  maxHeight: number,
  _overlapMargin: number,
  preferredBreakPoints: string
): PageInfo[] {
  if (preferredBreakPoints === 'layers') {
    return paginateByLayers(nodes, edges, maxWidth, maxHeight, 'Flow Diagram');
  } else {
    return paginateByGrid(nodes, edges, maxWidth, maxHeight, 'Flow Diagram');
  }
}

/**
 * Paginate sequence diagrams by message groups
 */
function paginateSequenceDiagram(
  nodes: any[],
  edges: any[],
  _maxWidth: number,
  maxHeight: number,
  _overlapMargin: number
): PageInfo[] {
  // For sequence diagrams, split by message count rather than spatial bounds
  const messagesPerPage = Math.floor((maxHeight - 200) / 60); // Assuming 60px per message
  const pages: PageInfo[] = [];
  
  // All actors appear on every page
  const actors = nodes.filter(node => node.type === 'actor');
  
  // Split messages into chunks
  for (let i = 0; i < edges.length; i += messagesPerPage) {
    const pageMessages = edges.slice(i, i + messagesPerPage);
    pages.push(createPageInfo(actors, pageMessages, pages.length + 1, 0, 'Sequence Diagram'));
  }
  
  // Update total pages count
  pages.forEach(page => page.totalPages = pages.length);
  
  return pages;
}

/**
 * Paginate mindmap diagrams by radial sections
 */
function paginateMindmapDiagram(
  nodes: any[],
  edges: any[],
  maxWidth: number,
  maxHeight: number,
  _overlapMargin: number
): PageInfo[] {
  // Find root node
  const rootNode = nodes.find(node => node.type === 'root') || nodes[0];
  
  // Group nodes by distance from root
  const levels = groupNodesByLevel(nodes, edges, rootNode.id);
  
  return paginateByLevels(levels, edges, maxWidth, maxHeight, 'Mindmap');
}

/**
 * Paginate usecase diagrams by actor groups
 */
function paginateUsecaseDiagram(
  nodes: any[],
  edges: any[],
  maxWidth: number,
  maxHeight: number,
  overlapMargin: number
): PageInfo[] {
  const actors = nodes.filter(node => node.type === 'actor');
  const usecases = nodes.filter(node => node.type === 'usecase');
  
  // Group use cases by related actors
  const actorGroups = groupUsecasesByActors(actors, usecases, edges);
  
  return paginateActorGroups(actorGroups, edges, maxWidth, maxHeight, 'Use Case Diagram');
}

/**
 * Generic grid-based pagination for other diagram types
 */
function paginateGenericDiagram(
  nodes: any[],
  edges: any[],
  maxWidth: number,
  maxHeight: number,
  _overlapMargin: number
): PageInfo[] {
  return paginateByGrid(nodes, edges, maxWidth, maxHeight, 'Diagram');
}

// Helper functions

function groupClassesByClusters(nodes: any[], edges: any[]): any[][] {
  // Group classes by inheritance and association relationships
  const clusters: any[][] = [];
  const visited = new Set<string>();
  
  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      const cluster = [node];
      visited.add(node.id);
      
      // Find related classes through edges
      const relatedIds = findRelatedNodes(node.id, edges);
      relatedIds.forEach(id => {
        const relatedNode = nodes.find(n => n.id === id);
        if (relatedNode && !visited.has(id)) {
          cluster.push(relatedNode);
          visited.add(id);
        }
      });
      
      clusters.push(cluster);
    }
  });
  
  return clusters;
}

function findRelatedNodes(nodeId: string, edges: any[]): string[] {
  const related = new Set<string>();
  
  edges.forEach(edge => {
    if (edge.from === nodeId) {
      related.add(edge.to);
    } else if (edge.to === nodeId) {
      related.add(edge.from);
    }
  });
  
  return Array.from(related);
}

function paginateByLayers(nodes: any[], edges: any[], maxWidth: number, maxHeight: number, title: string): PageInfo[] {
  // Sort nodes by Y position to identify layers
  const sortedNodes = [...nodes].sort((a, b) => a.y - b.y);
  const layers: any[][] = [];
  let currentLayer: any[] = [];
  let currentY = -Infinity;
  
  sortedNodes.forEach(node => {
    if (Math.abs(node.y - currentY) > 30) { // New layer threshold
      if (currentLayer.length > 0) {
        layers.push(currentLayer);
      }
      currentLayer = [node];
      currentY = node.y;
    } else {
      currentLayer.push(node);
    }
  });
  
  if (currentLayer.length > 0) {
    layers.push(currentLayer);
  }
  
  return paginateByLevels(layers, edges, maxWidth, maxHeight, title);
}

function paginateByGrid(nodes: any[], edges: any[], maxWidth: number, maxHeight: number, title: string): PageInfo[] {
  const bounds = calculateDiagramBounds(nodes);
  const pages: PageInfo[] = [];
  
  // Calculate grid dimensions
  const pagesX = Math.ceil(bounds.width / maxWidth);
  const pagesY = Math.ceil(bounds.height / maxHeight);
  
  for (let py = 0; py < pagesY; py++) {
    for (let px = 0; px < pagesX; px++) {
      const pageMinX = bounds.minX + px * maxWidth;
      const pageMaxX = pageMinX + maxWidth;
      const pageMinY = bounds.minY + py * maxHeight;
      const pageMaxY = pageMinY + maxHeight;
      
      // Find nodes that intersect with this page
      const pageNodes = nodes.filter(node => {
        const nodeRight = node.x + (node.width || 120);
        const nodeBottom = node.y + (node.height || 60);
        
        return !(node.x > pageMaxX || nodeRight < pageMinX || 
                node.y > pageMaxY || nodeBottom < pageMinY);
      });
      
      if (pageNodes.length > 0) {
        pages.push(createPageInfo(pageNodes, edges, pages.length + 1, 0, title));
      }
    }
  }
  
  // Update total pages count
  pages.forEach(page => page.totalPages = pages.length);
  
  return pages;
}

function paginateByLevels(levels: any[][], edges: any[], _maxWidth: number, maxHeight: number, title: string): PageInfo[] {
  const pages: PageInfo[] = [];
  let currentPage: any[] = [];
  let currentHeight = 0;
  
  levels.forEach(level => {
    const levelBounds = calculateDiagramBounds(level);
    
    if (currentPage.length > 0 && (currentHeight + levelBounds.height > maxHeight)) {
      pages.push(createPageInfo(currentPage, edges, pages.length + 1, 0, title));
      currentPage = [...level];
      currentHeight = levelBounds.height;
    } else {
      currentPage.push(...level);
      currentHeight += levelBounds.height;
    }
  });
  
  if (currentPage.length > 0) {
    pages.push(createPageInfo(currentPage, edges, pages.length + 1, 0, title));
  }
  
  // Update total pages count
  pages.forEach(page => page.totalPages = pages.length);
  
  return pages;
}

function groupNodesByLevel(nodes: any[], edges: any[], rootId: string): any[][] {
  const levels: any[][] = [];
  const visited = new Set<string>();
  const queue: Array<{node: any, level: number}> = [];
  
  const rootNode = nodes.find(n => n.id === rootId);
  if (rootNode) {
    queue.push({node: rootNode, level: 0});
  }
  
  while (queue.length > 0) {
    const {node, level} = queue.shift()!;
    
    if (visited.has(node.id)) continue;
    visited.add(node.id);
    
    // Ensure level array exists
    while (levels.length <= level) {
      levels.push([]);
    }
    
    levels[level].push(node);
    
    // Add children to next level
    edges.forEach(edge => {
      if (edge.from === node.id) {
        const childNode = nodes.find(n => n.id === edge.to);
        if (childNode && !visited.has(childNode.id)) {
          queue.push({node: childNode, level: level + 1});
        }
      }
    });
  }
  
  return levels;
}

function groupUsecasesByActors(_actors: any[], usecases: any[], _edges: any[]): any[][] {
  // Implementation for grouping use cases by actors
  return [usecases]; // Simplified for now
}

function paginateActorGroups(groups: any[][], edges: any[], _maxWidth: number, _maxHeight: number, title: string): PageInfo[] {
  // Implementation for paginating actor groups
  return groups.map((group, index) => createPageInfo(group, edges, index + 1, groups.length, title));
}

function createPageInfo(nodes: any[], edges: any[], pageNumber: number, totalPages: number, title: string): PageInfo {
  const bounds = calculateDiagramBounds(nodes);
  const padding = 50;
  
  // Filter edges to only include those connecting nodes on this page
  const nodeIds = new Set(nodes.map(n => n.id));
  const pageEdges = edges.filter(edge => 
    nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );
  
  return {
    pageNumber,
    totalPages,
    nodes,
    edges: pageEdges,
    viewBox: {
      x: bounds.minX - padding,
      y: bounds.minY - padding,
      width: bounds.width + 2 * padding,
      height: bounds.height + 2 * padding
    },
    title: `${title} - Page ${pageNumber}`
  };
}