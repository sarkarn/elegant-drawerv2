import React from 'react';
import { useDiagramStore } from '../../stores/diagramStore';
import { Moon, Sun } from 'lucide-react';

export const HeaderBar: React.FC = () => {
  const { config, toggleTheme } = useDiagramStore();

  return (
    <div className="h-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Application Title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">
        Elegant Diagram Drawer
      </h1>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md transition-colors"
        title={config.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {config.theme === 'dark' ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
};