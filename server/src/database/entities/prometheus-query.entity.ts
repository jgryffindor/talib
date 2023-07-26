import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { Metric } from "./metric.entity";
import {
  PrometheusQueryDto,
  CreatePrometheusQueryDto,
} from "../../dto/prometheus-query.dto";

const default_created_date = process.env.METRICS_DEFAULT_CREATED_DATE;

@Entity()
export class PrometheusQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  label: string;

  @Column()
  query: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Metric, (metric) => metric.prometheusQueryId)
  metrics: Metric[];

  @CreateDateColumn({
    nullable: true,
    default: default_created_date,
  })
  createdDate: Date;

  intoDto(): PrometheusQueryDto {
    return {
      id: this.id,
      name: this.name,
      label: this.label,
      query: this.query,
      description: this.description,
      createdDate: this.createdDate.toDateString(),
    };
  }

  public static createWithDto(dto: CreatePrometheusQueryDto): PrometheusQuery {
    const result = new PrometheusQuery();
    result.name = dto.name;
    result.label = dto.label;
    result.query = dto.query;
    result.description = dto.description;
    result.createdDate = dto.createdDate
      ? new Date(dto.createdDate)
      : new Date(default_created_date);
    return result;
  }
}