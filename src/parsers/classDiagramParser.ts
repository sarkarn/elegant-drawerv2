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

    // Apply hierarchical layout for better positioning
    const layoutNodes = positionNodesHierarchically(nodes, edges, {
      nodeWidth: 200,
      nodeHeight: 150,
      horizontalSpacing: 250,
      verticalSpacing: 200,
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
    // Calculate height based on content
    const attributeHeight = currentClass.data.attributes.length * 20;
    const methodHeight = currentClass.data.methods.length * 20;
    const minHeight = 80;
    const height = Math.max(minHeight, 40 + attributeHeight + methodHeight + 20);

    nodes.push({
      ...currentClass,
      height,
    } as ClassNode);
  }
}