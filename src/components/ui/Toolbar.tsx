// React import not required for JSX with the new transform
import { Moon, Sun, Download, Upload, Settings, Zap } from 'lucide-react';
import { useDiagramStore } from '../../stores/diagramStore';
import { cn } from '../../utils/helpers';
import type { DiagramType, RenderingEngine } from '../../types/diagram';

const diagramTypes: { value: DiagramType; label: string }[] = [
  { value: 'class', label: 'Class Diagram' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'flow', label: 'Flow Chart' },
  { value: 'usecase', label: 'Use Case Diagram' },
  { value: 'mindmap', label: 'Mind Map' },
];

const renderingEngines: { value: RenderingEngine; label: string }[] = [
  { value: 'svg', label: 'SVG' },
  { value: 'canvas', label: 'Canvas' },
];

export function Toolbar() {
  const {
    config,
    setDiagramType,
    setRenderingEngine,
    toggleTheme,
    exportDiagram,
    isLoading,
  } = useDiagramStore();

  const handleExport = async () => {
    await exportDiagram('svg');
  };

  const handleImport = () => {
    // Create a file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          // TODO: Implement import logic
          console.log('Importing file:', content);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Diagram Type Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="diagram-type" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Type:
        </label>
        <select
          id="diagram-type"
          value={config.type}
          onChange={(e) => setDiagramType(e.target.value as DiagramType)}
          className={cn(
            'px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          )}
        >
          {diagramTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rendering Engine Selector */}
      <div className="flex items-center space-x-2">
        <label htmlFor="rendering-engine" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Engine:
        </label>
        <select
          id="rendering-engine"
          value={config.renderingEngine}
          onChange={(e) => setRenderingEngine(e.target.value as RenderingEngine)}
          className={cn(
            'px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md',
            'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          )}
        >
          {renderingEngines.map((engine) => (
            <option key={engine.value} value={engine.value}>
              {engine.label}
            </option>
          ))}
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleImport}
          disabled={isLoading}
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            'text-gray-700 dark:text-gray-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Import diagram"
        >
          <Upload className="w-4 h-4" />
        </button>

        <button
          onClick={handleExport}
          disabled={isLoading}
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            'text-gray-700 dark:text-gray-300',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          title="Export diagram"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={toggleTheme}
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            'text-gray-700 dark:text-gray-300'
          )}
          title="Toggle theme"
        >
          {config.theme === 'light' ? (
            <Moon className="w-4 h-4" />
          ) : (
            <Sun className="w-4 h-4" />
          )}
        </button>

        <button
          className={cn(
            'p-2 rounded-md transition-colors',
            'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
            'text-gray-700 dark:text-gray-300'
          )}
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
          <Zap className="w-4 h-4 animate-spin" />
          <span className="text-sm">Processing...</span>
        </div>
      )}
    </div>
  );
}