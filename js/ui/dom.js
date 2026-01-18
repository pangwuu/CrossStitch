/**
 * Creates the color legend UI
 * @param {HTMLElement} container - The DOM element to append legend items to
 * @param {Array<string>} paletteStrings - Array of RGB color strings
 */
function createLegend(container, paletteStrings) {
    container.innerHTML = '';
    paletteStrings.forEach((color, i) => {
        const item = document.createElement('div');
        item.className = 'swatch';
        item.innerHTML = `
            <div class="color-box" style="background:${color}"></div>
            <span>#${i + 1}</span>
        `;
        container.appendChild(item);
    });
}

/**
 * Downloads the canvas content combined with a generated legend as an image
 * @param {HTMLCanvasElement} sourceCanvas - The source grid canvas
 * @param {Array<string>} paletteStrings - Array of RGB color strings for the legend
 * @param {string} filename - Output filename
 */
function downloadCanvas(sourceCanvas, paletteStrings, filename = 'paint-by-numbers.png') {
    // 1. Create a new canvas to combine everything
    const finalCanvas = document.createElement('canvas');
    const ctx = finalCanvas.getContext('2d');
    
    // Layout constants
    const padding = 40;
    const legendItemWidth = 100;
    const legendItemHeight = 40;
    const legendGap = 20;
    const titleHeight = 60; // Title "Palette" height
    
    // Calculate legend layout columns based on canvas width
    // Ensure at least 4 items per row, but more if canvas is wide
    const itemsPerRow = Math.max(4, Math.floor(sourceCanvas.width / (legendItemWidth + legendGap)));
    const rows = Math.ceil(paletteStrings.length / itemsPerRow);
    const legendHeight = rows * (legendItemHeight + legendGap) + titleHeight;
    
    // Determine final dimensions
    const finalWidth = Math.max(sourceCanvas.width + (padding * 2), itemsPerRow * (legendItemWidth + legendGap) + padding * 2);
    const finalHeight = sourceCanvas.height + legendHeight + (padding * 3);
    
    finalCanvas.width = finalWidth;
    finalCanvas.height = finalHeight;
    
    // 2. Fill background white
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, finalWidth, finalHeight);
    
    // 3. Draw Main Canvas (Centered horizontally)
    const startX = (finalWidth - sourceCanvas.width) / 2;
    ctx.drawImage(sourceCanvas, startX, padding);
    
    // 4. Draw Legend
    // Increased padding multiplier from 2 to 3 for larger gap
    const legendStartY = sourceCanvas.height + (padding * 3);
    
    // Draw Title
    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText("Colour Legend", finalWidth / 2, legendStartY - 40);
    
    // Calculate where to start drawing legend items to be centered
    const legendBlockWidth = itemsPerRow * (legendItemWidth + legendGap) - legendGap;
    const legendStartX = (finalWidth - legendBlockWidth) / 2;
    
    ctx.textAlign = 'left';
    ctx.font = '16px sans-serif';
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    
    paletteStrings.forEach((color, i) => {
        const row = Math.floor(i / itemsPerRow);
        const col = i % itemsPerRow;
        
        const x = legendStartX + col * (legendItemWidth + legendGap);
        const y = legendStartY + row * (legendItemHeight + legendGap);
        
        // Draw Color Box
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 40, 30);
        ctx.strokeRect(x, y, 40, 30); // border
        
        // Draw Label
        ctx.fillStyle = 'black';
        ctx.fillText(`#${i + 1}`, x + 50, y + 20); // offset text to right of box
    });
    
    // 5. Trigger Download (PDF)
    if (window.jspdf) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: finalWidth > finalHeight ? 'landscape' : 'portrait',
            unit: 'px',
            format: [finalWidth, finalHeight]
        });
        
        doc.addImage(finalCanvas.toDataURL('image/png'), 'PNG', 0, 0, finalWidth, finalHeight);
        doc.save(filename.replace('.png', '.pdf'));
    } else {
        console.error("jsPDF library not found, falling back to PNG");
        const link = document.createElement('a');
        link.download = filename;
        link.href = finalCanvas.toDataURL();
        link.click();
    }
}

/**
 * Generates and downloads the outline version of the map
 * @param {Object} data - Processed image data
 */
function downloadOutline(data) {
    if (!data) return;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Draw outline grid
    drawGrid(tempCanvas, tempCtx, data, 20, true);
    
    // Use existing download logic (adds legend, etc.)
    downloadCanvas(tempCanvas, data.paletteStrings, 'paint-by-numbers-outline.png');
}