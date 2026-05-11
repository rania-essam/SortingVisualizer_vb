/**
 * Sorting Algorithms Library
 *
 * This module provides optimized implementations of common sorting algorithms
 * with visualization hooks for real-time animation and performance tracking.
 *
 * Features:
 * - Input validation and error handling
 * - Async operations for smooth UI updates
 * - Optimized Quick Sort with median-of-three pivot and insertion sort threshold
 * - Stable Merge Sort implementation
 * - Bubble Sort for educational purposes
 *
 * @author Generated with GitHub Copilot assistance
 * @version 1.0.0
 */

class SortingAlgorithms {
  /**
   * Validate input array
   */
  static validateArray(arr) {
    if (!Array.isArray(arr)) {
      throw new Error('Input must be an array');
    }
    if (arr.length > 10000) {
      throw new Error('Array too large (max 10000 elements)');
    }
    for (let i = 0; i < arr.length; i++) {
      if (typeof arr[i] !== 'number' || isNaN(arr[i])) {
        throw new Error(`Invalid element at index ${i}: must be a number`);
      }
    }
  }

  /**
   * Optimized QuickSort Implementation with Median-of-Three and Insertion Sort threshold
   * @param {Array} arr - Array to sort
   * @param {Function} onCompare - Callback for comparison visualization
   * @param {Function} onSwap - Callback for swap visualization
   * @returns {Promise} Resolves when sorting is complete
   */
  static async quickSort(arr, onCompare, onSwap) {
    this.validateArray(arr);
    if (arr.length <= 1) return; // Edge case: already sorted or empty
    return new Promise(async (resolve) => {
      await this.quickSortInPlace(arr, 0, arr.length - 1, onCompare, onSwap);
      resolve();
    });
  }

  static async quickSortInPlace(arr, low, high, onCompare, onSwap) {
    const INSERTION_SORT_THRESHOLD = 16;
    while (low < high) {
      if (high - low < INSERTION_SORT_THRESHOLD) {
        await this.insertionSort(arr, low, high, onCompare, onSwap);
        break;
      }
      const pivotIndex = await this.partition(arr, low, high, onCompare, onSwap);
      if (pivotIndex - low < high - pivotIndex) {
        await this.quickSortInPlace(arr, low, pivotIndex - 1, onCompare, onSwap);
        low = pivotIndex + 1;
      } else {
        await this.quickSortInPlace(arr, pivotIndex + 1, high, onCompare, onSwap);
        high = pivotIndex - 1;
      }
    }
  }

  static async partition(arr, low, high, onCompare, onSwap) {
    const pivotIndex = this.choosePivot(arr, low, high);
    const pivot = arr[pivotIndex];
    // Move pivot to end
    await this.swap(arr, pivotIndex, high, onSwap);
    let i = low - 1;
    for (let j = low; j < high; j++) {  // FIXED: j < high instead of j <= high
      onCompare([j, high]);
      await this.sleep(0);
      if (arr[j] < pivot) {
        i++;
        await this.swap(arr, i, j, onSwap);
      }
    }
    await this.swap(arr, i + 1, high, onSwap);
    return i + 1;
  }

  static choosePivot(arr, low, high) {
    // Median of three
    const mid = low + Math.floor((high - low) / 2);
    if (arr[low] > arr[mid]) this.swapSync(arr, low, mid);
    if (arr[low] > arr[high]) this.swapSync(arr, low, high);
    if (arr[mid] > arr[high]) this.swapSync(arr, mid, high);
    return mid;
  }

  static async insertionSort(arr, low, high, onCompare, onSwap) {
    for (let i = low + 1; i <= high; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= low) {
        onCompare([j, j + 1]);
        await this.sleep(0);
        if (arr[j] <= key) break;
        await this.swap(arr, j, j + 1, onSwap);
        j--;
      }
      arr[j + 1] = key;
    }
  }

  static swapSync(arr, i, j) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  static async swap(arr, i, j, onSwap) {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onSwap([i, j], arr);
  }

  /**
   * MergeSort Implementation
   */
  static async mergeSort(arr, onCompare, onSwap) {
    this.validateArray(arr);
    if (arr.length <= 1) return; // Edge case: already sorted or empty
    return new Promise((resolve) => {
      const sort = async (left, right) => {
        if (left < right) {
          const mid = Math.floor((left + right) / 2);
          await sort(left, mid);
          await sort(mid + 1, right);
          await this.merge(arr, left, mid, right, onCompare, onSwap);
        }
      };
      sort(0, arr.length - 1).then(resolve);
    });
  }

  /**
   * Merge helper for MergeSort
   */
  static async merge(arr, left, mid, right, onCompare, onSwap) {
    const leftArr = arr.slice(left, mid + 1);
    const rightArr = arr.slice(mid + 1, right + 1);
    let i = 0,
      j = 0,
      k = left;

    while (i < leftArr.length && j < rightArr.length) {
      onCompare([left + i, mid + 1 + j]);
      await this.sleep(0);

      if (leftArr[i] <= rightArr[j]) {
        arr[k++] = leftArr[i++];
      } else {
        arr[k++] = rightArr[j++];
      }
      onSwap([k - 1], arr);
    }

    while (i < leftArr.length) {
      arr[k++] = leftArr[i++];
      onSwap([k - 1], arr);
    }

    while (j < rightArr.length) {
      arr[k++] = rightArr[j++];
      onSwap([k - 1], arr);
    }
  }

  /**
   * BubbleSort Implementation
   */
  static async bubbleSort(arr, onCompare, onSwap) {
    this.validateArray(arr);
    if (arr.length <= 1) return; // Edge case: already sorted or empty
    const n = arr.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        onCompare([j, j + 1]);
        await this.sleep(0);

        if (arr[j] > arr[j + 1]) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          onSwap([j, j + 1], arr);
        }
      }
    }
  }

  /**
   * Utility: Sleep function for async operations
   */
  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export for browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SortingAlgorithms;
}
