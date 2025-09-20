import React, { useState, useRef, useEffect } from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import type { DiagramType } from '../../types/diagram';
import { Upload, BookOpen, ChevronDown } from 'lucide-react';

const diagramTypes: Array<{ value: DiagramType; label: string }> = [
  { value: 'class', label: 'Class Diagram' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'flow', label: 'Flow Diagram' },
  { value: 'usecase', label: 'Use Case Diagram' },
  { value: 'mindmap', label: 'Mind Map' },
];

export const ControlBar: React.FC = () => {
  const store = useDiagramStore();
  const { config, setDiagramType, importDiagram, updateConfig } = store;
  const [showExamples, setShowExamples] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Simple check for examples functionality
  const hasExampleFunctions = 'loadExample' in store && 'getAvailableExamples' in store;
  
  let examples: any[] = [];
  if (hasExampleFunctions) {
    try {
      examples = (store as any).getAvailableExamples();
    } catch (error) {
      console.error('Error getting examples:', error);
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowExamples(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleExampleLoad = (exampleName: string) => {
    if (hasExampleFunctions) {
      (store as any).loadExample(exampleName);
      setShowExamples(false);
    }
  };

  const togglePagination = () => {
    updateConfig({ enablePagination: !config.enablePagination });
  };

  return (
    <div className="h-full bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Left Side - Diagram Type Selection and Pagination */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
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

        {/* Pagination Toggle */}
        <div className="flex items-center space-x-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enablePagination || false}
              onChange={togglePagination}
              className="sr-only"
            />
            <div className={`relative w-11 h-6 transition duration-200 ease-linear rounded-full ${
              config.enablePagination ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition duration-200 ease-linear transform ${
                config.enablePagination ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Auto-Pagination
            </span>
          </label>
        </div>
      </div>

      {/* Right Side - Examples and File Load */}
      <div className="flex items-center space-x-4">
        {/* Examples Dropdown */}
        {hasExampleFunctions && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Load Example
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
            </button>
            
            {showExamples && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
                <div className="py-1 max-h-64 overflow-y-auto">
                  {examples.map((example) => (
                    <button
                      key={example.name}
                      onClick={() => handleExampleLoad(example.name)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {example.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {example.description}
                      </div>
                    </button>
                  ))}
                  {examples.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No examples available for {config.type} diagrams
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* File Load */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Or load from file:</span>
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
    </div>
  );
};