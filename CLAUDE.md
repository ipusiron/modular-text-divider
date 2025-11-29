# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Modular Text Divider** - A client-side web tool for cryptographic text analysis that divides text into periodic columns for frequency analysis and pattern detection. Part of the "100 Security Tools with Generative AI" project (Day 030).

## Development Commands

This is a static web application with no build system. Common development tasks:

- **Run local server**: 
  - `python -m http.server 8000` (then open http://localhost:8000)
  - `npx serve` (if Node.js available)
  - Or simply open `index.html` in a browser

- **Deploy**: Push to GitHub - automatically deployed via GitHub Pages at https://ipusiron.github.io/modular-text-divider/

## Architecture

### File Structure
- `index.html` - Entry point, UI structure
- `script.js` - All application logic (event handling, text processing, export)
- `style.css` - Styling and responsive design

### Core Functionality Flow
1. **Input** → Text area, file upload, or sample text
2. **Preprocessing** → Optional uppercase, alpha-only, space removal
3. **Division** → Split text into n columns using modular arithmetic: `text[i] → column[i % n]`
4. **Output** → Display columns with copy buttons, CSV export option

### Key Functions in script.js
- `preprocessText(raw)` - Handles text transformations (reads options from DOM checkboxes)
- `updateProcessedText()` - Triggers preprocessing pipeline and updates UI
- `splitIntoColumns(text, n)` - Core algorithm for column division
- `renderColumnOutputs(columns)` - Creates DOM elements for column display
- `exportCSV()` - Generates downloadable CSV (reads index option from DOM)
- `sendToFrequencyAnalyzer(text)` - Opens external tool with text data (5,000 char limit)

### State Management
- Minimal state in DOM elements
- `lastSplitResult` global stores current split for export
- All processing is stateless/functional

## Development Guidelines

### When modifying this codebase:

1. **Maintain vanilla JavaScript** - No frameworks or external dependencies
2. **Client-side only** - All processing must happen in browser
3. **Real-time updates** - Changes should reflect immediately (input event listeners)
4. **Preserve simplicity** - This is a focused tool, avoid feature creep

### Common modifications:

- **Add preprocessing option**: Update `preprocessText()` function and add checkbox in HTML
- **Change column limit**: Modify the select dropdown in HTML (currently 1-20)
- **Enhance export format**: Update `exportCSV()` function
- **Add new sample text**: Modify the sample text constant in script.js

### Testing approach:
Manual testing via browser - no test framework. Key scenarios:
- Various text lengths and division counts
- All preprocessing option combinations
- File upload with different encodings
- CSV export functionality
- Copy button functionality
- Edge cases (empty text, n=1, very large texts)

## Custom Slash Commands

This project includes Claude Code slash commands in `.claude/commands/`:

- `/annotate` - Add Japanese comments to code (targets the most recently pasted code block)
- `/reload-workspace` - Re-read all source files and sync Claude's memory with current filesystem

## Integration Notes

This tool is designed to work with other tools in the series, particularly:
- **Frequency Analyzer** - Analyze individual columns for letter frequencies (https://ipusiron.github.io/frequency-analyzer/)
- Integration via GET parameter: `?text={URLエンコードされたテキスト}`