import React from 'react';
import { useDiagramStore } from './stores/diagramStore';
import { parseDiagramText } from './utils/diagramParser';
import type { DiagramType } from './types/diagram';
import { InteractiveDiagramViewer } from './components/diagrams/InteractiveDiagramViewer';
import { Moon, Sun, Upload, Play, Eraser, Copy, Save } from 'lucide-react';

const diagramTypes: Array<{ value: DiagramType; label: string }> = [
  { value: 'class', label: 'Class Diagram' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'flow', label: 'Flow Diagram' },
  { value: 'usecase', label: 'Use Case Diagram' },
  { value: 'mindmap', label: 'Mind Map' },
];

const examples = {
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
  flow: `start -> parse: Begin
parse -> decision1: Valid input?
decision1 -> processOK: Yes
decision1 -> processErr: No
processOK -> end
processErr -> end

start -> gather: Collect data
gather -> analyze: Analyze data
analyze -> decisionA: Threshold met?
decisionA -> processA: Yes
decisionA -> processB: No
processA -> end
processB -> end`,
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

function App() {
  const {
    config,
    inputText,
    currentDiagram,
    error,
    setDiagramType,
    setInputText,
    setDiagramData,
    setError,
    toggleTheme
  } = useDiagramStore();

  const isDark = config.theme === 'dark';

  React.useEffect(() => {
    // Apply dark mode class to document
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Auto-load example when diagram type changes and no content exists
  React.useEffect(() => {
    if (!inputText.trim()) {
      setInputText(examples[config.type]);
    }
  }, [config.type, inputText, setInputText]);

  const handleDrawCode = () => {
    if (inputText.trim()) {
      try {
        const diagramData = parseDiagramText(inputText, config.type);
        setDiagramData(diagramData);
        setError(null);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Parsing failed');
        setDiagramData(null);
      }
    }
  };

  const handleClearCode = () => {
    setInputText('');
    setDiagramData(null);
    setError(null);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleSaveCode = () => {
    if (inputText.trim()) {
      const blob = new Blob([inputText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${config.type}-diagram.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleFileLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInputText(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 grid grid-rows-[5vh_5vh_1fr] bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Elegant Diagram Drawer
        </h1>
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
          title={config.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {config.theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* Control Bar */}
      <nav className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
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
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Load from file:</span>
          <label className="cursor-pointer inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
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
      </nav>

      {/* Main Content Area */}
      <main className="grid grid-cols-[20%_80%] overflow-hidden">
        {/* Left Panel - Code Input */}
        <aside className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 grid grid-rows-[auto_1fr] overflow-hidden">
          {/* Action Buttons */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="space-y-2">
              <button
                onClick={handleDrawCode}
                className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-colors"
              >
                <Play className="w-4 h-4 mr-2" />
                Draw Code
              </button>
              
              <button
                onClick={handleClearCode}
                className="w-full flex items-center justify-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium transition-colors"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Clear Code
              </button>
              
              <button
                onClick={handleCopyCode}
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Code
              </button>
              
              <button
                onClick={handleSaveCode}
                disabled={!inputText.trim()}
                className="w-full flex items-center justify-center px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Code
              </button>
            </div>
          </div>

          {/* Code Input Area */}
          <div className="p-4 flex flex-col overflow-hidden">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Diagram Code:
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm resize-none"
              placeholder={`Enter your ${config.type} diagram code here...`}
              spellCheck={false}
            />
            
            {/* Error Display */}
            {error && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-sm text-red-600 dark:text-red-400 font-medium">Parse Error:</p>
                <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel - Diagram Display */}
        <section className="bg-gray-50 dark:bg-gray-900 grid grid-rows-[1fr_auto] overflow-hidden">
          {/* Diagram Display Area */}
          <div className="overflow-hidden relative">
            {currentDiagram ? (
              <InteractiveDiagramViewer />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="text-center max-w-md mx-auto px-4">
                  <div className="text-gray-400 dark:text-gray-500 mb-4">
                    <svg
                      className="w-24 h-24 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                    No Diagram to Display
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Enter your diagram code in the left panel and click "Draw Code" to visualize your diagram here.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Status Bar */}
          {currentDiagram && (
            <footer className="px-4 py-2 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
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
            </footer>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
