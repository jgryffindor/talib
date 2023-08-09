import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Metric as MetricEntity } from "../../database/entities/metric.entity";
import { PrometheusQueryService } from "../prometheus-query/query.service";
import { SeriesEntity } from "../metrics.service";

type Current = {
  id: number;
  timestamp: string;
  data: string;
};

@Injectable()
export class FunctionsService {
  private readonly logger = new Logger(FunctionsService.name);

  constructor(
    @InjectRepository(MetricEntity)
    private metricRepository: Repository<MetricEntity>,
    private prometheusQuery: PrometheusQueryService,
  ) {}

  async get(name: string): Promise<MetricEntity | null> {
    const query = this.metricRepository
      .createQueryBuilder("n")
      .where({ name: name })
      .where("n.name = :name", {
        name: name,
      })
      .limit(1);

    const one = await query.getOne();

    if (!one) {
      return null;
    }

    return one;
  }

  // Get the current value for a metric
  async getSum(name: string): Promise<Current> {
    const prometheusQuery = await this.prometheusQuery.get(name);

    const query = this.metricRepository
      .createQueryBuilder("m")
      .where("m.prometheusQueryId = :prometheusQuery", {
        prometheusQuery: prometheusQuery.id,
      })
      .orderBy("m.timestamp", "DESC");

    const values: MetricEntity[] = await query.getMany();

    if (!values) {
      return null;
    }

    const sum = values.reduce(
      (accumulator, item) => accumulator + Number(item.data),
      0,
    );

    const sumTotal = {
      id: Math.floor(Math.random() * 900000) + 100000,
      timestamp: new Date().toISOString(),
      data: sum.toString(),
    };

    return sumTotal;
  }

  async getSeriesSum(
    name: string,
    from: Date,
    to: Date,
  ): Promise<SeriesEntity[] | null> {
    const prometheusQuery = await this.prometheusQuery.get(name);

    const query = this.metricRepository
      .createQueryBuilder("m")
      .where("m.timestamp BETWEEN :to AND :from", {
        to,
        from,
      })
      .andWhere("m.prometheusQueryId = :prometheusQuery", {
        prometheusQuery: prometheusQuery.id,
      })
      .orderBy("m.timestamp", "DESC");

    const result: MetricEntity[] | null = await query.getMany();

    // Initialize arrays for data processing
    const seriesData: SeriesEntity[] = [];
    const data: number[] = [];
    const timestamps: Date[] = [];

    result.forEach((series) => {
      data.push(Number(series.data));
      timestamps.push(series.timestamp);
    });

    // Reformat the data to be a sum of previous values at each timestamp
    for (let i = 0; i < data.length; i++) {
      if (i > 0) {
        data[i] = data[i] + data[i - 1];
      }
    }

    // Populate return object
    seriesData.push({
      timestamps: timestamps,
      data: data,
    });

    return seriesData;
  }
}
