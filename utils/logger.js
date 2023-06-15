// logger.js

import morgan from "morgan";
import { createLogger, format as _format, transports as _transports } from "winston";

const logger = createLogger({
  level: "info",
  format: _format.combine(_format.timestamp(), _format.json()),
  defaultMeta: { service: "my-app" },
  transports: [new _transports.Console(), new _transports.File({ filename: "error.log", level: "error" }), new _transports.File({ filename: "combined.log" })],
});

const format = ":method :url :status :response-time ms - :res[content-length]";

const morganLogger = morgan(format, {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    },
  },
});

export { morganLogger };
