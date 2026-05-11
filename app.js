/**
 * Sorting Visualizer - Main Application
 *
 * A comprehensive web-based sorting algorithm visualizer featuring:
 * - Real-time animation of sorting processes
 * - Multiple algorithm implementations (Quick Sort, Merge Sort, Bubble Sort)
 * - Interactive controls for array size, speed, and algorithm selection
 * - Custom array input support
 * - Performance statistics tracking
 * - Web Worker support for non-blocking Quick Sort execution
 * - Responsive design with modern UI
 *
 * Architecture:
 * - SortingVisualizer class: Main application controller
 * - Canvas-based visualization with color-coded elements
 * - Event-driven UI updates
 * - Error handling and input validation
 *
 * @author Generated with GitHub Copilot assistance
 * @version 1.0.0
 */

class SortingVisualizer {
  constructor() {
    this.canvas = document.getElementById('sortingCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.array = [];
    this.isRunning = false;
    this.comparisons = 0;
    this.swaps = 0;
    this.startTime = 0;
    this.worker = null;
    this.animationSpeed = 50;
    this.comparing = [];
    this.sorted = [];

    this.setupCanvas();
    this.attachEventListeners();
    this.generateArray();
  }

  /**
   * Setup canvas dimensions and resize on window resize
   */
  setupCanvas() {
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = 400;
    this.draw();
  }

  /**
   * Attach event listeners to buttons and inputs
   */
  attachEventListeners() {
    document.getElementById('arraySize').addEventListener('input', (e) => {
      document.getElementById('sizeDisplay').textContent = e.target.value;
      this.generateArray();
    });

    document.getElementById('speed').addEventListener('input', (e) => {
      this.animationSpeed = 101 - e.target.value;
      document.getElementById('speedDisplay').textContent = this.animationSpeed + 'ms';
    });

    document.getElementById('algorithm').addEventListener('change', (e) => {
      const parallelCheckbox = document.getElementById('parallelized');
      parallelCheckbox.disabled = e.target.value !== 'quicksort';
      if (e.target.value !== 'quicksort') {
        parallelCheckbox.checked = false;
      }
    });

    document.getElementById('generateBtn').addEventListener('click', () => this.generateArray());
    document.getElementById('sortBtn').addEventListener('click', () => this.startSort());
    document.getElementById('resetBtn').addEventListener('click', () => this.reset());
  }

  /**
   * Generate random array or use custom input
   */
  generateArray() {
    if (this.isRunning) return;

    const customInput = document.getElementById('customArray').value.trim();
    const size = parseInt(document.getElementById('arraySize').value);

    try {
      if (customInput) {
        const parsed = customInput.split(',').map(n => {
          const num = parseFloat(n.trim());
          if (isNaN(num)) throw new Error(`Invalid number: ${n.trim()}`);
          return num;
        });
        if (parsed.length === 0) {
          throw new Error('Custom array cannot be empty');
        }
        if (parsed.length > 500) {
          throw new Error('Custom array too large (max 500 elements)');
        }
        this.array = parsed;
        document.getElementById('sizeDisplay').textContent = this.array.length;
      } else {
        if (size < 5 || size > 500) {
          throw new Error('Array size must be between 5 and 500');
        }
        this.array = Array.from({ length: size }, () => Math.floor(Math.random() * 100) + 1);
        document.getElementById('sizeDisplay').textContent = size;
      }

      this.sorted = [];
      this.resetStats();
      this.draw();
      this.updateSortedText();

      document.getElementById('sortBtn').disabled = false;
      document.getElementById('resetBtn').disabled = false;
      document.getElementById('status').textContent = 'Ready';
    } catch (error) {
      alert(`Array generation error: ${error.message}`);
      document.getElementById('status').textContent = 'Error';
    }
  }

  /**
   * Start sorting process
   */
  async startSort() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.resetStats();
    this.startTime = performance.now();
    document.getElementById('generateBtn').disabled = true;
    document.getElementById('sortBtn').disabled = true;
    document.getElementById('status').textContent = 'Sorting...';
    this.scrollToOutput();

    const algorithm = document.getElementById('algorithm').value;
    const useWorker =
      document.getElementById('parallelized').checked && algorithm === 'quicksort';

    try {
      if (useWorker) {
        await this.sortWithWorker();
      } else {
        await this.sortWithMainThread();
      }
    } catch (error) {
      console.error('Sorting error:', error);
      document.getElementById('status').textContent = `Error: ${error.message}`;
      this.isRunning = false;
      document.getElementById('generateBtn').disabled = false;
      document.getElementById('sortBtn').disabled = false;
      return; // Don't call finishSort
    }

    this.finishSort();
  }

