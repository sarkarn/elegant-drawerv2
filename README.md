# Elegant Drawer v2 - React Edition

A modern React-based diagram creation and visualization tool supporting multiple diagram types with SVG and Canvas rendering options.

## Features

- **Multiple Diagram Types**: Class, Sequence, Flow, Use Case, and Mind Map diagrams
- **Dual Rendering Engines**: Choose between SVG (D3.js) and Canvas (HTML5) rendering
- **Modern React Architecture**: Built with React 18, TypeScript, and Vite
- **Dark/Light Themes**: Seamless theme switching with Tailwind CSS
- **State Management**: Efficient state handling with Zustand
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Responsive Design**: Resizable panels and responsive layout

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type safety and enhanced developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework with dark mode
- **Zustand** - Lightweight state management
- **D3.js** - SVG manipulation and data visualization
- **Konva.js** - 2D canvas library for high-performance rendering
- **Lucide React** - Beautiful icon library

## Usage

1. **Select Diagram Type**: Choose from Class, Sequence, Flow, Use Case, or Mind Map
2. **Choose Rendering Engine**: Switch between SVG and Canvas rendering
3. **Enter Diagram Text**: Use the text parser to define your diagram structure
4. **Load Examples**: Try built-in examples for each diagram type
5. **Export/Import**: Save and load your diagram definitions

## Diagram Syntax Examples

### Class Diagram
```
class User {
  +name: string
  +email: string
  +login(): void
}

class Admin extends User {
  +permissions: string[]
  +manage(): void
}
```

### Sequence Diagram
```
Alice -> Bob: Hello
Bob -> Charlie: Hi there
Charlie -> Bob: Hello back
Bob -> Alice: Message delivered
```

### Flow Diagram
```
start -> process: Begin
process -> decision: Check condition
decision -> end1: Yes
decision -> end2: No
```

## Project Structure

```
src/
├── components/
│   ├── diagrams/          # Rendering components
│   ├── ui/               # Reusable UI components
│   └── layout/           # Layout components
├── parsers/              # Text-to-diagram parsers
├── stores/               # Zustand state management
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
└── App.tsx              # Main application component
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built upon the original elegant-drawer vanilla JavaScript implementation
- Inspired by modern diagramming tools and React best practices
- Uses open-source libraries from the React ecosystem
