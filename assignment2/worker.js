// worker.js
const { parentPort } = require("worker_threads");

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

parentPort.on("message", ({ taskId, payload }) => {
  const start = Date.now();

  // CPU-bound task
  const result = fibonacci(payload);

  const timeTaken = Date.now() - start;

  parentPort.postMessage({
    taskId,
    result,
    timeTaken,
  });
});

