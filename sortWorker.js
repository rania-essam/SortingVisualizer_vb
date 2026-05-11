/**
 * Web Worker for Parallel QuickSort Execution
 * Runs in a separate thread to avoid blocking the UI
 */

// Optimized QuickSort implementation for Web Worker
function quickSortInPlace(arr, low = 0, high = arr.length - 1) {
  const INSERTION_SORT_THRESHOLD = 16;
  let comparisons = 0;
  let swaps = 0;

  function partition(low, high) {
    const pivotIndex = choosePivot(low, high);
    const pivot = arr[pivotIndex];
    // Move pivot to end
    swap(pivotIndex, high);
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      if (arr[j] < pivot) {
        i++;
        swap(i, j);
      }
    }
    swap(i + 1, high);
    return i + 1;
  }

  function choosePivot(low, high) {
    // Median of three
    const mid = low + Math.floor((high - low) / 2);
    if (arr[low] > arr[mid]) swap(low, mid);
    if (arr[low] > arr[high]) swap(low, high);
    if (arr[mid] > arr[high]) swap(mid, high);
    return mid;
  }

  function insertionSort(low, high) {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= low && arr[j] > key) {
        arr[j + 1] = arr[j];
        j--;
        swaps++;
      }
      arr[j + 1] = key;
    }
  }

  function swap(i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    swaps++;
  }

  while (low < high) {
    if (high - low < INSERTION_SORT_THRESHOLD) {
      insertionSort(low, high);
      break;
    }
    const pivotIndex = partition(low, high);
    if (pivotIndex - low < high - pivotIndex) {
      quickSortInPlace(arr, low, pivotIndex - 1);
      low = pivotIndex + 1;
    } else {
      quickSortInPlace(arr, pivotIndex + 1, high);
      high = pivotIndex - 1;
    }
  }

  return { comparisons, swaps };
}

function quickSort(arr) {
  const stats = quickSortInPlace(arr);
  return {
    sorted: arr,
    stats,
  };
}

// Listen for messages from main thread
self.onmessage = function (e) {
  const { array } = e.data;

  // Perform sorting
  const result = quickSort(array);

  // Send result back to main thread
  self.postMessage(result);
};
