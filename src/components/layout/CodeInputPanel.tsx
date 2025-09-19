import React, { useEffect } from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import { parseDiagramText } from '../../utils/diagramParser';
import { Play, Eraser, Copy, Save } from 'lucide-react';

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

export const CodeInputPanel: React.FC = () => {
  const {
    config,
    inputText,
    error,
    setInputText,
    setDiagramData,
    setError
  } = useDiagramStore();

  // Auto-load example when diagram type changes and no content exists
  useEffect(() => {
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
      // Could add a toast notification here
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

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Action Buttons */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="space-y-2">
          <button
            onClick={handleDrawCode}
            className="w-full flex items-center justify-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            <Play className="w-4 h-4 mr-2" />
            Draw Code
          </button>
          
          <button
            onClick={handleClearCode}
            className="w-full flex items-center justify-center px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm font-medium"
          >
            <Eraser className="w-4 h-4 mr-2" />
            Clear Code
          </button>
          
          <button
            onClick={handleCopyCode}
            disabled={!inputText.trim()}
            className="w-full flex items-center justify-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </button>
          
          <button
            onClick={handleSaveCode}
            disabled={!inputText.trim()}
            className="w-full flex items-center justify-center px-3 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Code
          </button>
        </div>
      </div>

      {/* Code Textarea */}
      <div className="flex-1 p-4 flex flex-col">
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
    </div>
  );
};