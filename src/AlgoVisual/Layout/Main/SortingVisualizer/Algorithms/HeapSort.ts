export function getHeapSortAnimations(arr: number[]) {
    let animations: [number, number, boolean][] = [];
    heapSort(arr, animations);
    return animations;
}

function heapSort(arr: number[], animations: [number, number, boolean][]) {
    let n = arr.length;
    for (let k = n / 2; k >= 1; k--) {
        sink(arr, k, n, animations);
    }

    let k = n;
    while (k > 1) {
        swap(arr, 1, k--, animations);
        sink(arr, 1, k, animations);
    }
}

// helper methods
function sink(arr: number[], k: number, n: number, animations: [number, number, boolean][]) {
    while (2 * k <= n) {
        let j = 2 * k;
        if (j < n && less(arr, j, j + 1)) {
            j++;
        }

        if (!less(arr, k, j)) {
            break;
        }
        swap(arr, k, j, animations);
        k = j;
    }
}

function less(arr: number[], i: number, j: number) {
    return arr[i - 1] < arr[j - 1];
}

function swap(arr: number[], i: number, j: number, animations: [number, number, boolean][]) {
    animations.push([i - 1, i - 1, true]);
    animations.push([i - 1, i - 1, true]);
    animations.push([i - 1, arr[j - 1], false]);
    animations.push([j - 1, j - 1, true])
    animations.push([j - 1, j - 1, true])
    animations.push([j - 1, arr[i - 1], false]);
    let temp = arr[i - 1];
    arr[i - 1] = arr[j - 1];
    arr[j - 1] = temp;
}
