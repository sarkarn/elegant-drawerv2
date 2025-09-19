import type { DiagramType, DiagramData } from '../types/diagram';
import { parseClassDiagram } from '../parsers/classDiagramParser';
import { parseSequenceDiagram } from '../parsers/sequenceDiagramParser';
import { parseFlowDiagram } from '../parsers/flowDiagramParser';
import { parseUsecaseDiagram } from '../parsers/usecaseDiagramParser';
import { parseMindmapDiagram } from '../parsers/mindmapParser';

export function parseDiagramText(text: string, type: DiagramType): DiagramData | null {
  if (!text.trim()) return null;

  try {
    let result;
    
    switch (type) {
      case 'class':
        result = parseClassDiagram(text);
        break;
      case 'sequence':
        result = parseSequenceDiagram(text);
        break;
      case 'flow':
        result = parseFlowDiagram(text);
        break;
      case 'usecase':
        result = parseUsecaseDiagram(text);
        break;
      case 'mindmap':
        result = parseMindmapDiagram(text);
        break;
      default:
        throw new Error(`Unsupported diagram type: ${type}`);
    }

    if (result.success && result.data) {
      return result.data;
    } else {
      throw new Error(result.error || 'Parsing failed');
    }
  } catch (error) {
    console.error('Diagram parsing error:', error);
    throw error;
  }
}