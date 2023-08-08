import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsUrl } from "class-validator";

export class PrometheusQueryDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  enabled: boolean;

  @ApiProperty()
  label: string;

  @ApiProperty()
  query: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdDate: string;
}

export class CreatePrometheusQueryDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @Optional()
  @ApiProperty({ required: false })
  enabled: boolean;

  @IsNotEmpty()
  @ApiProperty()
  label: string;

  @IsNotEmpty()
  @ApiProperty()
  query: string;

  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNotEmpty()
  @ApiProperty()
  createdDate: string;
}
