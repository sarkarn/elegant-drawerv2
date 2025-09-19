import React, { useEffect } from 'react';
import { useDiagramStore } from '../stores/diagramStore';
import type { DiagramType } from '../types/diagram';
import { Moon, Sun, Upload, Download } from 'lucide-react';
import { parseDiagramText } from '../utils/diagramParser';

const diagramTypes: Array<{ value: DiagramType; label: string }> = [
  { value: 'class', label: 'Class Diagram' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'flow', label: 'Flow Diagram' },
  { value: 'usecase', label: 'Use Case Diagram' },
  { value: 'mindmap', label: 'Mind Map' },
];

const examples: Record<DiagramType, string> = {
  class: `class User {
  +name: string
  +email: string
  +login(): void
}

class Admin extends User {
  +permissions: string[]
  +manage(): void
}`,
  sequence: `Alice -> Bob: Hello
Bob -> Charlie: Hi there
Charlie -> Bob: Hello back
Bob -> Alice: Message delivered`,
  flow: `start -> process: Begin
process -> decision: Check condition
decision -> end1: Yes
decision -> end2: No`,
  usecase: `actor User
actor Admin

User -> (Login)
User -> (View Profile)
Admin -> (Manage Users)
Admin -> (View Reports)`,
  mindmap: `Central Topic
  Branch 1
    Sub-branch 1.1
    Sub-branch 1.2
  Branch 2
    Sub-branch 2.1
    Sub-branch 2.2
  Branch 3`
};

export const DiagramInputPanel: React.FC = () => {
  const {
    config,
    inputText,
    currentDiagram,
    error,
    setDiagramType,
    setInputText,
    setDiagramData,
    setError,
    toggleTheme,
    exportDiagram,
    importDiagram
  } = useDiagramStore();

  // Parse diagram whenever input text or diagram type changes
  useEffect(() => {
    if (inputText.trim()) {
      try {
        const diagramData = parseDiagramText(inputText, config.type);
        setDiagramData(diagramData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Parsing failed');
        setDiagramData(null);
      }
    } else {
      setDiagramData(null);
      setError(null);
    }
  }, [inputText, config.type, setDiagramData, setError]);

  const handleDiagramTypeChange = (type: DiagramType) => {
    setDiagramType(type);
    if (!inputText.trim()) {
      setInputText(examples[type]);
    }
  };

  const handleTextChange = (text: string) => {
    setInputText(text);
  };

  const loadExample = () => {
    const example = examples[config.type || 'class'];
    setInputText(example);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importDiagram(content, 'class'); // Default to class for now
      };
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    exportDiagram('json');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
        {/* Diagram Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Diagram Type
          </label>
          <select
            value={config.type}
            onChange={(e) => handleDiagramTypeChange(e.target.value as DiagramType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {diagramTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadExample}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Load Example
          </button>
          
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            title="Toggle theme"
          >
            {config.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <label className="cursor-pointer p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
            <Upload className="w-4 h-4" />
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExport}
            disabled={!currentDiagram}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Export diagram"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Diagram Info */}
        {currentDiagram && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Nodes:</span> {currentDiagram.nodes.length} | 
            <span className="font-medium ml-2">Edges:</span> {currentDiagram.edges.length}
          </div>
        )}
      </div>

      {/* Text Input Section */}
      <div className="flex-1 flex flex-col p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Diagram Code
        </label>
        <textarea
          value={inputText}
          onChange={(e) => handleTextChange(e.target.value)}
          className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
          placeholder={`Enter your ${config.type} diagram code here...`}
          spellCheck={false}
        />
        
        {/* Error Display */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">Parse Error:</p>
            <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};