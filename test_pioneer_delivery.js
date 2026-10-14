"use strict";

const assert = require("assert");

const {
  Delivery,
  maximumOneDriver,
  minimumDrivers,
  minimumRejected,
  taskDCounterexample,
  greedyProfitSchedule,
  scheduleValue,
} = require("./pioneer_delivery");

function make(intervals) {
  return intervals.map(
    ([start, finish], index) =>
      new Delivery(`D${index + 1}`, start, finish)
  );
}

/* Task A required test cases. */
const taskACases = [
  [[], 0],
  [[[1, 3]], 1],
  [[[1, 3], [3, 5], [5, 7]], 3],
  [[[1, 5], [2, 6], [3, 7]], 1],
  [[[5, 7], [1, 3], [3, 5], [2, 4]], 3],
  [[[1, 4], [2, 4], [4, 6]], 2],
];

taskACases.forEach(([intervals, expected]) => {
  assert.strictEqual(
    maximumOneDriver(make(intervals)).length,
    expected
  );
});

/* Task B required test cases. */
const taskBCases = [
  [[], 0],
  [[[1, 3]], 1],
  [[[1, 3], [3, 5], [5, 7]], 1],
  [[[1, 5], [2, 6], [3, 7]], 3],
  [[[1, 4], [2, 5], [4, 7], [5, 8]], 2],
  [[[5, 8], [1, 4], [2, 5], [4, 6], [6, 9]], 2],
];

taskBCases.forEach(([intervals, expected]) => {
  const schedules = minimumDrivers(make(intervals));

  assert.strictEqual(schedules.length, expected);

  schedules.forEach((schedule) => {
    for (let i = 1; i < schedule.length; i++) {
      assert.ok(
        schedule[i - 1].finish <= schedule[i].start
      );
    }
  });
});

/* Task C required test cases. */
const taskCCases = [
  [[], 0],
  [[[1, 3]], 0],
  [[[1, 3], [3, 5], [5, 7]], 0],
  [[[1, 5], [2, 6], [3, 7]], 2],
  [[[5, 7], [1, 3], [3, 5], [2, 4]], 1],
  [[[1, 2], [2, 3], [3, 4], [1, 3]], 1],
];

taskCCases.forEach(([intervals, expected]) => {
  assert.strictEqual(
    minimumRejected(make(intervals)).rejected,
    expected
  );
});

/* Task D tests. */
const taskDDeliveries = taskDCounterexample();
const greedySchedule = greedyProfitSchedule(taskDDeliveries);
const betterSchedule = {
  B: 0,
  C: 1,
  A: 2,
};

/* Profits must be positive and different. */
assert.ok(
  taskDDeliveries.every((delivery) => delivery.profit > 0)
);

assert.strictEqual(
  new Set(taskDDeliveries.map((delivery) => delivery.profit)).size,
  taskDDeliveries.length
);

/* Check that all schedules are valid. */
[greedySchedule, betterSchedule].forEach((schedule) => {
  const slots = taskDDeliveries.map(
    (delivery) => schedule[delivery.id]
  );

  assert.strictEqual(new Set(slots).size, slots.length);

  taskDDeliveries.forEach((delivery) => {
    assert.ok(schedule[delivery.id] >= delivery.ready);
  });
});

/* Check the greedy result and calculated values. */
assert.deepStrictEqual(greedySchedule, {
  A: 0,
  B: 1,
  C: 2,
});

assert.ok(
  Math.abs(
    scheduleValue(taskDDeliveries, greedySchedule) - 198.5
  ) < 0.000001
);

assert.ok(
  scheduleValue(taskDDeliveries, betterSchedule) >
    scheduleValue(taskDDeliveries, greedySchedule)
);

console.log("All JavaScript tests passed.");