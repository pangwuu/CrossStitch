/**
 * Processes the image: downsamples, extracts palette, and maps pixels.
 * @param {HTMLImageElement} image - The source image
 * @param {number} size - Grid size (resolution)
 * @param {number} maxColors - Number of colors in palette
 * @returns {Object} - { width, height, palette, paletteStrings, pixelMap }
 */
function processImage(image, size, maxColors) {
    // Calculate proportional dimensions
    const scale = size / Math.max(image.width, image.height);
    const w = Math.floor(image.width * scale);
    const h = Math.floor(image.height * scale);

    // Step 1: Draw downsampled image to OFF-SCREEN canvas
    // We do this to get the pixel data without affecting the visible canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCtx.drawImage(image, 0, 0, w, h);
    
    // Step 2: Extract pixel data
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    
    // Step 3: Build pixel array for k-means clustering
    // WHY: We sample pixels instead of using ALL pixels for performance
    const pixelArray = [];
    for (let i = 0; i < pixels.length; i += 4) {
        // Skip transparent pixels
        if (pixels[i+3] > 0) {
            pixelArray.push([pixels[i], pixels[i+1], pixels[i+2]]);
        }
    }
    
    // console.log(`Processing ${pixelArray.length} pixels into ${maxColors} colors`);
    
    // Step 4: Use K-Means to find optimal color palette
    const palette = performKMeans(pixelArray, maxColors);
    
    // console.log('Generated palette:', palette);
    
    // Convert palette to RGB strings
    const paletteStrings = palette.map(rgb => `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
    
    // Step 5: Map each pixel to nearest palette color
    const pixelMap = [];
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i+1];
        const b = pixels[i+2];
        
        // Find closest color in palette
        const closestIndex = findClosestColor(r, g, b, palette);
        pixelMap.push(closestIndex + 1); // +1 for 1-based numbering
    }

    return {
        width: w,
        height: h,
        palette,
        paletteStrings,
        pixelMap
    };
}