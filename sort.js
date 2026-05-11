// ============================================================================
// VERSION 1: OPTIMIZED (Tail Call Optimization + Insertion Sort Hybrid)
// ============================================================================
function quickSort(array) {
    if (!Array.isArray(array)) {
        throw new TypeError('Input must be an array');
    }

    const arr = [...array];
    quickSortInPlace(arr, 0, arr.length - 1);
    return arr;
}

function quickSortInPlace(arr, low, high) {
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

// ============================================================================
// VERSION 2: PURE RECURSIVE (Standard recursion, no optimizations)
// ============================================================================
function quickSortRecursive(array) {
    if (!Array.isArray(array)) {
        throw new TypeError('Input must be an array');
    }

    const arr = [...array];
    quickSortRecursiveHelper(arr, 0, arr.length - 1);
    return arr;
}

function quickSortRecursiveHelper(arr, low, high) {
    // Base case: if partition size is 1 or less, it's already sorted
    if (low < high) {
        // Partition and get the pivot's final position
        const pivotIndex = partition(arr, low, high);

        // Recursively sort left partition (elements < pivot)
        quickSortRecursiveHelper(arr, low, pivotIndex - 1);

        // Recursively sort right partition (elements > pivot)
        quickSortRecursiveHelper(arr, pivotIndex + 1, high);
    }
}

// ============================================================================
// VERSION 3: ITERATIVE (Explicit stack, no recursive calls)
// ============================================================================
function quickSortIterative(array) {
    if (!Array.isArray(array)) {
        throw new TypeError('Input must be an array');
    }

    const arr = [...array];
    quickSortIterativeHelper(arr, 0, arr.length - 1);
    return arr;
}

function quickSortIterativeHelper(arr, low, high) {
    // LEARNING: Instead of using the call stack (recursion), we create an explicit
    // stack (array) to store partition ranges [low, high].
    // This allows us to "mimic" recursion without recursive function calls.
    const stack = [];

    // Push the initial range onto the stack
    stack.push(low);
    stack.push(high);

    // Process partitions while stack is not empty
    while (stack.length > 0) {
        // Pop the current range from stack
        // LEARNING: Think of pop() as unwinding a recursive call.
        high = stack.pop();
        low = stack.pop();

        // Partition the current range and get pivot's final position
        const pivotIndex = partition(arr, low, high);

        // LEARNING: In recursion, we'd call:
        //   quickSortRecursiveHelper(arr, low, pivotIndex - 1);
        // In iteration, we push that work onto the stack for later processing.

        // Push left partition (if it exists)
        // LEARNING: If low < pivotIndex - 1, there are elements to sort on the left
        if (low < pivotIndex - 1) {
            stack.push(low);
            stack.push(pivotIndex - 1);
        }

        // Push right partition (if it exists)
        // LEARNING: If pivotIndex + 1 < high, there are elements to sort on the right
        if (pivotIndex + 1 < high) {
            stack.push(pivotIndex + 1);
            stack.push(high);
        }

        // LEARNING: The loop continues and processes the next range from the stack.
        // This is how we avoid deep recursion while maintaining the same logic.
    }
}

function partition(arr, low, high) {
    const pivotIndex = choosePivotIndex(arr, low, high);
    const pivotValue = arr[pivotIndex];
    swap(arr, pivotIndex, high);

    let storeIndex = low;
    for (let i = low; i < high; i += 1) {
        if (arr[i] < pivotValue) {
            swap(arr, i, storeIndex);
            storeIndex += 1;
        }
    }

    swap(arr, storeIndex, high);
    return storeIndex;
}

function choosePivotIndex(arr, low, high) {
    const mid = low + Math.floor((high - low) / 2);
    const a = arr[low];
    const b = arr[mid];
    const c = arr[high];

    if ((a <= b && b <= c) || (c <= b && b <= a)) {
        return mid;
    }
    if ((b <= a && a <= c) || (c <= a && a <= b)) {
        return low;
    }

    return high;
}

function insertionSort(arr, low, high) {
    for (let i = low + 1; i <= high; i += 1) {
        const value = arr[i];
        let j = i - 1;

        while (j >= low && arr[j] > value) {
            arr[j + 1] = arr[j];
            j -= 1;
        }

        arr[j + 1] = value;
    }
}

function swap(arr, i, j) {
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

module.exports = {
    quickSort,                    // Optimized version
    quickSortRecursive,          // Pure recursive version
    quickSortIterative           // Iterative version with explicit stack
};
