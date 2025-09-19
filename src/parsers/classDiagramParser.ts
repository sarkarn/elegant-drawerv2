import type { ParserResult, ClassNode, ClassAttribute, ClassMethod } from '../types/diagram';
import { generateId } from '../utils/helpers';
import { positionNodesHierarchically } from '../utils/layoutUtils';

export function parseClassDiagram(input: string): ParserResult {
  try {
    const lines = input.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const nodes: ClassNode[] = [];
    const edges: any[] = [];
    // Temporarily store inheritance relationships to resolve after parsing all classes
    const pendingInheritance: Array<{ childId: string; parentName: string }> = [];

    let currentClass: Partial<ClassNode> | null = null;
    let yPosition = 50;

    for (const line of lines) {
      // Class declaration
      if (line.startsWith('class ')) {
        if (currentClass) {
          // Finish previous class
          finishCurrentClass(currentClass, nodes);
          yPosition += 200;
        }

        const classMatch = line.match(/class\s+(\w+)(?:\s+extends\s+(\w+))?\s*\{?/);
        if (classMatch) {
          const [, className, parentClass] = classMatch;
          currentClass = {
            id: generateId(),
            type: 'class',
            x: 100 + (nodes.length % 3) * 300,
            y: yPosition,
            width: 200,
            height: 120,
            label: className,
            data: {
              className,
              attributes: [],
              methods: [],
            },
          };

          // Record inheritance to resolve later when all classes are known
          if (parentClass) {
            pendingInheritance.push({ childId: currentClass.id!, parentName: parentClass });
          }
        }
      }
      // Attributes and methods
      else if (currentClass && (line.startsWith('-') || line.startsWith('+') || line.startsWith('#'))) {
        const visibility = line[0] === '+' ? 'public' : line[0] === '-' ? 'private' : 'protected';
        const content = line.substring(1).trim();

        if (content.includes('(')) {
          // Method
          const methodMatch = content.match(/(\w+)\(([^)]*)\):\s*(\w+)/);
          if (methodMatch) {
            const [, name, params, returnType] = methodMatch;
            const method: ClassMethod = {
              name,
              returnType,
              visibility,
              parameters: params ? params.split(',').map(p => {
                const [paramName, paramType] = p.trim().split(':').map(s => s.trim());
                return { name: paramName || '', type: paramType || 'void' };
              }) : [],
            };
            currentClass.data!.methods.push(method);
          }
        } else {
          // Attribute
          const attributeMatch = content.match(/(\w+):\s*(\w+)/);
          if (attributeMatch) {
            const [, name, type] = attributeMatch;
            const attribute: ClassAttribute = {
              name,
              type,
              visibility,
            };
            currentClass.data!.attributes.push(attribute);
          }
        }
      }
      // End of class
      else if (line === '}' && currentClass) {
  finishCurrentClass(currentClass, nodes);
        currentClass = null;
        yPosition += 200;
      }
    }

    // Handle case where last class doesn't have closing brace
    if (currentClass) {
      finishCurrentClass(currentClass, nodes);
    }

    // Resolve inheritance edges after all classes are parsed
    if (pendingInheritance.length) {
      const nameToNode = new Map<string, ClassNode>(nodes.map(n => [n.data.className, n]));
      for (const rel of pendingInheritance) {
        const parentNode = nameToNode.get(rel.parentName);
        if (parentNode) {
          edges.push({
            id: generateId(),
            from: rel.childId,
            to: parentNode.id,
            type: 'inheritance',
            label: 'extends',
          });
        }
      }
    }

    // Apply hierarchical layout for better positioning with updated spacing
    const layoutNodes = positionNodesHierarchically(nodes, edges, {
      nodeWidth: 250, // Default width for fallback
      nodeHeight: 200, // Default height for fallback  
      horizontalSpacing: 300, // Conservative spacing
      verticalSpacing: 250, // Conservative spacing
      layoutDirection: 'top-down'
    });

    return {
      success: true,
      data: {
        nodes: layoutNodes,
        edges,
        metadata: {
          title: 'Class Diagram',
          created: new Date(),
        },
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to parse class diagram',
    };
  }
}

function finishCurrentClass(currentClass: Partial<ClassNode>, nodes: ClassNode[]) {
  if (currentClass.data) {
    // Calculate height based on content with more accurate spacing
    const titleHeight = 30; // Class name and separator line
    const lineSpacing = 18; // Increased spacing between lines
    const separatorHeight = 15; // Height for separator between attributes and methods
    const padding = 30; // Bottom padding
    
    const attributeHeight = currentClass.data.attributes.length * lineSpacing;
    const methodHeight = currentClass.data.methods.length * lineSpacing;
    const needsSeparator = currentClass.data.attributes.length > 0 && currentClass.data.methods.length > 0;
    
    // More accurate height calculation
    const calculatedHeight = titleHeight + 
                            attributeHeight + 
                            (needsSeparator ? separatorHeight : 0) + 
                            methodHeight + 
                            padding;
    
    const minHeight = 80;
    const height = Math.max(minHeight, calculatedHeight);

    // Also adjust width based on content length
    const maxAttributeLength = currentClass.data.attributes.length > 0 
      ? Math.max(...currentClass.data.attributes.map(attr => 
          `${attr.visibility === 'private' ? '-' : attr.visibility === 'protected' ? '#' : '+'} ${attr.name}: ${attr.type}`.length
        ))
      : 0;
    
    const maxMethodLength = currentClass.data.methods.length > 0
      ? Math.max(...currentClass.data.methods.map(method => {
          const params = method.parameters ? method.parameters.map(p => `${p.name}: ${p.type}`).join(', ') : '';
          return `${method.visibility === 'private' ? '-' : method.visibility === 'protected' ? '#' : '+'} ${method.name}(${params}): ${method.returnType}`.length;
        }))
      : 0;
    
    const maxContentLength = Math.max(currentClass.data.className.length, maxAttributeLength, maxMethodLength);
    const calculatedWidth = Math.max(200, Math.min(400, maxContentLength * 8 + 40)); // Dynamic width with limits

    nodes.push({
      ...currentClass,
      width: calculatedWidth,
      height,
    } as ClassNode);
  }
}