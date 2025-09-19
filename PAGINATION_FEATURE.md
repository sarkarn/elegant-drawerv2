# Diagram Pagination System

## Overview
The diagram pagination system automatically splits large diagrams across multiple pages when they exceed specified size limits. This feature is especially useful for complex class diagrams, large flowcharts, or extensive mind maps.

## How It Works

### Automatic Detection
The system automatically detects when a diagram is too large to fit comfortably on a single page by analyzing:
- Overall diagram dimensions (width × height)
- Node density and spacing
- Content complexity

### Smart Splitting Algorithms
Different diagram types use optimized splitting strategies:

#### Class Diagrams
- **Cluster-based**: Groups related classes by inheritance and associations
- **Preserves relationships**: Ensures connected classes appear on the same page when possible
- **Hierarchy-aware**: Maintains class inheritance chains

#### Flow Diagrams  
- **Layer-based**: Splits by logical flow layers (top-down)
- **Grid-based**: Alternative rectangular grid splitting
- **Path-preserving**: Keeps decision paths coherent

#### Sequence Diagrams
- **Message-based**: Splits by message count rather than spatial bounds
- **Actor preservation**: All actors appear on every page
- **Temporal continuity**: Maintains sequence order

#### Mind Maps
- **Radial sections**: Splits by distance from root node
- **Branch preservation**: Keeps related branches together
- **Level-aware**: Groups nodes by hierarchy level

#### Use Case Diagrams
- **Actor-focused**: Groups use cases by related actors
- **System boundary**: Respects system boundaries in splitting

## Usage

### Enable Pagination
1. Toggle the "Auto-Pagination" switch in the control bar
2. Set custom page dimensions if needed:
   - Default: 1200px × 900px
   - Adjustable through configuration

### Navigation Controls
When pagination is active, you get:

#### Single Page View (Default)
- Navigation arrows on diagram edges
- Page dots at bottom for quick jumping
- Previous/Next buttons in footer
- Page counter (e.g., "Page 2 of 5")

#### Grid View
- Toggle to see all pages simultaneously
- 2-column layout on larger screens
- Thumbnail view of each page
- Click to focus on specific page

### Configuration Options

```typescript
interface PaginationConfig {
  maxWidth?: number;        // Default: 1200px
  maxHeight?: number;       // Default: 900px
  overlapMargin?: number;   // Default: 100px
  preferredBreakPoints?: 'layers' | 'clusters' | 'grid';
  showPageNumbers?: boolean;
  showContinuationIndicators?: boolean;
}
```

## Examples

### Large Class Diagram
```
class UserService {
  // Many attributes and methods...
}

class DatabaseConnection {
  // Many database methods...
}

class APIController {
  // Many API endpoints...
}
// ... 20+ more classes
```
**Result**: Automatically splits into 3-4 pages, grouping related classes together.

### Complex Flow Diagram
```
start -> process1 -> decision1
decision1 -> [yes] process2 -> process3
decision1 -> [no] process4 -> decision2
// ... 50+ more nodes
```
**Result**: Splits by layers, maintaining flow continuity across pages.

### Long Sequence Diagram
```
User -> API: login()
API -> Database: validateUser()
Database -> API: userValid
// ... 30+ more messages
```
**Result**: Splits every 12-15 messages, keeping all actors visible.

## Best Practices

### For Better Pagination
1. **Use meaningful names**: Clear node labels help with automatic grouping
2. **Logical relationships**: Well-defined connections improve clustering
3. **Consistent spacing**: Helps the algorithm make better split decisions

### Performance Tips
1. **Enable only when needed**: Pagination adds some overhead
2. **Adjust page size**: Smaller pages = more splits but better performance
3. **Use grid view**: For overview of very large diagrams

## Technical Details

### Algorithm Selection
- **Class diagrams**: Cluster-based splitting using relationship analysis
- **Flow diagrams**: Layer detection with optional grid fallback  
- **Sequence diagrams**: Message-count based with actor preservation
- **Mind maps**: Radial distance grouping from root node
- **Generic diagrams**: Grid-based rectangular splitting

### Edge Handling
- **Cross-page edges**: Automatically detected and handled
- **Continuation indicators**: Show connections to other pages
- **Edge filtering**: Only shows edges between nodes on current page

### Responsive Design
- **Mobile-friendly**: Optimized navigation for touch devices
- **Keyboard shortcuts**: Arrow keys for page navigation
- **Screen adaptation**: Page size adjusts to viewport

## Future Enhancements

### Planned Features
1. **Custom break points**: Manual page break insertion
2. **Export options**: PDF with proper page breaks
3. **Print optimization**: Page-aware printing
4. **Zoom-to-fit**: Automatic scaling for page content
5. **Bookmark pages**: Save important page views

### Advanced Algorithms
1. **ML-based clustering**: Smarter relationship detection
2. **Content-aware splitting**: Considers node content density
3. **User preference learning**: Adapts to usage patterns

## Troubleshooting

### Common Issues
1. **Unexpected splits**: Adjust maxWidth/maxHeight in configuration
2. **Related nodes on different pages**: Check relationship definitions
3. **Performance slow**: Reduce page count or disable pagination
4. **Navigation issues**: Ensure JavaScript is enabled

### Debug Mode
Enable debug logging to see pagination decisions:
```typescript
// In browser console
localStorage.setItem('pagination-debug', 'true');
```

This comprehensive pagination system makes working with large diagrams much more manageable while preserving the logical structure and relationships in your content.