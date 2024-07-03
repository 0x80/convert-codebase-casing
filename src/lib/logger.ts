import type { ChalkInstance } from "chalk";
import chalk from "chalk";

type LogLevel = "error" | "warn" | "info" | "debug";

type ACTUAL_ANY = any;

class Logger {
  private level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  setLevel(level: LogLevel) {
    this.level = level;
  }

  private shouldLog(messageLevel: LogLevel): boolean {
    const levels: LogLevel[] = ["error", "warn", "info", "debug"];
    return levels.indexOf(messageLevel) <= levels.indexOf(this.level);
  }

  private log(
    level: LogLevel,
    color: ChalkInstance,
    ...messages: ACTUAL_ANY[]
  ) {
    if (this.shouldLog(level)) {
      const timestamp = new Date().toISOString();
      const formattedMessage = messages
        .map((m) => (typeof m === "string" ? m : JSON.stringify(m)))
        .join(" ");
      console.log(`${chalk.gray(timestamp)} ${color(formattedMessage)}`);
    }
  }

  error(err: Error | string, ...messages: ACTUAL_ANY[]) {
    const errorMessage = err instanceof Error ? err.message : err;
    this.log("error", chalk.red, errorMessage, ...messages);
  }

  warn(...messages: ACTUAL_ANY[]) {
    this.log("warn", chalk.yellow, ...messages);
  }

  info(...messages: ACTUAL_ANY[]) {
    this.log("info", chalk.blue, ...messages);
  }

  debug(...messages: ACTUAL_ANY[]) {
    this.log("debug", chalk.green, ...messages);
  }
}

export const logger = new Logger();
