// Quick test script to validate example parsing
import { readFileSync } from 'fs';
import { parseClassDiagram } from './src/parsers/classDiagramParser.js';
import { parseSequenceDiagram } from './src/parsers/sequenceDiagramParser.js';
import { parseFlowDiagram } from './src/parsers/flowDiagramParser.js';
import { parseUsecaseDiagram } from './src/parsers/usecaseDiagramParser.js';
import { parseMindmapDiagram } from './src/parsers/mindmapParser.js';

const examples = {
  class: readFileSync('./examples/class.txt', 'utf8'),
  sequence: readFileSync('./examples/sequence.txt', 'utf8'),
  flow: readFileSync('./examples/flow.txt', 'utf8'),
  usecase: readFileSync('./examples/usecase.txt', 'utf8'),
  mindmap: readFileSync('./examples/mindmap.txt', 'utf8'),
};

const parsers = {
  class: parseClassDiagram,
  sequence: parseSequenceDiagram,
  flow: parseFlowDiagram,
  usecase: parseUsecaseDiagram,
  mindmap: parseMindmapDiagram,
};

console.log('Testing example files parsing...\n');

for (const [type, content] of Object.entries(examples)) {
  console.log(`=== ${type.toUpperCase()} ===`);
  try {
    const result = parsers[type](content);
    if (result.success) {
      console.log(`✓ Parsed successfully`);
      console.log(`  Nodes: ${result.data.nodes.length}`);
      console.log(`  Edges: ${result.data.edges.length}`);
      
      // Show first node for debugging
      if (result.data.nodes.length > 0) {
        console.log(`  First node: ${result.data.nodes[0].label} (${result.data.nodes[0].type})`);
      }
    } else {
      console.log(`✗ Parse failed: ${result.error}`);
    }
  } catch (error) {
    console.log(`✗ Exception: ${error.message}`);
  }
  console.log('');
}