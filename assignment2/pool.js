// pool.js
const { Worker } = require("worker_threads");
const path = require("path");

class WorkerPool {
    constructor(size = 4) {
        this.size = size;
        this.workers = [];
        this.idleWorkers = [];
        this.queue = [];

        this.stats = new Map(); // workerId -> { tasks, totalTime }

        for (let i = 0; i < size; i++) {
            const worker = new Worker(path.join(__dirname, "worker.js"));
            worker.id = i;

            this.stats.set(i, { tasks: 0, totalTime: 0 });

            worker.on("message", (msg) => {
                this.stats.get(worker.id).tasks++;
                this.stats.get(worker.id).totalTime += msg.timeTaken;

                worker.currentResolve(msg);
                worker.currentResolve = null;

                this.idleWorkers.push(worker);
                this._processQueue();
            });

            this.workers.push(worker);
            this.idleWorkers.push(worker);
        }
    }

    runTask(task) {
        return new Promise((resolve) => {
            this.queue.push({ task, resolve });
            this._processQueue();
        });
    }

    _processQueue() {
        if (this.queue.length === 0 || this.idleWorkers.length === 0) return;

        const worker = this.idleWorkers.pop();
        const { task, resolve } = this.queue.shift();

        worker.currentResolve = resolve;
        worker.postMessage(task);
    }

    printStats() {
        console.log("\n📊 Worker Statistics:");
        for (const [id, stat] of this.stats.entries()) {
            const avg =
                stat.tasks === 0 ? 0 : (stat.totalTime / stat.tasks).toFixed(2);

            console.log(
                `Worker ${id}: tasks=${stat.tasks}, avgTime=${avg} ms`
            );
        }
    }

    destroy() {
        this.workers.forEach((w) => w.terminate());
    }
}

module.exports = WorkerPool;
