

// DOM element references
const upload = document.getElementById('upload');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const legendDiv = document.getElementById('legend');
const gridSizeInput = document.getElementById('gridSize');
const gridValue = document.getElementById('gridValue');
const colorCountInput = document.getElementById('colorCount');
const colorValue = document.getElementById('colorValue');
const downloadBtn = document.getElementById('downloadBtn');

// State management
let originalImage = null;
let currentPalette = [];

// Event listeners
upload.addEventListener('change', handleImageUpload);
document.getElementById('processBtn').addEventListener('click', render);
gridSizeInput.addEventListener('input', updateGridValue);
colorCountInput.addEventListener('input', updateColorValue);
downloadBtn.addEventListener('click', downloadPDF);

/**
 * Updates the displayed grid size value
 */
function updateGridValue() {
    gridValue.textContent = gridSizeInput.value;
}

/**
 * Updates the displayed color count value
 */
function updateColorValue() {
    colorValue.textContent = colorCountInput.value;
}

/**
 * Handles image file upload
 */
function handleImageUpload(e) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            render();
        };
        img.src = event.target.result;
    };
    
    reader.readAsDataURL(e.target.files[0]);
}

/**
 * Main rendering function - generates the paint-by-numbers grid
 */
function render() {
    if (!originalImage) return;

    const size = parseInt(gridSizeInput.value);
    const maxColors = parseInt(colorCountInput.value);
    
    // Calculate proportional dimensions
    const scale = size / Math.max(originalImage.width, originalImage.height);
    const w = Math.floor(originalImage.width * scale);
    const h = Math.floor(originalImage.height * scale);

    // Step 1: Draw downsampled image to OFF-SCREEN canvas
    // We do this to get the pixel data without affecting the visible canvas
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = w;
    tempCanvas.height = h;
    tempCtx.drawImage(originalImage, 0, 0, w, h);
    
    // Step 2: Extract pixel data
    const imgData = tempCtx.getImageData(0, 0, w, h);
    const pixels = imgData.data;
    
    // Step 3: Build pixel array for k-means clustering
    // WHY: We sample pixels instead of using ALL pixels for performance
    // A 60x60 image = 3600 pixels, enough to find dominant colors
    const pixelArray = [];
    for (let i = 0; i < pixels.length; i += 4) {
        // Skip transparent pixels
        if (pixels[i+3] > 0) {
            pixelArray.push([pixels[i], pixels[i+1], pixels[i+2]]);
        }
    }
    
    // console.log(`Processing ${pixelArray.length} pixels into ${maxColors} colors`);
    
    // Step 4: Use K-Means to find optimal color palette
    // WHY K-MEANS: Finds the actual dominant colors by clustering similar colors together
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
    
    // VISUALIZATION: Scale up for display
    // Each grid cell will be 20x20 pixels so text fits
    const CELL_SIZE = 20;
    canvas.width = w * CELL_SIZE;
    canvas.height = h * CELL_SIZE;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the grid
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const index = y * w + x;
            const label = pixelMap[index];
            const color = paletteStrings[label - 1];
            
            // Draw cell background
            ctx.fillStyle = color;
            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            
            // Draw cell border (optional, good for 'grid' look)
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            
            // Draw label
            ctx.fillStyle = getContrastColor(palette[label - 1]);
            ctx.font = "8px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(label, x * CELL_SIZE + CELL_SIZE/2, y * CELL_SIZE + CELL_SIZE/2);
        }
    }

    createLegend(paletteStrings);
    
    currentPalette = paletteStrings;
    downloadBtn.style.display = 'inline-block';
}

/**
 * Helper to determine text color (black/white) based on background brightness
 */
function getContrastColor(rgb) {
    // Perceptual brightness formula
    const brightness = (rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114);
    return brightness > 128 ? "black" : "white";
}

// Remove the old drawLabels function as it's now integrated into render
/* 
function drawLabels... (removed)
*/

/**
 * Uses the ml-kmeans library to find optimal colour palette
 */
/**
 * Custom K-Means implementation
 * Groups pixels into k clusters of dominant colors
 */
function performKMeans(data, k) {
    if (data.length <= k) return data;

    // 1. Initialize centroids randomly
    let centroids = data.slice(0, k).map(p => [...p]);
    
    const maxIterations = 20;
    
    for (let iter = 0; iter < maxIterations; iter++) {
        // Create clusters
        const clusters = Array.from({ length: k }, () => []);
        
        // 2. Assign each pixel to the nearest centroid
        for (const point of data) {
            let minDistance = Infinity;
            let clusterIndex = 0;
            
            for (let i = 0; i < k; i++) {
                const centroid = centroids[i];
                // Squared Euclidean distance
                const dist = (point[0] - centroid[0]) ** 2 + 
                             (point[1] - centroid[1]) ** 2 + 
                             (point[2] - centroid[2]) ** 2;
                if (dist < minDistance) {
                    minDistance = dist;
                    clusterIndex = i;
                }
            }
            clusters[clusterIndex].push(point);
        }
        
        // 3. Recalculate centroids
        let changed = false;
        const newCentroids = clusters.map((cluster, i) => {
            if (cluster.length === 0) return centroids[i]; // Keep old if empty
            
            // Average the colors in the cluster
            const sum = cluster.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]], [0, 0, 0]);
            const newCentroid = [
                sum[0] / cluster.length,
                sum[1] / cluster.length,
                sum[2] / cluster.length
            ];
            
            // Check if centroid moved significantly
            const dist = (newCentroid[0] - centroids[i][0]) ** 2 +
                         (newCentroid[1] - centroids[i][1]) ** 2 +
                         (newCentroid[2] - centroids[i][2]) ** 2;
                         
            if (dist > 1) changed = true;
            
            return newCentroid;
        });
        
        centroids = newCentroids;
        if (!changed) break;
    }
    
    // Round final centroids to integers
    return centroids.map(c => [Math.round(c[0]), Math.round(c[1]), Math.round(c[2])]);
}

// --- Inside your render() function ---
// Replace: const palette = kMeansClustering(pixelArray, maxColors);
// With:

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
 * Creates the color legend UI
 */
function createLegend(palette) {
    legendDiv.innerHTML = '';
    palette.forEach((color, i) => {
        const item = document.createElement('div');
        item.className = 'swatch';
        item.innerHTML = `
            <div class="color-box" style="background:${color}"></div>
            <span>#${i + 1}</span>
        `;
        legendDiv.appendChild(item);
    });
}

/**
 * Downloads the canvas as a PNG
 */
function downloadPDF() {
    const link = document.createElement('a');
    link.download = 'paint-by-numbers.png';
    link.href = canvas.toDataURL();
    link.click();
}