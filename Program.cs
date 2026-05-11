using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

// Add CORS for frontend integration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Use CORS
app.UseCors("AllowAll");

// ============================================================================
// QUICK SORT API ENDPOINT
// ============================================================================
app.MapPost("/api/sort/quicksort", (SortRequest request) =>
{
    try
    {
        var stopwatch = Stopwatch.StartNew();
        var stats = new SortStats();
        var array = request.Array.ToList();

        QuickSortMain(array, 0, array.Count - 1, stats);

        stopwatch.Stop();

        return Results.Ok(new SortResponse
        {
            SortedArray = array,
            Comparisons = stats.Comparisons,
            Swaps = stats.Swaps,
            ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            Algorithm = "QuickSort"
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
})
.WithName("QuickSort")
.WithOpenApi()
.WithDescription("Sort an array using QuickSort algorithm");

// ============================================================================
// MERGE SORT API ENDPOINT
// ============================================================================
app.MapPost("/api/sort/mergesort", (SortRequest request) =>
{
    try
    {
        var stopwatch = Stopwatch.StartNew();
        var stats = new SortStats();
        var array = request.Array.ToList();

        MergeSortMain(array, 0, array.Count - 1, stats);

        stopwatch.Stop();

        return Results.Ok(new SortResponse
        {
            SortedArray = array,
            Comparisons = stats.Comparisons,
            Swaps = stats.Swaps,
            ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            Algorithm = "MergeSort"
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
})
.WithName("MergeSort")
.WithOpenApi()
.WithDescription("Sort an array using MergeSort algorithm");

// ============================================================================
// BUBBLE SORT API ENDPOINT
// ============================================================================
app.MapPost("/api/sort/bubblesort", (SortRequest request) =>
{
    try
    {
        var stopwatch = Stopwatch.StartNew();
        var stats = new SortStats();
        var array = request.Array.ToList();

        BubbleSortMain(array, stats);

        stopwatch.Stop();

        return Results.Ok(new SortResponse
        {
            SortedArray = array,
            Comparisons = stats.Comparisons,
            Swaps = stats.Swaps,
            ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            Algorithm = "BubbleSort"
        });
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
})
.WithName("BubbleSort")
.WithOpenApi()
.WithDescription("Sort an array using BubbleSort algorithm");

// ============================================================================
// BENCHMARK API ENDPOINT
// ============================================================================
app.MapPost("/api/sort/benchmark", (SortRequest request) =>
{
    try
    {
        var results = new BenchmarkResults();

        // QuickSort Benchmark
        var qsArray = request.Array.ToList();
        var qsStats = new SortStats();
        var qsSw = Stopwatch.StartNew();
        QuickSortMain(qsArray, 0, qsArray.Count - 1, qsStats);
        qsSw.Stop();
        results.QuickSort = new BenchmarkResult
        {
            ExecutionTimeMs = qsSw.ElapsedMilliseconds,
            Comparisons = qsStats.Comparisons,
            Swaps = qsStats.Swaps
        };

        // MergeSort Benchmark
        var msArray = request.Array.ToList();
        var msStats = new SortStats();
        var msSw = Stopwatch.StartNew();
        MergeSortMain(msArray, 0, msArray.Count - 1, msStats);
        msSw.Stop();
        results.MergeSort = new BenchmarkResult
        {
            ExecutionTimeMs = msSw.ElapsedMilliseconds,
            Comparisons = msStats.Comparisons,
            Swaps = msStats.Swaps
        };

        // BubbleSort Benchmark
        var bsArray = request.Array.ToList();
        var bsStats = new SortStats();
        var bsSw = Stopwatch.StartNew();
        BubbleSortMain(bsArray, bsStats);
        bsSw.Stop();
        results.BubbleSort = new BenchmarkResult
        {
            ExecutionTimeMs = bsSw.ElapsedMilliseconds,
            Comparisons = bsStats.Comparisons,
            Swaps = bsStats.Swaps
        };

        return Results.Ok(results);
    }
    catch (Exception ex)
    {
        return Results.BadRequest(new { error = ex.Message });
    }
})
.WithName("Benchmark")
.WithOpenApi()
.WithDescription("Compare performance of all three sorting algorithms");

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
.WithName("HealthCheck")
.WithOpenApi();

app.Run();

// ============================================================================
// SORTING ALGORITHM IMPLEMENTATIONS
// ============================================================================

void QuickSortMain(List<int> arr, int low, int high, SortStats stats)
{
    if (low < high)
    {
        int pi = Partition(arr, low, high, stats);
        QuickSortMain(arr, low, pi - 1, stats);
        QuickSortMain(arr, pi + 1, high, stats);
    }
}

int Partition(List<int> arr, int low, int high, SortStats stats)
{
    int pivot = arr[high];
    int i = low - 1;

    for (int j = low; j < high; j++)
    {
        stats.Comparisons++;
        if (arr[j] < pivot)
        {
            i++;
            (arr[i], arr[j]) = (arr[j], arr[i]);
            stats.Swaps++;
        }
    }

    (arr[i + 1], arr[high]) = (arr[high], arr[i + 1]);
    stats.Swaps++;
    return i + 1;
}

void MergeSortMain(List<int> arr, int left, int right, SortStats stats)
{
    if (left < right)
    {
        int mid = left + (right - left) / 2;
        MergeSortMain(arr, left, mid, stats);
        MergeSortMain(arr, mid + 1, right, stats);
        Merge(arr, left, mid, right, stats);
    }
}

void Merge(List<int> arr, int left, int mid, int right, SortStats stats)
{
    var leftArr = arr.GetRange(left, mid - left + 1);
    var rightArr = arr.GetRange(mid + 1, right - mid);
    int i = 0, j = 0, k = left;

    while (i < leftArr.Count && j < rightArr.Count)
    {
        stats.Comparisons++;
        if (leftArr[i] <= rightArr[j])
        {
            arr[k++] = leftArr[i++];
        }
        else
        {
            arr[k++] = rightArr[j++];
        }
        stats.Swaps++;
    }

    while (i < leftArr.Count)
    {
        arr[k++] = leftArr[i++];
        stats.Swaps++;
    }

    while (j < rightArr.Count)
    {
        arr[k++] = rightArr[j++];
        stats.Swaps++;
    }
}

void BubbleSortMain(List<int> arr, SortStats stats)
{
    int n = arr.Count;
    for (int i = 0; i < n; i++)
    {
        for (int j = 0; j < n - i - 1; j++)
        {
            stats.Comparisons++;
            if (arr[j] > arr[j + 1])
            {
                (arr[j], arr[j + 1]) = (arr[j + 1], arr[j]);
                stats.Swaps++;
            }
        }
    }
}

// ============================================================================
// MODELS
// ============================================================================

public class SortRequest
{
    public int[] Array { get; set; }
}

public class SortResponse
{
    public List<int> SortedArray { get; set; }
    public long Comparisons { get; set; }
    public long Swaps { get; set; }
    public long ExecutionTimeMs { get; set; }
    public string Algorithm { get; set; }
}

public class BenchmarkResult
{
    public long ExecutionTimeMs { get; set; }
    public long Comparisons { get; set; }
    public long Swaps { get; set; }
}

public class BenchmarkResults
{
    public BenchmarkResult QuickSort { get; set; }
    public BenchmarkResult MergeSort { get; set; }
    public BenchmarkResult BubbleSort { get; set; }
}

public class SortStats
{
    public long Comparisons { get; set; } = 0;
    public long Swaps { get; set; } = 0;
}
