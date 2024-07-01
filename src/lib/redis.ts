import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_CONNECTION_STRING,
  password: process.env.REDIS_PASSWORD,
});
redis.on("error", err => console.log("Redis Client Error", err));

export default redis;
