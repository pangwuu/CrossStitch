// DOM element references
const uploadInput = document.getElementById('upload');
const dropZone = document.getElementById('dropZone');
const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true });
const legendDiv = document.getElementById('legend');
const gridSizeInput = document.getElementById('gridSize');
const gridValue = document.getElementById('gridValue');
const colorCountInput = document.getElementById('colorCount');
const colorValue = document.getElementById('colorValue');
const processBtn = document.getElementById('processBtn');
const downloadBtn = document.getElementById('downloadBtn');
const loadingOverlay = document.getElementById('loadingOverlay');

// State management
let originalImage = null;
let currentPalette = []; // Kept for reference if needed later

// Event listeners
// 1. Click upload
dropZone.addEventListener('click', () => uploadInput.click());
uploadInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

// 2. Drag & Drop
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

processBtn.addEventListener('click', render);
gridSizeInput.addEventListener('input', updateGridValue);
colorCountInput.addEventListener('input', updateColorValue);
downloadBtn.addEventListener('click', () => downloadCanvas(canvas, currentPalette));

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
 * Handles image file processing from input or drop
 */
function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    // Show loading state immediately
    loadingOverlay.style.display = 'flex';
    processBtn.disabled = true;
    processBtn.textContent = "Loading Image...";

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            originalImage = img;
            render();
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Main rendering orchestration
 */
function render() {
    if (!originalImage) {
        alert("Please upload an image first!");
        return;
    }

    // Ensure loading state is shown (it might already be from handleFile)
    loadingOverlay.style.display = 'flex';
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";
    
    // Use setTimeout to allow the UI to update (show loader) before heavy processing freezes the thread
    setTimeout(() => {
        try {
            const size = parseInt(gridSizeInput.value);
            const maxColors = parseInt(colorCountInput.value);
            
            // 1. Process Image (Heavy lifting: K-means, mapping)
            const result = processImage(originalImage, size, maxColors);
            
            // 2. Draw to Canvas
            canvas.style.display = 'block'; // Make canvas visible
            drawGrid(canvas, ctx, result);
            
            // 3. Update UI
            createLegend(legendDiv, result.paletteStrings);
            currentPalette = result.paletteStrings;
            downloadBtn.style.display = 'inline-block';
        } catch (error) {
            console.error("Rendering failed:", error);
            alert("An error occurred while generating the map.");
            loadingOverlay.style.display = 'none';
            processBtn.disabled = false;
            processBtn.textContent = "Generate Map";
        } finally {
            // Hide loading state and restore button
            loadingOverlay.style.display = 'none';
            processBtn.disabled = false;
            processBtn.textContent = "Generate Map";
        }
    }, 50);
}