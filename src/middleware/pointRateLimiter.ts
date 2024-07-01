import rateLimit from "express-rate-limit";

const pointRateLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds in milliseconds
  max: 100,
  message: "You have exceeded the requests limit",
  standardHeaders: true,
  legacyHeaders: false,
});

export default pointRateLimiter;
