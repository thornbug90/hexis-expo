import { ApolloServer } from "apollo-server-express";
import express from "express";
import * as Sentry from "@sentry/node";

import schema from "./schema";
import redis from "./lib/redis";
import jobScheduler from "./jobs";
import { checkRequiredEnvVars } from "./utils/requiredEnvVars";

// check all required environment variables are exist
checkRequiredEnvVars(process.env);

//BullMQ scheduler
void jobScheduler();

// logging
// if (process.env.NODE_ENV === "production") {
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.2,
});
// }

// setup express
const app = express();

// setup apollo
const apollo = new ApolloServer({
  schema,
  introspection: true,
  context: ({ req, res }) => ({ req, res }),
});

// start function
const startServer = async () => {
  await redis.connect();
  await apollo.start();
  apollo.applyMiddleware({ app, path: "/" });
  app.listen(process.env.PORT);

  console.info(`Live on port:${process.env.PORT}${apollo.graphqlPath}`);
};

// 1,2,3 Go
void startServer();
