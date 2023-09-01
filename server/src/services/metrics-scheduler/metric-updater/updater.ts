import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { MetricsSchedulerConfigService } from "src/config/metrics-scheduler/configuration.service";
import { Metric } from "../../../database/entities/metric.entity";
import { MetricQuery } from "src/database/entities/metric-query.entity";
import { MetricsService } from "../../../metrics/metrics.service";
import { MetricQueryDetailsService } from "src/metrics/metric-query-details/query-details.service";

const INTERVALMS = 30000;
const MAXDATAPOINTS = 30;

@Injectable()
export class MetricUpdater {
  private logger: Logger;
  private m: MetricQuery;

  constructor(
    private schedulerConfig: MetricsSchedulerConfigService,
    private metric: MetricsService,
    private prometheusQueryDetails: MetricQueryDetailsService,
    @InjectRepository(Metric)
    private metricRepository: Repository<Metric>,
  ) {}

  with(m: MetricQuery) {
    this.m = m;
    this.logger = new Logger(`${MetricUpdater.name}(${m.id})`);
    return this;
  }

  // Insert a new metric value into the metrics table
  private async updateMetricNewValues(m: MetricQuery, timestamp) {
    // Retrieve the metric value from Grafana
    // Fetch the PromQL from the MetricQuery table to find the metric
    const latestMetric =
      await this.prometheusQueryDetails.getMetricQuerySingleValue(
        m.name,
        timestamp,
        INTERVALMS,
        MAXDATAPOINTS,
      );

    // Construct the metric
    const entity = new Metric();
    entity.metricQueryId = m;
    entity.timestamp = new Date(latestMetric[0]);

    entity.data = latestMetric[1];

    const result = await this.metricRepository.save(entity);

    return result;
  }

  // Seed metric values for a prometheusQuery
  // This is the main job of the metrics scheduler
  private async seedMetricPrometheusValues(m: MetricQuery) {
    // Get date of last metric for MetricQuery
    const MetricQueryId = m.id;
    const MetricQueryCreatedDate = m.createdDate;
    const seedMetricStartDate = await this.metric.seedMetricStartDate(
      MetricQueryCreatedDate,
      MetricQueryId,
    );

    const currentDate = new Date();
    let maxBatch: number;
    const defaultBatchSize = this.schedulerConfig.batch_size;
    const minBatchSize = this.schedulerConfig.min_batch_size;

    // Check if the batch size remaining is less than the default batch size, boolean
    const checkBatchSize =
      currentDate.getTime() - seedMetricStartDate <
      defaultBatchSize * this.schedulerConfig.interval;

    // Calculate the total batch size
    const calculatedBatchSize =
      (currentDate.getTime() - seedMetricStartDate) /
      this.schedulerConfig.interval;

    // If batch size is less than max batch size, set the batch size to the required amount
    // Prevents running excess queries when job is all caught up
    if (checkBatchSize) {
      maxBatch =
        (currentDate.getTime() - seedMetricStartDate) /
        this.schedulerConfig.interval;
    } else {
      this.logger.debug(`Remainig batch for ${m.name}: ${calculatedBatchSize}`);
      maxBatch = defaultBatchSize;
    }

    // Init local var for incrementing
    let seedMetricTimestamp = seedMetricStartDate;
    // If there are less than 10 metrics to collect, skip this scheduled job
    if (maxBatch < minBatchSize) {
      this.logger.debug(`Batch Size less than ${minBatchSize}...skipping job.`);
    } else {
      for (let i = 0; i < maxBatch; i++) {
        try {
          // Try to update a new metric
          // This will use the incremented value from below to collect the next
          // data point from Grafana/Prometheus and store in the metrics table
          await this.updateMetricNewValues(m, seedMetricTimestamp);
        } catch (error) {
          if (
            error instanceof QueryFailedError &&
            error.message.includes("unique constraint")
          ) {
          } else if (error.message.includes("undefined")) {
          } else {
            this.logger.debug(
              `Error Cause ${error.message} for query ${m.name} ${seedMetricTimestamp}`,
            );
          }
        }
        // Inccrement timestamp by the interval (e.g. 10mins)
        seedMetricTimestamp += this.schedulerConfig.interval;
      }
    }

    return null;
  }

  async run() {
    const m = this.m;
    try {
      this.logger.debug(`seeding metric: ${m.name}`);
      await this.seedMetricPrometheusValues(m);
    } catch (e) {
      this.logger.log(`Error happened while updating metrics:\n${e.stack}`);
    }
  }
}
