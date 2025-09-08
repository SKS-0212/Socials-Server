import rateLimit from "express-rate-limit"

const limiter = rateLimit({
    windowMs: 1000 * 60 * 15,
    limit: 100
});

export default limiter;