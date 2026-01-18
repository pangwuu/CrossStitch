/**
 * Finds the closest color in the palette using Euclidean distance
 * 
 * EUCLIDEAN DISTANCE in RGB space:
 * distance = √[(r1-r2)² + (g1-g2)² + (b1-b2)²]
 * 
 * WHY: Treats colors as points in 3D space (R, G, B axes)
 * Closer distance = more similar color
 * 
 * OPTIMIZATION: We skip the √ because we only need to compare distances
 * If dist_a < dist_b, then √dist_a < √dist_b
 */
function findClosestColor(r, g, b, palette) {
    let minDist = Infinity;
    let closestIdx = 0;
    
    for (let i = 0; i < palette.length; i++) {
        const [pr, pg, pb] = palette[i];
        
        // Squared Euclidean distance (no sqrt for performance)
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        
        if (dist < minDist) {
            minDist = dist;
            closestIdx = i;
        }
    }
    
    return closestIdx;
}

/**
 * Helper to determine text color (black/white) based on background brightness
 * @param {Array<number>} rgb - [r, g, b]
 * @returns {string} - "black" or "white"
 */
function getContrastColor(rgb) {
    // Perceptual brightness formula (ITU-R BT.709)
    // Coefficients: 0.2126*R + 0.7152*G + 0.0722*B
    // Using slightly different commonly used coefficients here: 0.299*R + 0.587*G + 0.114*B
    const brightness = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
    return brightness > 128 ? "black" : "white";
}