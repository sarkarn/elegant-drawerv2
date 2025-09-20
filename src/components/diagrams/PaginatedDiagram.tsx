import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import type { DiagramData, DiagramConfig } from '../../types/diagram';
import { paginateDiagram, type PageInfo, type PaginationConfig } from '../../utils/paginationUtils';
import { SVGRenderer } from './SVGRenderer';

interface PaginatedDiagramProps {
  data: DiagramData;
  config: DiagramConfig;
  paginationConfig?: PaginationConfig;
  className?: string;
}

export function PaginatedDiagram({ 
  data, 
  config, 
  paginationConfig = {},
  className = ""
}: PaginatedDiagramProps) {
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [showAllPages, setShowAllPages] = useState(false);

  useEffect(() => {
    const paginatedPages = paginateDiagram(
      data.nodes,
      data.edges,
      config.type,
      paginationConfig
    );
    setPages(paginatedPages);
    setCurrentPage(0);
  }, [data, config.type, paginationConfig]);

  // If only one page, render normally without pagination controls
  if (pages.length <= 1) {
    const currentPageData = pages[0] || { nodes: data.nodes, edges: data.edges, viewBox: { x: 0, y: 0, width: 800, height: 600 } };
    
    return (
      <div className={`diagram-container ${className}`}>
        <svg
          viewBox={`${currentPageData.viewBox.x} ${currentPageData.viewBox.y} ${currentPageData.viewBox.width} ${currentPageData.viewBox.height}`}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
          ref={(svgElement) => {
            if (svgElement) {
              SVGRenderer.render(
                svgElement,
                { nodes: currentPageData.nodes, edges: currentPageData.edges, metadata: data.metadata },
                config
              );
            }
          }}
        />
      </div>
    );
  }

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(pages.length - 1, prev + 1));
  };

  const toggleViewMode = () => {
    setShowAllPages(!showAllPages);
  };

  if (showAllPages) {
    // Show all pages in a grid layout
    return (
      <div className={`paginated-diagram-container ${className}`}>
        {/* Header with controls */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
          <h3 className="text-lg font-semibold">
            {pages[0]?.title.replace(' - Page 1', '')} ({pages.length} pages)
          </h3>
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <List size={16} />
            Single Page View
          </button>
        </div>

        {/* Grid of all pages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 max-h-screen overflow-y-auto">
          {pages.map((page, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white dark:bg-gray-900">
              <div className="text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
                Page {page.pageNumber} of {page.totalPages}
              </div>
              <svg
                viewBox={`${page.viewBox.x} ${page.viewBox.y} ${page.viewBox.width} ${page.viewBox.height}`}
                className="w-full border rounded"
                style={{ height: '300px' }}
              >
                {React.createElement('g', {
                  key: `page-${index}`,
                  dangerouslySetInnerHTML: {
                    __html: renderPageContent(page, config)
                  }
                })}
              </svg>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single page view with navigation
  const currentPageData = pages[currentPage];
  
  return (
    <div className={`paginated-diagram-container ${className}`}>
      {/* Header with controls */}
      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 border-b">
        <h3 className="text-lg font-semibold">
          {currentPageData?.title}
        </h3>
        
        <div className="flex items-center gap-4">
          {/* Page indicator */}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {pages.length}
          </span>
          
          {/* View mode toggle */}
          <button
            onClick={toggleViewMode}
            className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <Grid size={16} />
            Grid View
          </button>
        </div>
      </div>

      {/* Main diagram area */}
      <div className="relative flex-1">
        <svg
          viewBox={`${currentPageData.viewBox.x} ${currentPageData.viewBox.y} ${currentPageData.viewBox.width} ${currentPageData.viewBox.height}`}
          className="w-full h-full"
          style={{ minHeight: '500px' }}
        >
          {React.createElement('g', {
            dangerouslySetInnerHTML: {
              __html: renderPageContent(currentPageData, config)
            }
          })}
        </svg>
        
        {/* Page navigation overlays */}
        {currentPage > 0 && (
          <button
            onClick={handlePrevPage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Previous page"
          >
            <ChevronLeft size={20} />
          </button>
        )}
        
        {currentPage < pages.length - 1 && (
          <button
            onClick={handleNextPage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="Next page"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Footer with page navigation */}
      <div className="flex items-center justify-center gap-2 p-4 bg-gray-50 dark:bg-gray-800 border-t">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          <ChevronLeft size={16} />
          Previous
        </button>
        
        {/* Page dots */}
        <div className="flex gap-1 mx-4">
          {pages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentPage 
                  ? 'bg-blue-500' 
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              title={`Go to page ${index + 1}`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNextPage}
          disabled={currentPage === pages.length - 1}
          className="flex items-center gap-2 px-3 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Next
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// Helper function to render page content
function renderPageContent(page: PageInfo, config: DiagramConfig): string {
  // Create a temporary SVG element to render the page content
  const tempSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
  SVGRenderer.render(tempSvg, {
    nodes: page.nodes,
    edges: page.edges,
    metadata: { title: page.title, created: new Date() }
  }, config);
  
  return tempSvg.innerHTML;
}