import { createCustomLogger } from "@socials/common";

// Create logger instance
const logger = createCustomLogger({
    service: "api-gateway",
    NODE_ENV: process.env.NODE_ENV || "development",
});

export { logger };