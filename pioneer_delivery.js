"use strict";

const fs = require("fs");

/* Represents one delivery request. */
class Delivery {
  constructor(id, start, finish) {
    this.id = id;
    this.start = Number(start);
    this.finish = Number(finish);
  }
}

/* Reads delivery data from a text file. */
function readDeliveries(fileName) {
  const deliveries = [];
  const lines = fs.readFileSync(fileName, "utf8").split(/\r?\n/);

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    if (!line || line.startsWith("#")) return;

    const fields = line.split(/\s+/);

    if (fields.length !== 3) {
      throw new Error(`Line ${index + 1}: expected id start finish`);
    }

    const [id, start, finish] = fields;

    if (Number(start) >= Number(finish)) {
      throw new Error(`Line ${index + 1}: start must be less than finish`);
    }

    deliveries.push(new Delivery(id, start, finish));
  });

  return deliveries;
}

/*
Task A:
Sort deliveries by earliest finish time.
This greedy choice leaves the most time available for future deliveries.
*/
function maximumOneDriver(deliveries) {
  const sorted = [...deliveries].sort(
    (a, b) => a.finish - b.finish
  );

  const selected = [];
  let currentFinish = null;

  for (const delivery of sorted) {
    if (currentFinish === null || delivery.start >= currentFinish) {
      selected.push(delivery);
      currentFinish = delivery.finish;
    }
  }

  return selected;
}

/* Binary min-heap used for Task B. */
class MinHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(item) {
    this.items.push(item);

    let index = this.items.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);

      if (this.items[parent].finish <= this.items[index].finish) {
        break;
      }

      [this.items[parent], this.items[index]] = [
        this.items[index],
        this.items[parent],
      ];

      index = parent;
    }
  }

  pop() {
    if (this.items.length === 0) return undefined;

    const minimum = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0) {
      this.items[0] = last;

      let index = 0;

      while (true) {
        const left = index * 2 + 1;
        const right = index * 2 + 2;
        let smallest = index;

        if (
          left < this.items.length &&
          this.items[left].finish < this.items[smallest].finish
        ) {
          smallest = left;
        }

        if (
          right < this.items.length &&
          this.items[right].finish < this.items[smallest].finish
        ) {
          smallest = right;
        }

        if (smallest === index) break;

        [this.items[index], this.items[smallest]] = [
          this.items[smallest],
          this.items[index],
        ];

        index = smallest;
      }
    }

    return minimum;
  }
}

/*
Task B:
Process deliveries by start time.
The heap stores each driver's next available finish time.
Reuse the driver who becomes available earliest.
*/
function minimumDrivers(deliveries) {
  const sorted = [...deliveries].sort(
    (a, b) => a.start - b.start
  );

  const schedules = [];
  const heap = new MinHeap();

  for (const delivery of sorted) {
    let driverNumber;

    if (
      heap.size > 0 &&
      heap.peek().finish <= delivery.start
    ) {
      driverNumber = heap.pop().driver;
    } else {
      driverNumber = schedules.length;
      schedules.push([]);
    }

    schedules[driverNumber].push(delivery);

    heap.push({
      finish: delivery.finish,
      driver: driverNumber,
    });
  }

  return schedules;
}

/*
Task C:
If k deliveries can be kept, then n - k must be rejected.
*/
function minimumRejected(deliveries) {
  const selected = maximumOneDriver(deliveries);

  return {
    rejected: deliveries.length - selected.length,
    selected,
  };
}

/* Task D counterexample data. */
function taskDCounterexample() {
  return [
    { id: "A", ready: 0, profit: 100 },
    { id: "B", ready: 0, profit: 99 },
    { id: "C", ready: 1, profit: 98 },
  ];
}

/*
Task D greedy strategy:
Process by decreasing profit and choose the earliest
available slot at or after the ready time.
*/
function greedyProfitSchedule(deliveries) {
  const sorted = [...deliveries].sort(
    (a, b) => b.profit - a.profit
  );

  const schedule = {};
  const occupied = new Set();

  for (const delivery of sorted) {
    let time = delivery.ready;

    while (occupied.has(time)) {
      time++;
    }

    occupied.add(time);
    schedule[delivery.id] = time;
  }

  return schedule;
}

/* Calculates V(S) for Task D. */
function scheduleValue(deliveries, schedule) {
  return deliveries.reduce(
    (total, delivery) =>
      total +
      delivery.profit /
        (1 + schedule[delivery.id] - delivery.ready),
    0
  );
}

function displayTaskA(deliveries) {
  const selected = maximumOneDriver(deliveries);

  console.log("Selected deliveries:");

  selected.forEach((delivery) => {
    console.log(
      `  ${delivery.id}: ${delivery.start} -> ${delivery.finish}`
    );
  });

  console.log(`Total deliveries completed: ${selected.length}`);
}

function displayTaskB(deliveries) {
  const schedules = minimumDrivers(deliveries);

  schedules.forEach((schedule, index) => {
    const output = schedule
      .map((delivery) =>
        `${delivery.id}(${delivery.start}-${delivery.finish})`
      )
      .join(" ");

    console.log(`Driver ${index + 1}: ${output}`);
  });

  console.log(`Minimum drivers required: ${schedules.length}`);
}

function displayTaskC(deliveries) {
  const result = minimumRejected(deliveries);

  console.log("Deliveries kept:");

  result.selected.forEach((delivery) => {
    console.log(
      `  ${delivery.id}: ${delivery.start} -> ${delivery.finish}`
    );
  });

  console.log(`Minimum deliveries rejected: ${result.rejected}`);
}

function displayTaskD() {
  const deliveries = taskDCounterexample();

  const greedySchedule = greedyProfitSchedule(deliveries);

  const betterSchedule = {
    B: 0,
    C: 1,
    A: 2,
  };

  console.log("Counterexample:");

  deliveries.forEach((delivery) => {
    console.log(
      `  ${delivery.id}: R=${delivery.ready}, P=${delivery.profit}`
    );
  });

  console.log(
    `Greedy schedule: ${JSON.stringify(greedySchedule)}`
  );

  console.log(
    `V(G) = ${scheduleValue(
      deliveries,
      greedySchedule
    ).toFixed(6)}`
  );

  console.log(
    `Better schedule: ${JSON.stringify(betterSchedule)}`
  );

  console.log(
    `V(S) = ${scheduleValue(
      deliveries,
      betterSchedule
    ).toFixed(6)}`
  );
}

function main() {
  const [, , task, fileName] = process.argv;

  if (task === "D") {
    displayTaskD();
    return;
  }

  if (!["A", "B", "C"].includes(task) || !fileName) {
    console.log(
      "Usage: node pioneer_delivery.js A|B|C data.txt"
    );
    console.log("For Task D: node pioneer_delivery.js D");
    return;
  }

  const deliveries = readDeliveries(fileName);

  if (task === "A") displayTaskA(deliveries);
  if (task === "B") displayTaskB(deliveries);
  if (task === "C") displayTaskC(deliveries);
}

module.exports = {
  Delivery,
  MinHeap,
  readDeliveries,
  maximumOneDriver,
  minimumDrivers,
  minimumRejected,
  taskDCounterexample,
  greedyProfitSchedule,
  scheduleValue,
};

if (require.main === module) {
  main();
}