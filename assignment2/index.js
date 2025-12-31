// index.js
const WorkerPool = require("./pool");

// ================= WITHOUT WORKERS =================
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.time("❌ Without Workers");

for (let i = 0; i < 50; i++) {
    fibonacci(35);
}

console.timeEnd("❌ Without Workers");

// ================= WITH WORKERS =================
(async () => {
    const pool = new WorkerPool(4);

    const tasks = Array.from({ length: 50 }, (_, i) => ({
        taskId: i,
        payload: 35,
    }));

    console.time("✅ With Worker Threads");

    await Promise.all(
        tasks.map((task) => pool.runTask(task))
    );

    console.timeEnd("✅ With Worker Threads");

    pool.printStats();
    pool.destroy();
})();
