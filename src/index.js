const { sequelize, User } = require("../models");

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

async function testQuery() {
  return new Promise(async (resolve, reject) => {
    const transaction = await sequelize.transaction();
    const id = Math.floor(Math.random() * 2000) + 1;
    try {
      await User.update(
        {
          firstName: "Bart",
          lastName: "Simpson",
        },
        {
          where: {
            id,
          },
          transaction,
        }
      );

      // await User.destroy(
      //   {
      //     where: {
      //       id,
      //     },
      //     transaction,
      //   }
      // );

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, Math.floor(Math.random() * 10) + 1);
      });

      if (id <= 1000) {
        throw new Error("test error");
      }

      await User.update(
        {
          firstName: "Lisa",
          lastName: "Simpson",
        },
        {
          where: {
            id,
          },
          transaction,
        }
      );

      // If the execution reaches this line, no errors were thrown.
      // We commit the transaction.
      await transaction.commit();
      resolve(true);
    } catch (error) {
      // If the execution reaches this line, an error was thrown.
      // We rollback the transaction.
      await transaction.rollback();
      reject(error);
    }
  });
}

function setImmediatePromise() {
  return new Promise((resolve) => {
    if (queue.length < (process.env.MAX_QUEUE_LENGTH || 1000)) {
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
    console.log("done", JSON.stringify(statistic, " ", 4));
    process.exit(0);
  });
}

process.on("SIGINT", handleStop);
process.on("SIGTERM", handleStop);
