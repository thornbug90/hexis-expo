import rateLimit from "express-rate-limit";

const rookRateLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds in milliseconds
  max: 1000,
  message: "You have exceeded the requests limit",
  standardHeaders: true,
  legacyHeaders: false,
});

export default rookRateLimiter;
