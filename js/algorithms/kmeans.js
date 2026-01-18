/**
 * Custom K-Means implementation
 * Groups pixels into k clusters of dominant colors
 * @param {Array<Array<number>>} data - Array of [r, g, b] pixels
 * @param {number} k - Number of clusters
 * @returns {Array<Array<number>>} - Array of k [r, g, b] centroids
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