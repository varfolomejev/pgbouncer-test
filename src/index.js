const sequelize = require("./db");

// Begin reading from stdin so the process does not exit.
process.stdin.resume();

let inProgress = true;
const queue = [];
const statistic = {
  startTime: new Date().getTime(),
  endTime: null,
  queriesCount: 0,
  doneQueries: 0,
  errorQueries: 0,
  queriesPerSecond: 0,
};

function testQuery() {
  return sequelize.query("SELECT * FROM pg_stat_activity;");
}

function setImmediatePromise() {
  return new Promise((resolve) => {
    if (queue.length < (process.env.MAX_QUEUE_LENGTH || 100)) {
      queue.push(true);
      statistic.queriesCount++;
      testQuery()
        .then(() => {
          queue.pop();
          statistic.doneQueries++;
        })
        .catch((err) => {
          queue.pop();
          statistic.errorQueries++;
        });
    }
    setImmediate(() => resolve());
  });
}

async function start() {
  while (inProgress) {
    await setImmediatePromise();
  }
}

console.log("Press Ctrl+C to stop testing");
start();

function handleStop() {
  inProgress = false;
  sequelize.connectionManager.close().then(() => {
    statistic.endTime = new Date().getTime();
    statistic.queriesPerSecond = Math.floor(
      statistic.queriesCount /
        ((statistic.endTime - statistic.startTime) / 1000)
    );
    console.log("DB connection shut down gracefully");
    console.log('done', JSON.stringify(statistic, " ", 4));
    process.exit(0);
  });
}

process.on("SIGINT", handleStop);
process.on("SIGTERM", handleStop);
