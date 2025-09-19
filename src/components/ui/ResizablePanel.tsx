import { useRef, useCallback, useState } from 'react';
import { cn } from '../../utils/helpers';

interface ResizablePanelProps {
  width: number;
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  children: React.ReactNode;
}

export function ResizablePanel({
  width,
  onResize,
  minWidth = 200,
  maxWidth = 600,
  className,
  children,
}: ResizablePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;

      const rect = panelRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [minWidth, maxWidth, onResize]);

  return (
    <div
      ref={panelRef}
      className={cn('relative flex-shrink-0', className)}
      style={{ width: `${width}px` }}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        className={cn(
          'absolute top-0 right-0 w-1 h-full cursor-col-resize',
          'bg-transparent hover:bg-blue-500 transition-colors',
          'group flex items-center justify-center',
          isResizing && 'bg-blue-500'
        )}
        onMouseDown={handleMouseDown}
      >
        <div className={cn(
          'w-px h-full bg-gray-300 dark:bg-gray-600',
          'group-hover:bg-blue-500 transition-colors',
          isResizing && 'bg-blue-500'
        )} />
      </div>

      {/* Resize cursor overlay when resizing */}
      {isResizing && (
        <div className="fixed inset-0 cursor-col-resize z-50" />
      )}
    </div>
  );
}