import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Metric } from "../../database/entities/metric.entity";
import { PrometheusQuery } from "../../database/entities/prometheus-query.entity";
import { TransformsService } from "./transforms.service";
import { TransformsController } from "./trasforms.controller";
import { PrometheusQueryDetailsModule } from "../prometheus-query-details/query-details.module";
import { PrometheusQueryService } from "../prometheus-query/query.service";
import { MetricsService } from "../metrics.service";
import { MetricsSchedulerConfigService } from "src/config/metrics-scheduler/configuration.service";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Metric, PrometheusQuery]),
    HttpModule,
    PrometheusQueryDetailsModule,
  ],
  providers: [
    TransformsService,
    PrometheusQueryService,
    MetricsService,
    MetricsSchedulerConfigService,
    ConfigService,
  ],
  controllers: [TransformsController],
  exports: [TransformsService],
})
export class TransformsModule {}
