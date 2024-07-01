import { Job, Queue, Worker } from "bullmq";
import { pushNotificationCronjob } from "../lib/pushNotification";

const jobScheduler = async () => {
  // connection to redis, redis holds completed and failed jobs from the queue , it helps in bringing durability to the schedules*/
  const redisURL = new URL(process.env.REDIS_CONNECTION_STRING as string);
  const redisPort = Number(redisURL.port);
  const redisHost = `${redisURL.hostname}`;

  const connection = {
    port: redisPort,
    host: redisHost,
  };

  // creating a queue object from the Queue class, the queue holds jobs to be done by the worker
  try {
    const queue = new Queue("scheduler", { connection });

    /**
     * adding the push-notification job to the queue, and added the following options:-
     *  1, repeat with a minute cron pattern, so it runs every minute.
     *  2, attempts shows the number of retries to do when the worker fails, the number of retries for this job is 5.
     *  3, backoff specifies the waiting time before retrying once a worker fails, the backoff object in this job indicates to wait exponentionally for every fail.
     */
    await queue.add(
      "push-notification",
      {},
      {
        repeat: {
          pattern: "* * * * *",
        },
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      },
    );

    // this is the worker that will process the job added in the queue,
    const worker = new Worker(
      "scheduler",
      async (job: Job) => {
        const jobName = job.name;

        if (jobName === "push-notification") {
          await pushNotificationCronjob();
        }
      },
      {
        connection,
      },
    );

    // on error the worker consoles instead of breaking
    worker.on("error", err => {
      console.error(err);
    });
  } catch (error) {
    console.error({ error });
  }
};

export default jobScheduler;
