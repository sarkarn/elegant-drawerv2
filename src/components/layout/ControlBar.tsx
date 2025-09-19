import React from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import type { DiagramType } from '../../types/diagram';
import { Upload } from 'lucide-react';

const diagramTypes: Array<{ value: DiagramType; label: string }> = [
  { value: 'class', label: 'Class Diagram' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'flow', label: 'Flow Diagram' },
  { value: 'usecase', label: 'Use Case Diagram' },
  { value: 'mindmap', label: 'Mind Map' },
];

export const ControlBar: React.FC = () => {
  const { config, setDiagramType, importDiagram } = useDiagramStore();

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importDiagram(content, config.type);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Left Side - Diagram Type Selection */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Diagram Type:
        </label>
        <select
          value={config.type}
          onChange={(e) => setDiagramType(e.target.value as DiagramType)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {diagramTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Right Side - File Load */}
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Load from file:</span>
        <label className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500">
          <Upload className="w-4 h-4 mr-2" />
          Choose File
          <input
            type="file"
            accept=".txt,.json"
            onChange={handleFileLoad}
            className="hidden"
          />
        </label>
      </div>
    </div>
  );
};