  /**
   * Sort using main thread
   */
  async sortWithMainThread() {
    const algorithm = document.getElementById('algorithm').value;

    const onCompare = (indices) => {
      this.comparing = indices;
    };

    const onSwap = (indices, arr) => {
      this.swaps++;
      this.comparisons++;
      this.updateStats();
      this.draw();
    };

    const onCompareCallback = () => {
      this.comparisons++;
      this.updateStats();
    };

    if (algorithm === 'quicksort') {
      await SortingAlgorithms.quickSort(
        this.array,
        (indices) => {
          this.comparing = indices;
          onCompareCallback();
          this.draw();
        },
        onSwap
      );
    } else if (algorithm === 'mergesort') {
      await SortingAlgorithms.mergeSort(
        this.array,
        (indices) => {
          this.comparing = indices;
          onCompareCallback();
          this.draw();
        },
        onSwap
      );
    } else if (algorithm === 'bubblesort') {
      await SortingAlgorithms.bubbleSort(
        this.array,
        (indices) => {
          this.comparing = indices;
          onCompareCallback();
          this.draw();
        },
        onSwap
      );
    }

    await this.sleep(this.animationSpeed);
  }

  /**
   * Sort using Web Worker
   */
  async sortWithWorker() {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        this.worker = new Worker('sortWorker.js');
      }

      this.worker.onmessage = (e) => {
        const { sorted: sortedArray, stats } = e.data;
        this.array = sortedArray;
        this.comparisons = stats.comparisons;
        this.swaps = stats.swaps;
        this.updateStats();
        this.sorted = Array.from({ length: this.array.length }, (_, i) => i);
        this.draw();
        resolve();
      };

      this.worker.onerror = reject;
      this.worker.postMessage({ array: this.array });
    });
  }

  /**
   * Finish sorting
   */
  finishSort() {
    this.isRunning = false;
    const endTime = performance.now();
    const duration = (endTime - this.startTime).toFixed(2);
    document.getElementById('time').textContent = duration + 'ms';
    document.getElementById('status').textContent = 'Complete!';

    this.sorted = Array.from({ length: this.array.length }, (_, i) => i);
    this.comparing = [];
    this.draw();
    this.updateSortedText();
    this.scrollToOutput();
    this.highlightOutput();

    document.getElementById('generateBtn').disabled = false;
    document.getElementById('sortBtn').disabled = false;
  }

  /**
   * Reset sorting visualizer
   */
  reset() {
    this.array = [];
    this.sorted = [];
    this.comparing = [];
    this.resetStats();
    document.getElementById('customArray').value = '';
    this.generateArray();
    document.getElementById('status').textContent = 'Ready';
  }

  /**
   * Reset statistics counters
   */
  resetStats() {
    this.comparisons = 0;
    this.swaps = 0;
    this.updateStats();
  }

  /**
   * Update statistics display
   */
  updateStats() {
    document.getElementById('comparisons').textContent = this.comparisons;
    document.getElementById('swaps').textContent = this.swaps;
  }

  scrollToOutput() {
    const canvasSection = document.querySelector('.canvas-container');
    if (canvasSection) {
      canvasSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  highlightOutput() {
    const canvasSection = document.querySelector('.canvas-container');
    const outputSection = document.querySelector('.sorted-output');
    if (canvasSection) {
      canvasSection.classList.add('highlight');
      setTimeout(() => canvasSection.classList.remove('highlight'), 2000);
    }
    if (outputSection) {
      outputSection.classList.add('highlight');
      setTimeout(() => outputSection.classList.remove('highlight'), 2000);
    }
  }

  /**
   * Update sorted array text display
   */
  updateSortedText() {
    const output = document.getElementById('sortedArrayText');
    output.textContent = this.array.length ? this.array.join(', ') : '[]';
  }

  /**
   * Draw canvas visualization
   */
  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#1e1e2e';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Calculate bar properties
    const barWidth = this.canvas.width / this.array.length;
    const maxValue = Math.max(...this.array);
    const barHeightScale = this.canvas.height / maxValue;

    // Draw bars
    for (let i = 0; i < this.array.length; i++) {
      const barHeight = this.array[i] * barHeightScale;
      const x = i * barWidth;
      const y = this.canvas.height - barHeight;

      // Determine bar color
      let color = '#60a5fa'; // Default blue
      if (this.sorted.includes(i)) {
        color = '#34d399'; // Green for sorted
      } else if (this.comparing.includes(i)) {
        color = '#f97316'; // Orange for comparing
      }

      // Draw bar
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, barWidth - 1, barHeight);

      // Draw bar outline
      this.ctx.strokeStyle = '#6366f1';
      this.ctx.lineWidth = 0.5;
      this.ctx.strokeRect(x, y, barWidth - 1, barHeight);
    }
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Initialize visualizer when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.visualizer = new SortingVisualizer();
});
