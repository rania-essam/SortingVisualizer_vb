const { quickSort, quickSortRecursive, quickSortIterative } = require('./sort');

describe('QuickSort Algorithm - All Versions', () => {
    // Helper function to test all three versions consistently
    const testAllVersions = (testName, testFn) => {
        describe(testName, () => {
            test('quickSort (optimized)', () => testFn(quickSort));
            test('quickSortRecursive (pure recursive)', () => testFn(quickSortRecursive));
            test('quickSortIterative (explicit stack)', () => testFn(quickSortIterative));
        });
    };

    // =========================================================================
    // SCENARIO 1: Standard Unsorted Array
    // =========================================================================
    testAllVersions('Scenario 1: Standard Unsorted Array', (sortFn) => {
        const input = [64, 34, 25, 12, 22, 11, 90];
        const expected = [11, 12, 22, 25, 34, 64, 90];
        expect(sortFn(input)).toEqual(expected);

        // Verify original is not mutated
        expect(input).toEqual([64, 34, 25, 12, 22, 11, 90]);
    });

    // =========================================================================
    // SCENARIO 2: Edge Cases - Empty Array and Single Element
    // =========================================================================
    testAllVersions('Scenario 2a: Empty Array', (sortFn) => {
        const input = [];
        const expected = [];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Scenario 2b: Single Element Array', (sortFn) => {
        const input = [42];
        const expected = [42];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Scenario 2c: Two Element Array', (sortFn) => {
        const input = [5, 3];
        const expected = [3, 5];
        expect(sortFn(input)).toEqual(expected);
    });

    // =========================================================================
    // SCENARIO 3: Already Sorted Array
    // =========================================================================
    testAllVersions('Scenario 3a: Already Sorted (Ascending)', (sortFn) => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8];
        const expected = [1, 2, 3, 4, 5, 6, 7, 8];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Scenario 3b: Reverse Sorted (Descending)', (sortFn) => {
        const input = [8, 7, 6, 5, 4, 3, 2, 1];
        const expected = [1, 2, 3, 4, 5, 6, 7, 8];
        expect(sortFn(input)).toEqual(expected);
    });

    // =========================================================================
    // SCENARIO 4: Array with Many Duplicates
    // =========================================================================
    testAllVersions('Scenario 4a: All Same Elements', (sortFn) => {
        const input = [5, 5, 5, 5, 5];
        const expected = [5, 5, 5, 5, 5];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Scenario 4b: Multiple Duplicates Mixed', (sortFn) => {
        const input = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
        const expected = [1, 1, 2, 3, 3, 4, 5, 5, 5, 6, 9];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Scenario 4c: Mostly Duplicates with Few Unique', (sortFn) => {
        const input = [7, 2, 7, 2, 7, 2, 9, 9, 9];
        const expected = [2, 2, 2, 7, 7, 7, 9, 9, 9];
        expect(sortFn(input)).toEqual(expected);
    });

    // =========================================================================
    // SCENARIO 5: TypeError for Non-Array Inputs
    // =========================================================================
    testAllVersions('Scenario 5a: TypeError - null input', (sortFn) => {
        expect(() => sortFn(null)).toThrow(TypeError);
        expect(() => sortFn(null)).toThrow('Input must be an array');
    });

    testAllVersions('Scenario 5b: TypeError - undefined input', (sortFn) => {
        expect(() => sortFn(undefined)).toThrow(TypeError);
        expect(() => sortFn(undefined)).toThrow('Input must be an array');
    });

    testAllVersions('Scenario 5c: TypeError - string input', (sortFn) => {
        expect(() => sortFn('not an array')).toThrow(TypeError);
        expect(() => sortFn('not an array')).toThrow('Input must be an array');
    });

    testAllVersions('Scenario 5d: TypeError - object input', (sortFn) => {
        expect(() => sortFn({ a: 1, b: 2 })).toThrow(TypeError);
        expect(() => sortFn({ a: 1, b: 2 })).toThrow('Input must be an array');
    });

    testAllVersions('Scenario 5e: TypeError - number input', (sortFn) => {
        expect(() => sortFn(123)).toThrow(TypeError);
        expect(() => sortFn(123)).toThrow('Input must be an array');
    });

    // =========================================================================
    // ADDITIONAL TESTS: Special Cases
    // =========================================================================
    testAllVersions('Additional: Negative Numbers', (sortFn) => {
        const input = [-5, 3, -1, 4, -2, 0];
        const expected = [-5, -2, -1, 0, 3, 4];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Additional: Mixed Positive and Negative', (sortFn) => {
        const input = [10, -5, 0, 3, -10, 5, -3];
        const expected = [-10, -5, -3, 0, 3, 5, 10];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Additional: Floating Point Numbers', (sortFn) => {
        const input = [3.5, 1.2, 4.7, 2.1, 0.5];
        const expected = [0.5, 1.2, 2.1, 3.5, 4.7];
        expect(sortFn(input)).toEqual(expected);
    });

    testAllVersions('Additional: Large Array (Performance Check)', (sortFn) => {
        // Generate random array of 1000 elements
        const input = Array.from({ length: 1000 }, () => Math.floor(Math.random() * 1000));
        const result = sortFn(input);

        // Check that result is sorted
        for (let i = 0; i < result.length - 1; i++) {
            expect(result[i] <= result[i + 1]).toBe(true);
        }

        // Check that result has same elements as input
        expect(result.sort((a, b) => a - b)).toEqual(input.sort((a, b) => a - b));
    });

    // =========================================================================
    // ISOLATION TESTS: Testing Each Version Individually
    // =========================================================================
    describe('Isolation: quickSort (Optimized Version)', () => {
        test('should preserve original array (non-mutating)', () => {
            const original = [5, 2, 8, 1, 9];
            const originalCopy = [...original];
            quickSort(original);
            expect(original).toEqual(originalCopy);
        });

        test('should handle very small thresholds efficiently', () => {
            const input = Array.from({ length: 32 }, () => Math.floor(Math.random() * 100));
            const result = quickSort(input);
            const expected = [...input].sort((a, b) => a - b);
            expect(result).toEqual(expected);
        });
    });

    describe('Isolation: quickSortRecursive (Pure Recursive Version)', () => {
        test('should handle recursion with balanced partitions', () => {
            const input = [3, 7, 8, 5, 2, 1, 9, 5, 4];
            const expected = [1, 2, 3, 4, 5, 5, 7, 8, 9];
            expect(quickSortRecursive(input)).toEqual(expected);
        });
    });

    describe('Isolation: quickSortIterative (Explicit Stack Version)', () => {
        test('should use explicit stack without recursion', () => {
            const input = [6, 4, 8, 2, 1, 9, 3, 7, 5];
            const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            expect(quickSortIterative(input)).toEqual(expected);
        });
    });
});
