import winston from "winston";

const level = process.env.APP_ENV === "development" ? "debug" : "info";

const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
