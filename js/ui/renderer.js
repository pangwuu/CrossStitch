/**
 * Visualizes the paint-by-numbers grid on the main canvas.
 * Scales up the grid so text labels fit comfortably.
 * 
 * @param {HTMLCanvasElement} canvas - The target canvas
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {Object} data - { width, height, palette, paletteStrings, pixelMap }
 * @param {number} cellSize - Pixel size for each grid cell
 */
function drawGrid(canvas, ctx, data, cellSize = 20, isOutline = false) {
    const { width: w, height: h, palette, paletteStrings, pixelMap } = data;
    
    canvas.width = w * cellSize;
    canvas.height = h * cellSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const index = y * w + x;
            const label = pixelMap[index];
            const color = paletteStrings[label - 1];
            
            // Draw cell background
            if (isOutline) {
                ctx.fillStyle = "#FFFFFF";
            } else {
                ctx.fillStyle = color;
            }
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // Draw cell border (optional, good for 'grid' look)
            ctx.strokeStyle = isOutline ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)";
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            
            // Draw label
            if (isOutline) {
                ctx.fillStyle = "black";
            } else {
                ctx.fillStyle = getContrastColor(palette[label - 1]);
            }
            ctx.font = "8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, x * cellSize + cellSize/2, y * cellSize + cellSize/2);
        }
    }
}