# Pioneer Delivery Algorithm Portfolio - Part I

## Language and requirements

This project is written in **JavaScript** and runs with **Node.js 16 or newer**.

The program uses only built-in Node.js modules and does not require external packages.

# Pioneer Delivery Algorithm Portfolio - Part I

This project implements greedy scheduling algorithms for Pioneer Delivery.

## GitHub Repository

The complete Pioneer Delivery JavaScript project is available on GitHub:

[View the Pioneer Delivery Project on GitHub](https://github.com/pracheepatil/Portfolio-Greedy-Algorithm)

The repository includes the JavaScript source code, test cases, sample data, and documentation.


## Files

- `pioneer_delivery.js` - source code for Tasks A-D, input parsing, output, and a custom binary min-heap.
- `test_pioneer_delivery.js` - automated tests for every required Task A, B, and C case, plus Task D validation.
- `sample_deliveries.txt` - test data file in the required format.
- `package.json` - npm commands.

## Input-file format

Each delivery is in the following format:

```text
delivery_id start_time finish_time
```

Example:

```text
D01 10 13
D02 2 5
```

## instructions to run the Programme

1. Install Node.js from https://nodejs.org if it is not already installed.
2. Open the project folder in Visual Studio Code.
3. Open the VS Code terminal.

JavaScript does not require a separate compilation step. The project has no external dependencies, so `npm install` is optional.

Run the automated tests with:

```bash
npm test
```

The expected result is:

```text
All JavaScript tests passed.
```

Run the individual tasks with:

```bash
npm run task-a
npm run task-b
npm run task-c
npm run task-d
```

Equivalent direct commands are:

```bash
node pioneer_delivery.js A sample_deliveries.txt
node pioneer_delivery.js B sample_deliveries.txt
node pioneer_delivery.js C sample_deliveries.txt
node pioneer_delivery.js D
```

The input file used by Tasks A-C is `sample_deliveries.txt`.

## Program organization

`Delivery` represents an interval. `readDeliveries` reads and validates the input file. `maximumOneDriver` implements Task A. `MinHeap` implements the priority queue required by Task B. `minimumDrivers` assigns deliveries to drivers. `minimumRejected` implements Task C using Task A. Task D uses `taskDCounterexample`, `greedyProfitSchedule`, and `scheduleValue`. The `printTask...` functions format output and `main` processes command-line arguments.

## Task A - Maximum deliveries for one driver

The greedy choice is the compatible delivery with the earliest finish time. The program sorts by finish time and selects a delivery when its start time is at least the finish time of the last selected delivery.

This is optimal because an earliest-finishing compatible delivery leaves at least as much time for future deliveries as any other possible first delivery. Replacing the first delivery of an optimal schedule with the greedy delivery cannot make the remaining deliveries incompatible. Repeating this exchange argument proves optimality.

Sorting takes `O(n log n)` time and the scan takes `O(n)`, so the total running time is `O(n log n)`.

## Task B - Minimum number of drivers

The min-heap stores `(finish_time, driver_number)` for each driver currently assigned a delivery. Deliveries are processed in increasing start-time order.

For each delivery, the program checks the driver with the smallest finish time. If that finish time is less than or equal to the new delivery's start time, the driver is reused. Otherwise, a new driver is created.

If no existing driver is available, the new delivery overlaps every existing driver, so another driver is unavoidable. Therefore, the algorithm creates a new driver only when necessary and uses the minimum possible number.

Sorting and heap operations take `O(n log n)` total time. The heap and schedules use `O(n)` space.

## Task C - Minimum rejected deliveries

Task C is the complement of Task A. If the maximum compatible schedule contains `k` deliveries, then the minimum number rejected is `n - k`. The program calls the Task A algorithm and returns `n - k`.

The running time is `O(n log n)`.

## Task D - Counterexample

Each delivery takes one time unit:

| Delivery | Ready time `Rj` | Profit `Pj` |
|---|---:|---:|
| A | 0 | 100 |
| B | 0 | 99 |
| C | 1 | 98 |

The profits are positive and pairwise different. The proposed greedy strategy processes A, B, C in decreasing profit order and produces:

```text
A at time 0, B at time 1, C at time 2
```

Using `Vj = Pj / (1 + Dj)`:

```text
V(G) = 100/(1+0) + 99/(1+1) + 98/(1+1)
     = 100 + 49.5 + 49
     = 198.5
```

A better schedule is:

```text
B at time 0, C at time 1, A at time 2
```

Its value is:

```text
V(S) = 99/(1+0) + 98/(1+0) + 100/(1+2)
     = 99 + 98 + 33.333...
     = 230.333...
```

Because `V(S) > V(G)`, the proposed greedy strategy is not always optimal.

The automated tests verify the Task D input conditions, valid schedules, the greedy schedule, `V(G) = 198.5`, and that the better schedule has a larger value.

## Required test-case results

| Case | Task A maximum | Task B minimum drivers | Task C minimum rejected |
|---:|---:|---:|---:|
| 1 | 0 | 0 | 0 |
| 2 | 1 | 1 | 0 |
| 3 | 3 | 1 | 0 |
| 4 | 1 | 3 | 2 |
| 5 | 3 | 2 | 1 |
| 6 | 2 | 2 | 1 |

Task D test output:

```text
V(G) = 198.500000
V(S) = 230.333333
```
