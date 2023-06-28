import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("metricsScheduler", () => ({
  cron: process.env.METRICS_SCHEDULER_CRON,
  seconds: process.env.METRICS_SCHEDULER_SECONDS,
  startdate_timestamp: process.env.METRICS_SCHEDULER_STARTDATE_TIMESTAMP,
  batch_size: process.env.METRICS_SCHEDULER_BATCH_SIZE,
  interval: process.env.METRICS_SCHEDULER_INTERVAL,
}));
