const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: { message: "Too many AI requests. Please try again in a minute." }
});

module.exports = { aiLimiter };