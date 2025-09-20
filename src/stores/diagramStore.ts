import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { DiagramType, DiagramData, DiagramConfig, RenderingEngine, ViewportTransform } from '../types/diagram';
import { getExamplesForType, type DiagramExample } from '../data/examples';

interface DiagramState {
  // Current diagram data
  currentDiagram: DiagramData | null;
  
  // Configuration
  config: DiagramConfig;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Input text
  inputText: string;
  
  // Viewport
  viewport: ViewportTransform;
  
  // Actions
  setDiagramType: (type: DiagramType) => void;
  setRenderingEngine: (engine: RenderingEngine) => void;
  setInputText: (text: string) => void;
  setDiagramData: (data: DiagramData | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateConfig: (config: Partial<DiagramConfig>) => void;
  setViewport: (viewport: Partial<ViewportTransform>) => void;
  resetViewport: () => void;
  toggleTheme: () => void;
  exportDiagram: (format: string) => Promise<void>;
  importDiagram: (content: string, type: DiagramType) => void;
  loadExample: (exampleName: string) => void;
  getAvailableExamples: () => DiagramExample[];
}

const defaultConfig: DiagramConfig = {
  type: 'class',
  renderingEngine: 'svg',
  theme: 'light',
  showGrid: true,
  snapToGrid: false,
  gridSize: 20,
  zoom: 1,
  pan: { x: 0, y: 0 },
  enablePagination: false,
  maxPageWidth: 1200,
  maxPageHeight: 900,
};

const defaultViewport: ViewportTransform = {
  scale: 1,
  translateX: 0,
  translateY: 0,
};

export const useDiagramStore = create<DiagramState>()(
  subscribeWithSelector((set, get) => ({
    currentDiagram: null,
    config: defaultConfig,
    isLoading: false,
    error: null,
    inputText: '',
    viewport: defaultViewport,

    setDiagramType: (type: DiagramType) => {
      set((state) => ({
        config: { ...state.config, type },
        currentDiagram: null, // Clear the previous diagram
        error: null,
      }));
    },

    setRenderingEngine: (engine: RenderingEngine) => {
      set((state) => ({
        config: { ...state.config, renderingEngine: engine },
      }));
    },

    setInputText: (text: string) => {
      set({ inputText: text, error: null });
    },

    setDiagramData: (data: DiagramData | null) => {
      set({ currentDiagram: data, error: null });
    },

    setError: (error: string | null) => {
      set({ error, isLoading: false });
    },

    setLoading: (loading: boolean) => {
      set({ isLoading: loading });
    },

    updateConfig: (newConfig: Partial<DiagramConfig>) => {
      set((state) => ({
        config: { ...state.config, ...newConfig },
      }));
    },

    setViewport: (newViewport: Partial<ViewportTransform>) => {
      set((state) => ({
        viewport: { ...state.viewport, ...newViewport },
      }));
    },

    resetViewport: () => {
      set({ viewport: defaultViewport });
    },

    toggleTheme: () => {
      set((state) => ({
        config: {
          ...state.config,
          theme: state.config.theme === 'light' ? 'dark' : 'light',
        },
      }));
    },

    exportDiagram: async (format: string) => {
      const { currentDiagram } = get();
      if (!currentDiagram) {
        set({ error: 'No diagram to export' });
        return;
      }

      try {
        set({ isLoading: true });
        // TODO: Implement export logic
        console.log(`Exporting diagram as ${format}`);
        
        // For now, just simulate export
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ isLoading: false });
      } catch (error) {
        set({ error: 'Failed to export diagram', isLoading: false });
      }
    },

    importDiagram: (content: string, type: DiagramType) => {
      try {
        set({ isLoading: true });
        // TODO: Implement import logic
        console.log(`Importing ${type} diagram:`, content);
        
        set({
          inputText: content,
          config: { ...get().config, type },
          isLoading: false,
          error: null,
        });
      } catch (error) {
        set({ error: 'Failed to import diagram', isLoading: false });
      }
    },

    loadExample: (exampleName: string) => {
      const { config } = get();
      const examples = getExamplesForType(config.type);
      const example = examples.find(ex => ex.name === exampleName);
      
      if (example) {
        set({
          inputText: example.content,
          error: null,
        });
      } else {
        set({ error: `Example "${exampleName}" not found` });
      }
    },

    getAvailableExamples: () => {
      const { config } = get();
      return getExamplesForType(config.type);
    },
  }))
);

// Selectors for easier access to specific parts of the state
export const useCurrentDiagram = () => useDiagramStore((state) => state.currentDiagram);
export const useDiagramConfig = () => useDiagramStore((state) => state.config);
export const useInputText = () => useDiagramStore((state) => state.inputText);
export const useViewport = () => useDiagramStore((state) => state.viewport);
export const useUIState = () => useDiagramStore((state) => ({
  isLoading: state.isLoading,
  error: state.error,
}));