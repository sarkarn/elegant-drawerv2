// Core diagram types and interfaces

export type DiagramType = 'class' | 'sequence' | 'flow' | 'usecase' | 'mindmap';

export type RenderingEngine = 'svg' | 'canvas';

export interface DiagramNode {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  data?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  type?: string;
  data?: Record<string, any>;
}

export interface DiagramData {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  metadata?: {
    title?: string;
    description?: string;
    created?: Date;
    modified?: Date;
  };
}

export interface DiagramConfig {
  type: DiagramType;
  renderingEngine: RenderingEngine;
  theme: 'light' | 'dark' | 'auto';
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  zoom: number;
  pan: { x: number; y: number };
}

export interface ParserResult {
  success: boolean;
  data?: DiagramData;
  error?: string;
}

// Class diagram specific types
export interface ClassNode extends DiagramNode {
  type: 'class';
  data: {
    className: string;
    attributes: ClassAttribute[];
    methods: ClassMethod[];
    stereotype?: string;
  };
}

export interface ClassAttribute {
  name: string;
  type: string;
  visibility: 'public' | 'private' | 'protected';
}

export interface ClassMethod {
  name: string;
  returnType: string;
  parameters: MethodParameter[];
  visibility: 'public' | 'private' | 'protected';
}

export interface MethodParameter {
  name: string;
  type: string;
}

// Sequence diagram specific types
export interface SequenceActor {
  id: string;
  name: string;
  type: 'actor' | 'object';
}

export interface SequenceMessage {
  id: string;
  from: string;
  to: string;
  message: string;
  type: 'sync' | 'async' | 'return';
  order: number;
}

// Flow diagram specific types
export interface FlowNode extends DiagramNode {
  type: 'start' | 'end' | 'process' | 'decision' | 'connector';
}

// Usecase diagram specific types
export interface UsecaseActor {
  id: string;
  name: string;
  type: 'actor';
}

export interface UsecaseNode extends DiagramNode {
  type: 'usecase' | 'system';
}

// Mindmap specific types
export interface MindmapNode extends DiagramNode {
  type: 'root' | 'branch' | 'leaf';
  level: number;
  children?: string[];
  parent?: string;
}

// Zoom and pan utilities
export interface ViewportTransform {
  scale: number;
  translateX: number;
  translateY: number;
}

// Export/Import types
export interface ExportOptions {
  format: 'svg' | 'png' | 'pdf' | 'json';
  quality?: number;
  backgroundColor?: string;
}

export interface ImportedDiagram {
  type: DiagramType;
  content: string;
  filename?: string;
}