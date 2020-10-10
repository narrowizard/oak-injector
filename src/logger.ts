import { format, log, LogRecord } from "../deps.ts";

const loggerFormatter = (record: LogRecord) => {
  const e = new Error().stack;
  if (!e) {
    return `${record.levelName} ${format(
      record.datetime,
      "yyyy-MM-dd hh:mm:ss"
    )} ${record.msg}`;
  }
  const filenames = e.match(/at (.*)/g);
  if (!filenames) {
    return `${record.levelName} ${format(
      record.datetime,
      "yyyy-MM-dd hh:mm:ss"
    )} ${record.msg}`;
  }
  return `${record.levelName} ${format(
    record.datetime,
    "yyyy-MM-dd hh:mm:ss"
  )} ${filenames[8].replace(/.*\((.*)\)/g, "$1")} | ${record.msg}`;
};

await log.setup({
  handlers: {
    console: new log.handlers.ConsoleHandler("DEBUG", {
      formatter: loggerFormatter,
    }),
    file: new log.handlers.FileHandler("WARNING", {
      filename: "./oak-injector.log",
      formatter: loggerFormatter,
    }),
  },
  loggers: {
    default: {
      level: "DEBUG",
      handlers: ["console", "file"],
    },
  },
});

export default log.getLogger();
