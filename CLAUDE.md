# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Modular Text Divider** - A client-side web tool for cryptographic text analysis that divides text into periodic columns for frequency analysis and pattern detection. Part of the "100 Security Tools with Generative AI" project (Day 030).

## Development Commands

This is a static web application with no build system or npm dependencies. Common development tasks:

- **Run local server**: 
  - `python -m http.server 8000` (then open http://localhost:8000)
  - Or simply open `index.html` in a browser

- **Deploy**: Push to GitHub - automatically deployed via GitHub Pages at https://ipusiron.github.io/modular-text-divider/

- **Test**: `npm test` on Node.js 22 (`node --test`). CI runs on push and pull_request.
- Keep classic scripts for direct `file://` operation. Do not add ES modules, fetch, CDN resources, or dependencies.

## Architecture

### File Structure
- `index.html` - Entry point, UI structure
- `js/divider-core.js` - Pure preprocessing, validation, splitting, CSV, and URL parameter parsing
- `js/app.js` - Application state, DOM rendering, file handling, export, links, and help dialog
- `js/i18n.js` - Japanese/English dictionaries, language selection, and live translated bindings
- `js/samples.js` - Embedded ciphertext strings, byte-identical to the three bundled ciphertext files
- `js/theme-init.js` - Synchronous theme initialization before first paint
- `style.css` - Styling and responsive design

### Core Functionality Flow
1. **Input** → Text area, file upload, or sample text
2. **Preprocessing** → Optional uppercase, alpha-only, space removal
3. **Division** → Split text into n columns using modular arithmetic: `text[i] → column[i % n]`
4. **Output** → Display columns with copy buttons, CSV export option
5. **Solve by hand** → Adjust each column's Caesar shift and reassemble plaintext; hints are per-column only

### Key Functions
- `DividerCore.preprocess(raw, options)` - Uppercase, NFKD letters-only filtering, then whitespace removal
- `DividerCore.validateN(value, length)` - Validate an integer count from 1 to 20 and optional text length
- `DividerCore.split(text, n)` - Split by code point; returns string columns and one-based indexed cells
- `DividerCore.toCsv(result, withIndex)` - RFC 4180 quoting, UTF-8 BOM, CRLF, fixed English headers
- `DividerCore.readParams(search)` - Read text (10,000 code points maximum), n, and warning reason codes
- `DividerCore.ALPHA` / `ENGLISH_FREQ` - A–Z and the 26 Lewand percentages shared with Day009 and Day028
- `DividerCore.isSolvable(text)` - Only nonempty uppercase A–Z strings are eligible
- `DividerCore.shiftBack(col, s)` - Decrypt a column using subtraction modulo 26
- `DividerCore.letterCounts(col)` / `chiSquare(col, s)` - Counts and the reference chi-square score
- `DividerCore.bestShift(col)` - Minimum chi-square shift; smaller shifts win ties
- `DividerCore.interleave(columns)` / `solve(columns, shifts)` - Reassemble plaintext and derive the current key
- `updateProcessedText()` - Invalidate old results and update preprocessing/counts
- `splitIntoColumns(text, n)` - Delegate to the core and render results
- `renderColumnOutputs(columns)` - Creates DOM elements for column display
- `exportCSV()` - Generates downloadable CSV (reads index option from DOM)
- Frequency Analyzer links are anchors with `target="_blank"` and `rel="noopener noreferrer"`.
- Columns longer than 5,000 code points explicitly link only their first 5,000 characters; no confirm dialog.

### State Management
- State contains raw input, three preprocessing options, column count, and optional split result.
- Editing input, options, number field, or slider clears the previous result until the next split.
- Pure calculations live only in DividerCore; UI/export must use that implementation.
- `lastSplitResult` references the same result for export. Language switching must preserve inputs and results.
- Solving state contains only the shifts array and the set of columns whose hints have been viewed.
- Input invalidation discards solving state. Splitting again resets shifts to A and clears hints.
- Language switching preserves both shifts and hints. Reset-all changes shifts to A without hiding viewed hints.
- Show at most 300 plaintext characters grouped in fives; announce only the key and first 20 characters via aria-live.

## Development Guidelines

### When modifying this codebase:

1. **Maintain vanilla JavaScript** - No frameworks or external dependencies
2. **Client-side only** - All processing must happen in browser
3. **Real-time updates** - Changes should reflect immediately (input event listeners)
4. **Preserve simplicity** - This is a focused tool, avoid feature creep

### Common modifications:

- **Preprocessing changes**: Preserve reference semantics and order; derive known answers and README tables from DividerCore.
- **Column limit**: Keep 20. Do not replace the slider's 20-cell grid or label translation offsets.
- **Enhance export format**: Update `exportCSV()` function
- **Sample input**: Keep the fixed sample button alongside the bundled sample selector and load button.
- `DividerSamples` has exactly three `{ id, file, n, text }` entries; n is 3, 4, or 7.
- Generate the embedded text mechanically from ciphertext files and preserve every byte. Do not embed keys or plaintext.
- Use a classic script and conditional CommonJS export. No fetch/XHR: the selector must work under file://.
- vigenere2/plaintext.txt was corrected from a duplicate of vigenere3 to the recovered Gettysburg Address (1,146 bytes, no newline).
- Corrected plaintext SHA-256: `a5a177200b573836654a52d49fac8d76851dbf7993385072e309e1d8a23486e3`.
- Known hint keys: CAT, LOCK, PADLOCK. The vigenere3 grouped prefix is `DOWNT HERAB BITHO LEALI`, not `DOWNT HEREA BBITH`.
- Never add an apply-all-hints button or change the reference core's constants or calculation rules.

### Testing approach

- `test/core.test.js`: Known answers, all bundled samples, 200 seeded Unicode texts × n=1..20, CSV round trips.
- `test/samples.test.js`: Embedded bytes, absence of answer spoilers, recovered plaintexts, and corrected plaintext hash.
- `test/i18n.test.js`: Matching dictionaries, placeholders, used keys, no Japanese literals outside i18n.js (comments excluded).
- `test/html.test.js`: Core delegation, CSP, ARIA, safe DOM APIs, file limits, external links.
- `test/contrast.test.js`: CSS variable pairs, text contrast at least 4.5:1; focus, bars, and dots at least 3:1.
- `test/format.test.js`: Maximum line lengths and minimum source line counts; no minification.
- `test/readme.test.js`: Recalculate four split rows and three solve rows in both READMEs; verify YAML, trees, headings, and five images.
- Keep seven test files. Do not change previous expected values; only add checks for the new specification.
- Do not change known-answer expectations to pass tests. Documentation tables must agree with DividerCore and samples.
- Browser checks: HTTP and file://, 1280/768/390/320px (small widths with is_mobile), both languages and themes,
  keyboard operation, dialog focus trap, clipboard/downloads, storage denial, first-paint theme, and zero console/CSP/external requests.

## Local Files

Local Claude Code commands remain in the ignored, untracked `.claude/commands/` directory:

- `/annotate` - Add Japanese comments to code (targets the most recently pasted code block)
- `/reload-workspace` - Re-read all source files and sync Claude's memory with current filesystem

## Integration Notes

This tool is designed to work with other tools in the series, particularly:
- **Frequency Analyzer** - Analyze individual columns for letter frequencies (https://ipusiron.github.io/frequency-analyzer/)
- Outgoing integration uses `?text=` with URL-encoded text, limited to 5,000 code points.
- Incoming `?text=...&n=...` supports Day028 RepeatSeq Analyzer: text ≤10,000 code points, n an integer 1–20.
- Receiving text enables all three preprocessing options; valid text/n pairs split automatically.
- Invalid values produce localized warnings. Remove text and n with history.replaceState after loading, preserving lang.
- Files must be .txt or text/* and at most 1 MB (1,048,576 bytes). Clear the file input after selection for reselection.

## Localization and Storage

- All UI text, errors, toasts, help, title/placeholder/aria-label attributes, and hidden elements use the dictionaries.
- Use data-i18n for static text and i18n.assign for dynamic text; never construct translated HTML.
- Language priority: valid ?lang=ja|en, localStorage divider-language, then navigator.language (ja prefix or English).
- Theme uses localStorage theme (light or dark; light is the default). Apply synchronously in head before styles.
- Storage is optional: guard every access with try/catch. Do not store user input or results.

## Security and Output

- Keep the exact self-only meta CSP; no unsafe-inline, unsafe-eval, or ineffective frame-ancestors meta directive.
- Use no-referrer. No inline handlers, style attributes, element.style assignments, innerHTML, alert, confirm, or window.open.
- Set textContent/value and use createElement/replaceChildren. External navigation only follows user-activated links.
- URL text can remain in shared URLs/history; do not promise confidentiality merely because parameters are removed.
- CSV faithfully preserves input, including characters spreadsheet software might interpret as formulas.
- README.md and README.en.md have matching 14 sections, complete annotated trees, and five screenshot references.
- Screenshot states: vigenere1/3 columns/light Japanese (input and results); vigenere2/4 columns/dark English via URL.
- Keep screenshots 1–3 unchanged. Add 4: vigenere1/light Japanese/CAA and 5: vigenere3/dark English/PADLOCK after seven hints.
- SVG bars and dots use CSS classes; geometry uses SVG attributes, not inline styles. All controls remain at least 44px.
