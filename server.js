/**
 * Sorting Visualizer Backend Server
 *
 * Express.js server providing REST API endpoints for sorting operations.
 * Serves the static frontend files and handles sorting requests.
 *
 * Endpoints:
 * - POST /api/sort: Sort an array using optimized Quick Sort
 *
 * Features:
 * - Input validation and error handling
 * - Optimized Quick Sort implementation
 * - JSON API responses
 * - Static file serving for frontend
 *
 * @author Generated with GitHub Copilot assistance
 * @version 1.0.0
 */

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));
function quickSortInPlace(arr, low = 0, high = arr.length - 1) {
    const INSERTION_SORT_THRESHOLD = 16;
    while (low < high) {
        if (high - low < INSERTION_SORT_THRESHOLD) {
            insertionSort(arr, low, high);
            break;
        }
        const pivotIndex = partition(arr, low, high);
        if (pivotIndex - low < high - pivotIndex) {
            quickSortInPlace(arr, low, pivotIndex - 1);
            low = pivotIndex + 1;
        } else {
            quickSortInPlace(arr, pivotIndex + 1, high);
            high = pivotIndex - 1;
        }
    }
}

function partition(arr, low, high) {
    const pivotIndex = choosePivot(arr, low, high);
    const pivot = arr[pivotIndex];
    // Move pivot to end
    [arr[pivotIndex], arr[high]] = [arr[high], arr[pivotIndex]];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}

function choosePivot(arr, low, high) {
    // Median of three
    const mid = low + Math.floor((high - low) / 2);
    if (arr[low] > arr[mid]) [arr[low], arr[mid]] = [arr[mid], arr[low]];
    if (arr[low] > arr[high]) [arr[low], arr[high]] = [arr[high], arr[low]];
    if (arr[mid] > arr[high]) [arr[mid], arr[high]] = [arr[high], arr[mid]];
    return mid;
}

function insertionSort(arr, low, high) {
    for (let i = low + 1; i <= high; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= low && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}

// API endpoint
app.post('/api/sort', (req, res) => {
    const { array } = req.body;
    if (!Array.isArray(array) || array.some(n => typeof n !== 'number' || isNaN(n))) {
        return res.status(400).json({ error: 'Invalid array: must be an array of numbers' });
    }
    const sorted = [...array]; // Copy to avoid modifying original
    quickSortInPlace(sorted);
    res.json({ sorted });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));