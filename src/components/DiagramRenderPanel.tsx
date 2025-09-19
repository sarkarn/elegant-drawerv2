import React from 'react';
import { useDiagramStore } from '../stores/diagramStore';
import { DiagramRenderer } from './diagrams/DiagramRenderer';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

export const DiagramRenderPanel: React.FC = () => {
  const {
    currentDiagram,
    config,
    viewport,
    setViewport,
    resetViewport,
    setRenderingEngine
  } = useDiagramStore();

  const handleZoomIn = () => {
    setViewport({ scale: Math.min(viewport.scale * 1.2, 3) });
  };

  const handleZoomOut = () => {
    setViewport({ scale: Math.max(viewport.scale / 1.2, 0.1) });
  };

  const handleRenderingEngineChange = (engine: 'svg' | 'canvas') => {
    setRenderingEngine(engine);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Render Panel Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Diagram Preview
          </h3>
          
          <div className="flex items-center space-x-4">
            {/* Rendering Engine Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Engine:</span>
              <select
                value={config.renderingEngine}
                onChange={(e) => handleRenderingEngineChange(e.target.value as 'svg' | 'canvas')}
                className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="svg">SVG</option>
                <option value="canvas">Canvas</option>
              </select>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={handleZoomOut}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-center">
                {Math.round(viewport.scale * 100)}%
              </span>
              
              <button
                onClick={handleZoomIn}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              
              <button
                onClick={resetViewport}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                title="Fit to screen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diagram Canvas Area */}
      <div className="flex-1 overflow-hidden relative">
        {currentDiagram ? (
          <DiagramRenderer />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-2">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Diagram to Display
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Enter diagram code in the left panel to see your diagram rendered here.
                You can also load an example to get started.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      {currentDiagram && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-medium">Type:</span> {config.type} | 
              <span className="font-medium ml-2">Engine:</span> {config.renderingEngine.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Nodes:</span> {currentDiagram.nodes.length} | 
              <span className="font-medium ml-2">Edges:</span> {currentDiagram.edges.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};