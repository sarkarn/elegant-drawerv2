import { useEffect, useState } from 'react';
import { Play, FileText, Copy, Trash2 } from 'lucide-react';
import { useDiagramStore } from '../../stores/diagramStore';
import { cn, debounce } from '../../utils/helpers';
import { parseClassDiagram } from '../../parsers/classDiagramParser';
import { parseSequenceDiagram } from '../../parsers/sequenceDiagramParser';
import { parseFlowDiagram } from '../../parsers/flowDiagramParser';
import { parseUsecaseDiagram } from '../../parsers/usecaseDiagramParser';
import { parseMindmapDiagram } from '../../parsers/mindmapParser';

const exampleInputs = {
  class: `class Person {
  -name: String
  -age: int
  +getName(): String
  +setName(name: String): void
  +getAge(): int
  +setAge(age: int): void
}

class Student extends Person {
  -studentId: String
  +getStudentId(): String
  +setStudentId(id: String): void
}`,
  sequence: `Alice -> Bob: Hello Bob, how are you?
Bob --> Alice: I am good thanks!
Alice -> Bob: Can you help me?
Bob --> Alice: Of course!`,
  flow: `start -> parse: Begin
parse -> decision1: Valid input?
decision1 -> processOK: Yes
decision1 -> processErr: No
processOK -> end
processErr -> end`,
  usecase: `actor User
actor Admin

User -> (Login)
User -> (View Profile)
Admin -> (Manage Users)
Admin -> (System Config)`,
  mindmap: `Central Idea
  Branch 1
    Sub-branch 1.1
    Sub-branch 1.2
  Branch 2
    Sub-branch 2.1
    Sub-branch 2.2
  Branch 3`
};

export function InputPanel() {
  const {
    config,
    inputText,
    setInputText,
    setDiagramData,
    setError,
    setLoading,
    isLoading,
  } = useDiagramStore();

  const [localText, setLocalText] = useState(inputText);

  // Debounced parser function
  const debouncedParse = debounce((text: string) => {
    if (!text.trim()) {
      setDiagramData(null);
      return;
    }

    setLoading(true);
    
    try {
      let result;
      
      switch (config.type) {
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
          throw new Error(`Unsupported diagram type: ${config.type}`);
      }

      if (result.success && result.data) {
        setDiagramData(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to parse diagram');
        setDiagramData(null);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Parse error');
      setDiagramData(null);
    } finally {
      setLoading(false);
    }
  }, 500);

  // Update local text when input text changes
  useEffect(() => {
    setLocalText(inputText);
  }, [inputText]);

  // Parse diagram when text or type changes
  useEffect(() => {
    if (localText !== inputText) {
      setInputText(localText);
    }
    debouncedParse(localText);
  }, [localText, config.type, debouncedParse, setInputText, inputText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalText(e.target.value);
  };

  const loadExample = () => {
    const example = exampleInputs[config.type];
    setLocalText(example);
  };

  const clearInput = () => {
    setLocalText('');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(localText);
      // TODO: Add toast notification
      console.log('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const manualParse = () => {
    debouncedParse(localText);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 className="font-medium text-gray-900 dark:text-gray-100">
          Input Editor
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={loadExample}
            className={cn(
              'px-2 py-1 text-xs rounded border',
              'border-gray-300 dark:border-gray-600',
              'bg-gray-100 dark:bg-gray-700',
              'hover:bg-gray-200 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300'
            )}
            title="Load example"
          >
            <FileText className="w-3 h-3" />
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!localText}
            className={cn(
              'px-2 py-1 text-xs rounded border',
              'border-gray-300 dark:border-gray-600',
              'bg-gray-100 dark:bg-gray-700',
              'hover:bg-gray-200 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Copy to clipboard"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={clearInput}
            disabled={!localText}
            className={cn(
              'px-2 py-1 text-xs rounded border',
              'border-gray-300 dark:border-gray-600',
              'bg-gray-100 dark:bg-gray-700',
              'hover:bg-gray-200 dark:hover:bg-gray-600',
              'text-gray-700 dark:text-gray-300',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            title="Clear input"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <div className="flex-1 p-4">
        <textarea
          value={localText}
          onChange={handleTextChange}
          placeholder={`Enter your ${config.type} diagram definition here...`}
          className={cn(
            'w-full h-full resize-none',
            'p-3 border border-gray-300 dark:border-gray-600 rounded-md',
            'bg-white dark:bg-gray-700',
            'text-gray-900 dark:text-gray-100',
            'font-mono text-sm leading-relaxed',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'placeholder-gray-500 dark:placeholder-gray-400'
          )}
          spellCheck={false}
        />
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {localText.length} characters • {localText.split('\n').length} lines
          </div>
          <button
            onClick={manualParse}
            disabled={isLoading || !localText.trim()}
            className={cn(
              'flex items-center space-x-2 px-3 py-1.5 text-sm rounded-md',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            <Play className="w-3 h-3" />
            <span>Parse</span>
          </button>
        </div>
      </div>
    </div>
  );
}