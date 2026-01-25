# CrossStitch — Paint‑by‑Numbers Generator

CrossStitch converts images into printable "paint-by-numbers" / cross-stitch style maps using k-means color quantization and a scalable grid. It is a static browser app — no build step required.

## Features

- Drag & drop or upload an image
- Adjustable detail (grid size) and number of colors
- Generates a numbered grid map where each cell corresponds to a color
- Color legend with numbered swatches
- Download the generated image and an outline-only version

## Quick start

1. Clone or download the repository.
2. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).

Alternatively run a simple static server (recommended for some browsers):

- Python 3: `python -m http.server 8000`
- Node (http-server): `npx http-server -p 8000`

Then open `http://localhost:8000` in your browser.

## How to use

1. Open the app in your browser.
2. Drag & drop an image into the upload zone or click the zone to choose a file.
3. Adjust "Detail (Grid Size)" to change the resolution of the generated grid. Smaller values produce fewer cells; larger values increase detail at the cost of processing time.
4. Adjust "Number of Colors" to control how many palette colors the output will use.
5. Click "Generate Map" to create the paint-by-numbers grid. A loading overlay will appear for large images.
6. After generation you can:
   - View the color legend (numbered swatches).
   - Click "Download Image" to save the rendered map (PNG).
   - Click "Download Outline" to save an outline-only version (if available).

Notes:
- The UI attempts to balance visual clarity (cell size, label font) — downloaded images are scaled from the generated canvas.
- Transparent pixels are ignored when extracting colors.

## Files and structure

- `index.html` — App entry page and UI
- `styles.css` — Styling
- `js/` — JavaScript modules
  - `js/main.js` — App wiring, event listeners, and orchestration
  - `js/core/processor.js` — Image downsampling, k-means palette extraction, mapping pixels to palette indices (returns { width, height, palette, paletteStrings, pixelMap })
  - `js/algorithms/kmeans.js` — K-means implementation (palette generation)
  - `js/algorithms/color-utils.js` — Color helpers, distance functions
  - `js/ui/renderer.js` — drawGrid(canvas, ctx, data, cellSize, isOutline) — responsible for drawing cells, borders and labels
  - `js/ui/dom.js` — createLegend, download helpers, outline generation
- `script.js` — older / consolidated script versions (keeps alternate implementations and helpers)

If you change the code, ensure the script load order in `index.html` is correct: algorithms → core → ui → main.

## Developer notes

- Entry points: `processImage(image, size, maxColors)` (in `js/core/processor.js`) and `drawGrid(canvas, ctx, data, cellSize)` (in `js/ui/renderer.js`). The UI wiring is in `js/main.js`.
- Performance: The app downsamples the image to the chosen grid size before running k-means. Large grid sizes and high color counts increase CPU usage and can block the main thread.
- Improvements you could make:
  - Move heavy processing to a Web Worker to avoid freezing the UI on large images.
  - Add an option to export SVG or PDF vector outlines for printing.
  - Add presets for common embroidery floss palettes (DMC colors).

## Troubleshooting

- If the app does not render after upload:
  - Check the browser console for errors.
  - Ensure the selected file is an image (the uploader filters by `image/*`).
- If downloads are blank or missing legend:
  - Verify `canvas` is visible and a result was generated.

## Contributing

Contributions welcome. Open issues or PRs with bug reports, improvements, or feature requests.

## License

No license file detected in the repository. Add a `LICENSE` if you want to make the project open source with a specific license.

---

This README was generated and committed by GitHub Copilot on behalf of @pangwuu.