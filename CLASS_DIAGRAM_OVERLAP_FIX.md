# Class Diagram Overlap Fix

## Problem Description
Class diagrams were experiencing overlapping issues where one class box would overlap with another, especially when classes had different sizes due to varying numbers of attributes and methods.

## Root Cause Analysis
The issue was in the `positionNodesHierarchically` function in `src/utils/layoutUtils.ts`. The function was:

1. **Overriding calculated dimensions**: The layout utility was replacing the dynamically calculated widths and heights from the parser with fixed default values (`nodeWidth` and `nodeHeight`).

2. **Using fixed spacing**: The horizontal and vertical spacing calculations didn't account for the actual size of the nodes, leading to insufficient space between larger classes.

## Solution Implementation

### 1. Enhanced Layout Algorithm (`src/utils/layoutUtils.ts`)

**Before:**
```typescript
positioned.push({
  ...node,
  x,
  y,
  width: nodeWidth,    // Fixed width override
  height: nodeHeight,  // Fixed height override
});
```

**After:**
```typescript
// Use actual node dimensions for proper spacing calculation
const actualWidth = node.width || nodeWidth;
const actualHeight = node.height || nodeHeight;

// Calculate dynamic spacing based on actual node sizes
const dynamicHorizontalSpacing = Math.max(horizontalSpacing, actualWidth + 50);
const dynamicVerticalSpacing = Math.max(verticalSpacing, actualHeight + 30);

positioned.push({
  ...node,
  x,
  y,
  width: actualWidth,   // Preserve calculated width
  height: actualHeight, // Preserve calculated height
});
```

**Key Improvements:**
- Preserves the dynamically calculated dimensions from the parser
- Calculates spacing based on actual node sizes with additional padding
- Ensures minimum spacing requirements while adapting to content size

### 2. Increased Base Spacing (`src/parsers/classDiagramParser.ts`)

Updated the layout configuration to provide more generous base spacing:

```typescript
const layoutNodes = positionNodesHierarchically(nodes, edges, {
  nodeWidth: 250,         // Default width for fallback
  nodeHeight: 200,        // Default height for fallback  
  horizontalSpacing: 350, // Increased from 300
  verticalSpacing: 300,   // Increased from 250
  layoutDirection: 'top-down'
});
```

## Technical Details

### Dynamic Spacing Calculation
The new algorithm ensures that:
- **Horizontal spacing** = `max(baseSpacing, actualNodeWidth + 50px)`
- **Vertical spacing** = `max(baseSpacing, actualNodeHeight + 30px)`

This prevents overlaps by guaranteeing minimum margins between nodes while adapting to content size.

### Dimension Preservation Flow
1. **Parser Stage**: `classDiagramParser.ts` calculates accurate dimensions based on content
2. **Layout Stage**: `layoutUtils.ts` preserves these dimensions and uses them for spacing
3. **Render Stage**: `SVGRenderer.tsx` uses the preserved dimensions for accurate rendering

## Test Cases

### Example 1: Mixed Size Classes
```
class SmallClass {
  id: number
  getValue(): number
}

class LargeClass {
  // Multiple attributes and methods...
}
```

### Example 2: Inheritance with Different Sizes
```
class BaseClass {
  // Base functionality
}

class ExtendedClass extends BaseClass {
  // Many additional methods and properties
}
```

## Benefits

1. **No More Overlaps**: Classes maintain proper spacing regardless of size differences
2. **Content-Aware Layout**: Spacing automatically adjusts to accommodate larger classes
3. **Preserved Aesthetics**: Maintains clean, professional diagram appearance
4. **Scalable Solution**: Works with any number of classes and complexity levels

## Migration Notes

- **Backward Compatibility**: Existing diagrams will automatically benefit from improved spacing
- **Performance**: No significant performance impact - calculations are minimal overhead
- **Configuration**: Base spacing values can be adjusted in `classDiagramParser.ts` if needed

## Related Files Modified

1. `src/utils/layoutUtils.ts` - Enhanced layout algorithm with dynamic spacing
2. `src/parsers/classDiagramParser.ts` - Increased base spacing configuration
3. `examples/class-overlap-test-2.txt` - Comprehensive test case for validation

## Testing

The fix has been validated with:
- Classes of varying sizes (small, medium, large, extra-large)
- Inheritance relationships
- Mixed attribute/method counts
- Complex class hierarchies

All test cases now render without overlaps while maintaining proper visual spacing and hierarchy.