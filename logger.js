import winston from "winston";
import { stringify as flattedStringify } from "flatted";

const isCircular = (obj) => {
  try {
    JSON.stringify(obj);
    return false;
  } catch (err) {
    return true;
  }
};

const startDate = new Date().toLocaleDateString().replaceAll(/\//g, "-");

const customFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.printf(({ timestamp, level, message }) => {
    const logMessage = Array.isArray(message)
      ? message.map((item) => {
          if (typeof item === "object") {
            return isCircular(item) ? flattedStringify(item, null, 2) : JSON.stringify(item, null, 2);
          }
          return item;
        }).join(" ")
      : typeof message === "object"
      ? isCircular(message) 
        ? flattedStringify(message, null, 2) 
        : JSON.stringify(message, null, 2)
      : message;

    return `${timestamp} [${level.toUpperCase()}]: ${logMessage}`;
  }),
);

const createLoggerWithMultipleArgs =
  (level) =>
  (...args) => {
    logger.log({
      level,
      message: args,
    });
  };

const logger = winston.createLogger({
  level: "info",
  format: customFormat,
  transports: [new winston.transports.Console(), new winston.transports.File({ filename: `${startDate}.log` })],
});

logger.info = createLoggerWithMultipleArgs("info");
logger.error = createLoggerWithMultipleArgs("error");
logger.warn = createLoggerWithMultipleArgs("warn");

const timers = {};

logger.time = (label) => {
  timers[label] = Date.now();
};

logger.timeEnd = (label) => {
  const startTime = timers[label];
  if (startTime) {
    const elapsedTime = Date.now() - startTime;
    logger.info(`${label}: ${elapsedTime}ms`);
    delete timers[label];
  } else {
    logger.warn(`No such label: ${label}`);
  }
};

export default logger;
