import type { DiagramData, DiagramConfig, DiagramNode, DiagramEdge } from '../../types/diagram';
import { getConnectionPoints, getOrthogonalPath, getCurvedPath, createPathFromPoints } from '../../utils/edgeUtils';

export class SVGRenderer {
  static render(svg: SVGElement, data: DiagramData, config: DiagramConfig) {
    // Clear existing content
    svg.innerHTML = '';

    // Add definitions for markers and gradients
    this.addDefinitions(svg, config);

    // Create main group
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'diagram-content');
    svg.appendChild(group);

    // Render based on diagram type
    switch (config.type) {
      case 'class':
        this.renderClassDiagram(group, data, config);
        break;
      case 'sequence':
        this.renderSequenceDiagram(group, data, config);
        break;
      case 'flow':
        this.renderFlowDiagram(group, data, config);
        break;
      case 'usecase':
        this.renderUsecaseDiagram(group, data, config);
        break;
      case 'mindmap':
        this.renderMindmapDiagram(group, data, config);
        break;
      default:
        this.renderGenericDiagram(group, data, config);
    }
  }

  private static addDefinitions(svg: SVGElement, config: DiagramConfig) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    
    // Arrow marker
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,0 L0,6 L9,3 z');
    path.setAttribute('fill', config.theme === 'dark' ? '#e5e7eb' : '#374151');
    marker.appendChild(path);
    
    defs.appendChild(marker);
    svg.appendChild(defs);
  }

  private static renderClassDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    const nodeColor = config.theme === 'dark' ? '#374151' : '#f9fafb';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const borderColor = config.theme === 'dark' ? '#6b7280' : '#d1d5db';

    // Render nodes
    data.nodes.forEach(node => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', 'class-node');
      
      // Background rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x.toString());
      rect.setAttribute('y', node.y.toString());
      rect.setAttribute('width', node.width.toString());
      rect.setAttribute('height', node.height.toString());
      rect.setAttribute('fill', nodeColor);
      rect.setAttribute('stroke', borderColor);
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '8');
      nodeGroup.appendChild(rect);

      // Class name
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      title.setAttribute('x', (node.x + node.width / 2).toString());
      title.setAttribute('y', (node.y + 20).toString());
      title.setAttribute('text-anchor', 'middle');
      title.setAttribute('fill', textColor);
      title.setAttribute('font-weight', 'bold');
      title.setAttribute('font-size', '14');
      title.textContent = node.label;
      nodeGroup.appendChild(title);

      // Separator line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', (node.x + 10).toString());
      line.setAttribute('y1', (node.y + 30).toString());
      line.setAttribute('x2', (node.x + node.width - 10).toString());
      line.setAttribute('y2', (node.y + 30).toString());
      line.setAttribute('stroke', borderColor);
      nodeGroup.appendChild(line);

      // Attributes and methods
      let yOffset = 50;
      if (node.data && node.data.attributes) {
        node.data.attributes.forEach((attr: any) => {
          const attrText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          attrText.setAttribute('x', (node.x + 10).toString());
          attrText.setAttribute('y', (node.y + yOffset).toString());
          attrText.setAttribute('fill', textColor);
          attrText.setAttribute('font-size', '12');
          attrText.textContent = `${attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+'} ${attr.name}: ${attr.type}`;
          nodeGroup.appendChild(attrText);
          yOffset += 16;
        });
      }

      // Add separator line before methods if there are both attributes and methods
      if (node.data && node.data.attributes && node.data.attributes.length > 0 && node.data.methods && node.data.methods.length > 0) {
        const methodSeparator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        methodSeparator.setAttribute('x1', (node.x + 10).toString());
        methodSeparator.setAttribute('y1', (node.y + yOffset + 5).toString());
        methodSeparator.setAttribute('x2', (node.x + node.width - 10).toString());
        methodSeparator.setAttribute('y2', (node.y + yOffset + 5).toString());
        methodSeparator.setAttribute('stroke', borderColor);
        nodeGroup.appendChild(methodSeparator);
        yOffset += 15;
      }

      // Render methods
      if (node.data && node.data.methods) {
        node.data.methods.forEach((method: any) => {
          const methodText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          methodText.setAttribute('x', (node.x + 10).toString());
          methodText.setAttribute('y', (node.y + yOffset).toString());
          methodText.setAttribute('fill', textColor);
          methodText.setAttribute('font-size', '12');
          const params = method.parameters ? method.parameters.map((p: any) => `${p.name}: ${p.type}`).join(', ') : '';
          methodText.textContent = `${method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+'} ${method.name}(${params}): ${method.returnType}`;
          nodeGroup.appendChild(methodText);
          yOffset += 16;
        });
      }

      group.appendChild(nodeGroup);
    });

    // Render edges
    this.renderEdges(group, data.nodes, data.edges, config, 'direct');
  }

  private static renderSequenceDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    const actorColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const lifelineColor = config.theme === 'dark' ? '#6b7280' : '#9ca3af';

    // Calculate diagram height based on number of messages
    const baseY = 120;
    const stepY = 60;
    const messageCount = data.edges.length;
    const diagramHeight = Math.max(600, baseY + messageCount * stepY + 100);

    // Render actors
    data.nodes.forEach(node => {
      const actorGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Actor box with enhanced styling
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', node.x.toString());
      rect.setAttribute('y', node.y.toString());
      rect.setAttribute('width', node.width.toString());
      rect.setAttribute('height', node.height.toString());
      rect.setAttribute('fill', actorColor);
      rect.setAttribute('stroke', '#6b7280');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '8');
      actorGroup.appendChild(rect);

      // Actor name with better typography
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (node.x + node.width / 2).toString());
      text.setAttribute('y', (node.y + node.height / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', textColor);
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', '600');
      text.textContent = node.label;
      actorGroup.appendChild(text);

      // Extended lifeline that goes to the bottom of the diagram
      const lifeline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      lifeline.setAttribute('x1', (node.x + node.width / 2).toString());
      lifeline.setAttribute('y1', (node.y + node.height).toString());
      lifeline.setAttribute('x2', (node.x + node.width / 2).toString());
      lifeline.setAttribute('y2', diagramHeight.toString());
      lifeline.setAttribute('stroke', lifelineColor);
      lifeline.setAttribute('stroke-width', '2');
      lifeline.setAttribute('stroke-dasharray', '8,4');
      actorGroup.appendChild(lifeline);

      // Add actor box at the bottom for longer sequences
      if (messageCount > 5) {
        const bottomRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bottomRect.setAttribute('x', node.x.toString());
        bottomRect.setAttribute('y', (diagramHeight - 50).toString());
        bottomRect.setAttribute('width', node.width.toString());
        bottomRect.setAttribute('height', node.height.toString());
        bottomRect.setAttribute('fill', actorColor);
        bottomRect.setAttribute('stroke', '#6b7280');
        bottomRect.setAttribute('stroke-width', '2');
        bottomRect.setAttribute('rx', '8');
        actorGroup.appendChild(bottomRect);

        const bottomText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        bottomText.setAttribute('x', (node.x + node.width / 2).toString());
        bottomText.setAttribute('y', (diagramHeight - 50 + node.height / 2 + 5).toString());
        bottomText.setAttribute('text-anchor', 'middle');
        bottomText.setAttribute('fill', textColor);
        bottomText.setAttribute('font-size', '14');
        bottomText.setAttribute('font-weight', '600');
        bottomText.textContent = node.label;
        actorGroup.appendChild(bottomText);
      }

      group.appendChild(actorGroup);
    });

    // Render messages with enhanced styling
    const lineColor = config.theme === 'dark' ? '#6b7280' : '#374151';
    const nodeMap = new Map<string, DiagramNode>(data.nodes.map(n => [n.id, n]));
    
    data.edges.forEach((edge, idx) => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;
      
      const y = baseY + ((edge as any).data?.order ?? idx) * stepY;
      const fromX = fromNode.x + fromNode.width / 2;
      const toX = toNode.x + toNode.width / 2;
      const isReflexive = fromNode.id === toNode.id;

      if (isReflexive) {
        // Self-message with curved arrow
        const loopWidth = 30;
        const loopHeight = 20;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${fromX} ${y} Q ${fromX + loopWidth} ${y - loopHeight} ${fromX + loopWidth} ${y} Q ${fromX + loopWidth} ${y + loopHeight} ${fromX} ${y + 10}`;
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', lineColor);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('fill', 'none');
        path.setAttribute('marker-end', 'url(#arrow)');
        group.appendChild(path);
      } else {
        // Regular message line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', Math.min(fromX, toX).toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', Math.max(fromX, toX).toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', lineColor);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('marker-end', 'url(#arrow)');
        
        if (edge.type === 'async') {
          line.setAttribute('stroke-dasharray', '8,4');
        }
        group.appendChild(line);
      }

      // Enhanced message label
      if (edge.label) {
        const labelX = isReflexive ? fromX + 35 : (fromX + toX) / 2;
        const labelY = isReflexive ? y - 10 : y - 8;
        
        // Background rectangle for better readability
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = edge.label.length * 7;
        bgRect.setAttribute('x', (labelX - textWidth / 2 - 4).toString());
        bgRect.setAttribute('y', (labelY - 14).toString());
        bgRect.setAttribute('width', (textWidth + 8).toString());
        bgRect.setAttribute('height', '18');
        bgRect.setAttribute('fill', config.theme === 'dark' ? '#1f2937' : '#ffffff');
        bgRect.setAttribute('stroke', config.theme === 'dark' ? '#374151' : '#e5e7eb');
        bgRect.setAttribute('rx', '3');
        group.appendChild(bgRect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX.toString());
        text.setAttribute('y', labelY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', '500');
        text.textContent = edge.label;
        group.appendChild(text);
      }
    });
  }

  private static renderFlowDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    const nodeColor = config.theme === 'dark' ? '#1f2937' : '#ffffff';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const borderColor = config.theme === 'dark' ? '#6b7280' : '#9ca3af';

    data.nodes.forEach(node => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', `flow-node-${node.type}`);
      
      if (node.type === 'decision') {
        // Enhanced diamond shape for decision nodes
        const diamond = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        const points = [
          [centerX, node.y],
          [node.x + node.width, centerY],
          [centerX, node.y + node.height],
          [node.x, centerY]
        ].map(([x, y]) => `${x},${y}`).join(' ');
        
        diamond.setAttribute('points', points);
        diamond.setAttribute('fill', config.theme === 'dark' ? '#fbbf24' : '#fef3c7');
        diamond.setAttribute('stroke', config.theme === 'dark' ? '#f59e0b' : '#f59e0b');
        diamond.setAttribute('stroke-width', '2');
        diamond.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        nodeGroup.appendChild(diamond);
      } else if (node.type === 'start' || node.type === 'end') {
        // Try using circle instead of ellipse for debugging
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        const radius = Math.min(node.width, node.height) / 2;
        const finalRadius = Math.max(radius, 25); // Minimum radius for visibility
        
        circle.setAttribute('cx', centerX.toString());
        circle.setAttribute('cy', centerY.toString());
        circle.setAttribute('r', finalRadius.toString());
        circle.setAttribute('fill', node.type === 'start' ? 
          (config.theme === 'dark' ? '#10b981' : '#d1fae5') : 
          (config.theme === 'dark' ? '#ef4444' : '#fee2e2'));
        circle.setAttribute('stroke', node.type === 'start' ? '#059669' : '#dc2626');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        
        // Ensure the circle is fully visible
        circle.setAttribute('opacity', '1');
        circle.setAttribute('vector-effect', 'non-scaling-stroke');
        nodeGroup.appendChild(circle);
      } else if (node.type === 'process') {
        // Enhanced rectangle for process nodes
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x.toString());
        rect.setAttribute('y', node.y.toString());
        rect.setAttribute('width', node.width.toString());
        rect.setAttribute('height', node.height.toString());
        rect.setAttribute('fill', config.theme === 'dark' ? '#3b82f6' : '#dbeafe');
        rect.setAttribute('stroke', '#2563eb');
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '8');
        rect.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        nodeGroup.appendChild(rect);
      } else if (node.type === 'input' || node.type === 'output') {
        // Parallelogram for input/output
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const offset = 15;
        const pathData = `M ${node.x + offset} ${node.y} L ${node.x + node.width} ${node.y} L ${node.x + node.width - offset} ${node.y + node.height} L ${node.x} ${node.y + node.height} Z`;
        path.setAttribute('d', pathData);
        path.setAttribute('fill', config.theme === 'dark' ? '#8b5cf6' : '#ede9fe');
        path.setAttribute('stroke', '#7c3aed');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        nodeGroup.appendChild(path);
      } else {
        // Default rectangle for other nodes
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', node.x.toString());
        rect.setAttribute('y', node.y.toString());
        rect.setAttribute('width', node.width.toString());
        rect.setAttribute('height', node.height.toString());
        rect.setAttribute('fill', nodeColor);
        rect.setAttribute('stroke', borderColor);
        rect.setAttribute('stroke-width', '2');
        rect.setAttribute('rx', '8');
        rect.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        nodeGroup.appendChild(rect);
      }

      // Enhanced node label with better typography
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (node.x + node.width / 2).toString());
      text.setAttribute('y', (node.y + node.height / 2 + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', textColor);
      text.setAttribute('font-size', '12');
      text.setAttribute('font-weight', '600');
      
      // Handle multi-line text for longer labels
      const words = node.label.split(' ');
      const maxWidth = node.width - 10;
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length * 7 <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);
      
      if (lines.length === 1) {
        text.textContent = lines[0];
        nodeGroup.appendChild(text);
      } else {
        // Multi-line text
        const lineHeight = 14;
        const startY = node.y + node.height / 2 - (lines.length - 1) * lineHeight / 2;
        
        lines.forEach((line, index) => {
          const lineText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          lineText.setAttribute('x', (node.x + node.width / 2).toString());
          lineText.setAttribute('y', (startY + index * lineHeight).toString());
          lineText.setAttribute('text-anchor', 'middle');
          lineText.setAttribute('fill', textColor);
          lineText.setAttribute('font-size', '11');
          lineText.setAttribute('font-weight', '600');
          lineText.textContent = line;
          nodeGroup.appendChild(lineText);
        });
      }

      group.appendChild(nodeGroup);
    });

    this.renderEnhancedFlowEdges(group, data.nodes, data.edges, config);
  }

  private static renderEnhancedFlowEdges(
    group: SVGElement,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    config: DiagramConfig
  ) {
    const lineColor = config.theme === 'dark' ? '#6b7280' : '#374151';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const nodeMap = new Map<string, DiagramNode>(nodes.map(n => [n.id, n]));

    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;

      // Get intelligent connection points
      const { from: fromPoint, to: toPoint } = getConnectionPoints(fromNode, toNode);

      // Use enhanced Mermaid-style routing with decision logic and collision avoidance
      const pathPoints = this.getEnhancedFlowPath(fromPoint, toPoint, fromNode, toNode, nodes);
      const pathData = createPathFromPoints(pathPoints);
      
      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', pathData);
      pathElement.setAttribute('stroke', lineColor);
      pathElement.setAttribute('stroke-width', '2');
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('marker-end', 'url(#arrow)');
      
      // Special styling for decision branches
      if (fromNode.type === 'decision') {
        if (edge.label?.toLowerCase().includes('yes') || edge.label?.toLowerCase().includes('true')) {
          pathElement.setAttribute('stroke', '#059669');
          pathElement.setAttribute('stroke-width', '2.5');
        } else if (edge.label?.toLowerCase().includes('no') || edge.label?.toLowerCase().includes('false')) {
          pathElement.setAttribute('stroke', '#dc2626');
          pathElement.setAttribute('stroke-width', '2.5');
        }
      }

      group.appendChild(pathElement);

      // Enhanced edge label with conditional coloring
      if (edge.label) {
        const midIndex = Math.floor(pathPoints.length / 2);
        const labelPoint = pathPoints[midIndex] || { x: (fromPoint.x + toPoint.x) / 2, y: (fromPoint.y + toPoint.y) / 2 };
        
        // Background for better readability
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = edge.label.length * 7;
        bgRect.setAttribute('x', (labelPoint.x - textWidth / 2 - 4).toString());
        bgRect.setAttribute('y', (labelPoint.y - 16).toString());
        bgRect.setAttribute('width', (textWidth + 8).toString());
        bgRect.setAttribute('height', '18');
        bgRect.setAttribute('fill', config.theme === 'dark' ? '#1f2937' : '#ffffff');
        bgRect.setAttribute('stroke', config.theme === 'dark' ? '#374151' : '#e5e7eb');
        bgRect.setAttribute('rx', '4');
        bgRect.setAttribute('filter', 'drop-shadow(1px 1px 2px rgba(0,0,0,0.1))');
        group.appendChild(bgRect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelPoint.x.toString());
        text.setAttribute('y', (labelPoint.y - 6).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '10');
        text.setAttribute('font-weight', '600');
        text.textContent = edge.label;
        group.appendChild(text);
      }
    });
  }

  private static getEnhancedFlowPath(
    fromPoint: { x: number; y: number },
    toPoint: { x: number; y: number },
    fromNode: DiagramNode,
    toNode: DiagramNode,
    allNodes?: DiagramNode[]
  ): { x: number; y: number }[] {
    const points: { x: number; y: number }[] = [fromPoint];
    
    const deltaX = toPoint.x - fromPoint.x;
    const deltaY = toPoint.y - fromPoint.y;
    
    // Check for potential node collisions and adjust routing
    const addCollisionAvoidance = (midX: number, midY: number) => {
      if (allNodes) {
        for (const node of allNodes) {
          if (node.id === fromNode.id || node.id === toNode.id) continue;
          
          // Check if path might cross through this node
          const nodeBuffer = 20; // Buffer around nodes
          const nodeArea = {
            left: node.x - nodeBuffer,
            right: node.x + node.width + nodeBuffer,
            top: node.y - nodeBuffer,
            bottom: node.y + node.height + nodeBuffer
          };
          
          // If midpoint is near a node, adjust the path
          if (midX >= nodeArea.left && midX <= nodeArea.right && 
              midY >= nodeArea.top && midY <= nodeArea.bottom) {
            // Route around the node
            if (deltaY > 0) {
              // Going downward - route around the bottom
              return { x: midX, y: nodeArea.bottom + 10 };
            } else {
              // Going upward - route around the top
              return { x: midX, y: nodeArea.top - 10 };
            }
          }
        }
      }
      return { x: midX, y: midY };
    };
    
    // For decision nodes, use more sophisticated routing
    if (fromNode.type === 'decision') {
      // Decision nodes should primarily route vertically down for better flow
      if (Math.abs(deltaY) > 30) {
        // If there's significant vertical distance, route straight down then across
        const midY = fromPoint.y + Math.abs(deltaY) * 0.4;
        const adjustedMid = addCollisionAvoidance(fromPoint.x, midY);
        points.push(adjustedMid);
        points.push({ x: toPoint.x, y: adjustedMid.y });
      } else {
        // For horizontal branches from decisions, route out then down
        const midX = fromPoint.x + deltaX * 0.7;
        const adjustedMid = addCollisionAvoidance(midX, fromPoint.y);
        points.push(adjustedMid);
        points.push({ x: adjustedMid.x, y: toPoint.y });
      }
    } else {
      // For other nodes, prefer vertical-first routing for better flowchart flow
      if (Math.abs(deltaY) > Math.abs(deltaX) * 0.5) {
        // Primarily vertical movement - route down first
        const midY = fromPoint.y + deltaY * 0.6;
        const adjustedMid = addCollisionAvoidance(fromPoint.x, midY);
        points.push(adjustedMid);
        points.push({ x: toPoint.x, y: adjustedMid.y });
      } else {
        // Horizontal movement - route across first with collision avoidance
        const midX = fromPoint.x + deltaX * 0.5;
        const adjustedMid = addCollisionAvoidance(midX, fromPoint.y);
        points.push(adjustedMid);
        points.push({ x: adjustedMid.x, y: toPoint.y });
      }
    }
    
    points.push(toPoint);
    return points;
  }

  private static renderUsecaseDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    const usecaseColor = config.theme === 'dark' ? '#3b82f6' : '#dbeafe';
    const systemBoundaryColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const borderColor = config.theme === 'dark' ? '#6b7280' : '#9ca3af';

    // Add system boundary first (behind other elements)
    const usecaseNodes = data.nodes.filter(node => node.type === 'usecase');
    if (usecaseNodes.length > 0) {
      const minX = Math.min(...usecaseNodes.map(n => n.x)) - 50;
      const maxX = Math.max(...usecaseNodes.map(n => n.x + n.width)) + 50;
      const minY = Math.min(...usecaseNodes.map(n => n.y)) - 30;
      const maxY = Math.max(...usecaseNodes.map(n => n.y + n.height)) + 30;
      
      const systemBoundary = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      systemBoundary.setAttribute('x', minX.toString());
      systemBoundary.setAttribute('y', minY.toString());
      systemBoundary.setAttribute('width', (maxX - minX).toString());
      systemBoundary.setAttribute('height', (maxY - minY).toString());
      systemBoundary.setAttribute('fill', systemBoundaryColor);
      systemBoundary.setAttribute('stroke', borderColor);
      systemBoundary.setAttribute('stroke-width', '2');
      systemBoundary.setAttribute('stroke-dasharray', '8,4');
      systemBoundary.setAttribute('rx', '10');
      systemBoundary.setAttribute('opacity', '0.3');
      group.appendChild(systemBoundary);
      
      // System label
      const systemLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      systemLabel.setAttribute('x', (minX + 10).toString());
      systemLabel.setAttribute('y', (minY + 20).toString());
      systemLabel.setAttribute('fill', textColor);
      systemLabel.setAttribute('font-size', '14');
      systemLabel.setAttribute('font-weight', 'bold');
      systemLabel.textContent = 'System';
      group.appendChild(systemLabel);
    }

    data.nodes.forEach(node => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      nodeGroup.setAttribute('class', `usecase-${node.type}`);
      
      if (node.type === 'actor') {
        // Enhanced actor representation with improved stick figure
        const actorCenterX = node.x + node.width / 2;
        const actorCenterY = node.y + node.height / 2 - 10; // Raise the figure slightly
        
        // Stick figure design with better proportions
        const stickFigure = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Head (larger and better positioned)
        const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        head.setAttribute('cx', actorCenterX.toString());
        head.setAttribute('cy', (actorCenterY - 25).toString());
        head.setAttribute('r', '12');
        head.setAttribute('fill', config.theme === 'dark' ? '#374151' : '#f9fafb');
        head.setAttribute('stroke', borderColor);
        head.setAttribute('stroke-width', '2');
        stickFigure.appendChild(head);
        
        // Body (longer and more proportional)
        const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        body.setAttribute('x1', actorCenterX.toString());
        body.setAttribute('y1', (actorCenterY - 13).toString());
        body.setAttribute('x2', actorCenterX.toString());
        body.setAttribute('y2', (actorCenterY + 15).toString());
        body.setAttribute('stroke', borderColor);
        body.setAttribute('stroke-width', '3');
        body.setAttribute('stroke-linecap', 'round');
        stickFigure.appendChild(body);
        
        // Arms (better angled)
        const leftArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftArm.setAttribute('x1', (actorCenterX - 15).toString());
        leftArm.setAttribute('y1', (actorCenterY - 5).toString());
        leftArm.setAttribute('x2', (actorCenterX + 15).toString());
        leftArm.setAttribute('y2', (actorCenterY - 5).toString());
        leftArm.setAttribute('stroke', borderColor);
        leftArm.setAttribute('stroke-width', '3');
        leftArm.setAttribute('stroke-linecap', 'round');
        stickFigure.appendChild(leftArm);
        
        // Legs (better positioned and angled)
        const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        leftLeg.setAttribute('x1', actorCenterX.toString());
        leftLeg.setAttribute('y1', (actorCenterY + 15).toString());
        leftLeg.setAttribute('x2', (actorCenterX - 12).toString());
        leftLeg.setAttribute('y2', (actorCenterY + 30).toString());
        leftLeg.setAttribute('stroke', borderColor);
        leftLeg.setAttribute('stroke-width', '3');
        leftLeg.setAttribute('stroke-linecap', 'round');
        stickFigure.appendChild(leftLeg);
        
        const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        rightLeg.setAttribute('x1', actorCenterX.toString());
        rightLeg.setAttribute('y1', (actorCenterY + 15).toString());
        rightLeg.setAttribute('x2', (actorCenterX + 12).toString());
        rightLeg.setAttribute('y2', (actorCenterY + 30).toString());
        rightLeg.setAttribute('stroke', borderColor);
        rightLeg.setAttribute('stroke-width', '3');
        rightLeg.setAttribute('stroke-linecap', 'round');
        stickFigure.appendChild(rightLeg);
        
        nodeGroup.appendChild(stickFigure);
        
        // Actor label below the stick figure with better positioning
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', actorCenterX.toString());
        text.setAttribute('y', (node.y + node.height - 5).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', '600');
        text.textContent = node.label;
        nodeGroup.appendChild(text);
        
      } else {
        // Enhanced use case ellipse with better styling
        const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        const centerX = node.x + node.width / 2;
        const centerY = node.y + node.height / 2;
        const radiusX = node.width / 2;
        const radiusY = node.height / 2;
        
        ellipse.setAttribute('cx', centerX.toString());
        ellipse.setAttribute('cy', centerY.toString());
        ellipse.setAttribute('rx', radiusX.toString());
        ellipse.setAttribute('ry', radiusY.toString());
        ellipse.setAttribute('fill', usecaseColor);
        ellipse.setAttribute('stroke', borderColor);
        ellipse.setAttribute('stroke-width', '2');
        ellipse.setAttribute('filter', 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))');
        
        // Add subtle gradient for depth
        const gradientId = `usecase-gradient-${node.id}`;
        const defs = group.ownerDocument?.querySelector('defs') || (() => {
          const newDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          group.ownerDocument?.querySelector('svg')?.appendChild(newDefs);
          return newDefs;
        })();
        
        if (defs) {
          const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
          gradient.setAttribute('id', gradientId);
          gradient.setAttribute('x1', '0%');
          gradient.setAttribute('y1', '0%');
          gradient.setAttribute('x2', '100%');
          gradient.setAttribute('y2', '100%');
          
          const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop1.setAttribute('offset', '0%');
          stop1.setAttribute('stop-color', usecaseColor);
          stop1.setAttribute('stop-opacity', '1');
          
          const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
          stop2.setAttribute('offset', '100%');
          stop2.setAttribute('stop-color', config.theme === 'dark' ? '#1e40af' : '#93c5fd');
          stop2.setAttribute('stop-opacity', '1');
          
          gradient.appendChild(stop1);
          gradient.appendChild(stop2);
          defs.appendChild(gradient);
          
          ellipse.setAttribute('fill', `url(#${gradientId})`);
        }
        
        nodeGroup.appendChild(ellipse);
        
        // Enhanced use case label with better text wrapping
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', centerX.toString());
        text.setAttribute('y', (centerY + 4).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', '500');
        
        // Handle long text by wrapping if necessary
        const maxCharsPerLine = Math.floor(radiusX / 4);
        const words = node.label.split(' ');
        let lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
            currentLine += (currentLine ? ' ' : '') + word;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
        
        if (lines.length === 1) {
          text.textContent = node.label;
          nodeGroup.appendChild(text);
        } else {
          // Multi-line text
          lines.forEach((line, index) => {
            const lineText = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
            lineText.setAttribute('x', centerX.toString());
            lineText.setAttribute('dy', index === 0 ? '0' : '14');
            lineText.textContent = line;
            text.appendChild(lineText);
          });
          text.setAttribute('y', (centerY - (lines.length - 1) * 7 + 4).toString());
          nodeGroup.appendChild(text);
        }
      }

      group.appendChild(nodeGroup);
    });

    // Enhanced edge rendering for use cases
    this.renderUseCaseEdges(group, data.nodes, data.edges, config);
  }

  private static renderUseCaseEdges(
    group: SVGElement,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    config: DiagramConfig
  ) {
    const lineColor = config.theme === 'dark' ? '#6b7280' : '#374151';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const nodeMap = new Map<string, DiagramNode>(nodes.map(n => [n.id, n]));

    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;

      // Calculate connection points based on node types
      let fromPoint: { x: number; y: number };
      let toPoint: { x: number; y: number };

      if (fromNode.type === 'actor') {
        fromPoint = {
          x: fromNode.x + fromNode.width / 2,
          y: fromNode.y + fromNode.height / 2
        };
      } else {
        // For use case ellipses, find edge intersection
        const centerX = fromNode.x + fromNode.width / 2;
        const centerY = fromNode.y + fromNode.height / 2;
        const toCenterX = toNode.x + toNode.width / 2;
        const toCenterY = toNode.y + toNode.height / 2;
        
        const angle = Math.atan2(toCenterY - centerY, toCenterX - centerX);
        fromPoint = {
          x: centerX + (fromNode.width / 2) * Math.cos(angle),
          y: centerY + (fromNode.height / 2) * Math.sin(angle)
        };
      }

      if (toNode.type === 'actor') {
        toPoint = {
          x: toNode.x + toNode.width / 2,
          y: toNode.y + toNode.height / 2
        };
      } else {
        const centerX = toNode.x + toNode.width / 2;
        const centerY = toNode.y + toNode.height / 2;
        const fromCenterX = fromNode.x + fromNode.width / 2;
        const fromCenterY = fromNode.y + fromNode.height / 2;
        
        const angle = Math.atan2(fromCenterY - centerY, fromCenterX - centerX);
        toPoint = {
          x: centerX + (toNode.width / 2) * Math.cos(angle),
          y: centerY + (toNode.height / 2) * Math.sin(angle)
        };
      }

      // Create smooth curved connection
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', fromPoint.x.toString());
      line.setAttribute('y1', fromPoint.y.toString());
      line.setAttribute('x2', toPoint.x.toString());
      line.setAttribute('y2', toPoint.y.toString());
      line.setAttribute('stroke', lineColor);
      line.setAttribute('stroke-width', '2');
      line.setAttribute('fill', 'none');
      
      // Different line styles for different relationship types
      if (edge.type === 'extends') {
        line.setAttribute('stroke-dasharray', '8,4');
        line.setAttribute('marker-end', 'url(#arrow)');
      } else if (edge.type === 'includes') {
        line.setAttribute('stroke-dasharray', '12,2,2,2');
        line.setAttribute('marker-end', 'url(#arrow)');
      } else {
        // Normal association
        line.setAttribute('marker-end', 'url(#arrow)');
      }

      group.appendChild(line);

      // Enhanced edge label with background
      if (edge.label) {
        const labelX = (fromPoint.x + toPoint.x) / 2;
        const labelY = (fromPoint.y + toPoint.y) / 2 - 8;
        
        // Background for better readability
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const textWidth = edge.label.length * 6;
        bgRect.setAttribute('x', (labelX - textWidth / 2 - 3).toString());
        bgRect.setAttribute('y', (labelY - 12).toString());
        bgRect.setAttribute('width', (textWidth + 6).toString());
        bgRect.setAttribute('height', '16');
        bgRect.setAttribute('fill', config.theme === 'dark' ? '#1f2937' : '#ffffff');
        bgRect.setAttribute('stroke', config.theme === 'dark' ? '#374151' : '#e5e7eb');
        bgRect.setAttribute('rx', '2');
        group.appendChild(bgRect);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX.toString());
        text.setAttribute('y', labelY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '9');
        text.setAttribute('font-weight', '500');
        text.textContent = edge.label;
        group.appendChild(text);
      }
    });
  }

  private static renderMindmapDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    const nodeColor = config.theme === 'dark' ? '#374151' : '#f3f4f6';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';

    data.nodes.forEach(node => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Node background
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (node.x - node.width / 2).toString());
      rect.setAttribute('y', (node.y - node.height / 2).toString());
      rect.setAttribute('width', node.width.toString());
      rect.setAttribute('height', node.height.toString());
      rect.setAttribute('fill', nodeColor);
      rect.setAttribute('stroke', '#6b7280');
      rect.setAttribute('rx', '20');
      nodeGroup.appendChild(rect);

      // Node label
  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', node.x.toString());
      text.setAttribute('y', (node.y + 5).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', textColor);
  const level = (node as unknown as { level?: number }).level ?? 1;
  text.setAttribute('font-size', level === 0 ? '16' : '12');
  text.setAttribute('font-weight', level === 0 ? 'bold' : 'normal');
      text.textContent = node.label;
      nodeGroup.appendChild(text);

      group.appendChild(nodeGroup);
    });

    this.renderEdges(group, data.nodes, data.edges, config, 'curved');
  }

  private static renderGenericDiagram(group: SVGElement, data: DiagramData, config: DiagramConfig) {
    // Fallback generic rendering
    this.renderFlowDiagram(group, data, config);
  }

  private static renderEdges(
    group: SVGElement,
    nodes: DiagramNode[],
    edges: DiagramEdge[],
    config: DiagramConfig,
    routingStyle: 'direct' | 'orthogonal' | 'curved' = 'direct'
  ) {
    const lineColor = config.theme === 'dark' ? '#6b7280' : '#374151';
    const textColor = config.theme === 'dark' ? '#e5e7eb' : '#111827';
    const nodeMap = new Map<string, DiagramNode>(nodes.map(n => [n.id, n]));

    edges.forEach(edge => {
      const fromNode = nodeMap.get(edge.from);
      const toNode = nodeMap.get(edge.to);
      if (!fromNode || !toNode) return;

      // Get intelligent connection points
      const { from: fromPoint, to: toPoint } = getConnectionPoints(fromNode, toNode);

      // Create path based on routing style
      let pathElement: SVGElement;
      
      if (routingStyle === 'curved') {
        // Use curved path for organic connections (good for mind maps)
        const pathData = getCurvedPath(fromPoint, toPoint);
        pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', pathData);
      } else if (routingStyle === 'orthogonal') {
        // Use orthogonal routing for structured diagrams (flow charts)
        const pathPoints = getOrthogonalPath(fromPoint, toPoint, 'horizontal-first');
        const pathData = createPathFromPoints(pathPoints);
        pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', pathData);
      } else {
        // Direct line connection
        pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        pathElement.setAttribute('x1', fromPoint.x.toString());
        pathElement.setAttribute('y1', fromPoint.y.toString());
        pathElement.setAttribute('x2', toPoint.x.toString());
        pathElement.setAttribute('y2', toPoint.y.toString());
      }

      pathElement.setAttribute('stroke', lineColor);
      pathElement.setAttribute('stroke-width', '2');
      pathElement.setAttribute('fill', 'none');
      pathElement.setAttribute('marker-end', 'url(#arrow)');

      // Add edge-specific styling
      if (edge.type === 'inheritance') {
        pathElement.setAttribute('stroke-dasharray', '10,5');
      } else if (edge.type === 'async') {
        pathElement.setAttribute('stroke-dasharray', '5,5');
      }

      group.appendChild(pathElement);

      // Add edge label if present
      if (edge.label) {
        const labelX = (fromPoint.x + toPoint.x) / 2;
        const labelY = (fromPoint.y + toPoint.y) / 2 - 6;
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', labelX.toString());
        text.setAttribute('y', labelY.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', textColor);
        text.setAttribute('font-size', '10');
        text.setAttribute('background', config.theme === 'dark' ? '#1f2937' : '#ffffff');
        text.textContent = edge.label;
        group.appendChild(text);
      }
    });
  }
}