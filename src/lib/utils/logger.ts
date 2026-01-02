import winston from "winston";
import path from "path"
import fs from "fs"


const logDir = "logs"


if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}


const logFile = path.join(logDir, "app.log")


const level = process.env.NODE_ENV === "production" ? "info" : "debug";


const logger = winston.createLogger({
  level,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(
      (info) => `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message} `
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: logFile })
  ],
});


export default logger; 