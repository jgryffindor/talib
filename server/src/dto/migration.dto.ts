import { ApiProperty  } from "@nestjs/swagger";
import { oneLine } from "common-tags";
import { TransactionDetails } from "../database/entities/transaction-details.entity";

export interface Argument {
  from: string;
  to: string;
  amount: number;
  symbol: string;
  memo: string[];
}

export class MigrationDto {

  @ApiProperty({ description: "Migration status" })
  status: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty({ description: "Transaction Hash" })
  manyHash: string;

  @ApiProperty({
    description: oneLine`
      Datetime this migration was executed (not submitted).
    `,
  })
  manifestDatetime: Date;

  @ApiProperty({ description: "Transaction Hash" })
  manifestHash: string;

}

export class MigrationDetailsDto {

  @ApiProperty({ description: "Migration status" })
  status: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty({ description: "Transaction Hash" })
  manyHash: string;

  @ApiProperty({
    description: oneLine`
      Datetime this migration was executed (not submitted).
    `,
  })
  manifestDatetime: Date;

  @ApiProperty({ description: "Transaction Hash" })
  manifestHash: string;

}

export class CreateMigrationDto {

  @ApiProperty({ description: "Migration status" })
  status: number;

  @ApiProperty()
  createdDate: string;

  @ApiProperty()
  uuid: string;

  @ApiProperty({ description: "Transaction Hash" })
  manyHash: string;

  @ApiProperty({
    description: oneLine`
      Datetime this migration was executed (not submitted).
    `,
  })
  manifestDatetime: Date;

  @ApiProperty({ description: "Transaction Hash" })
  manifestHash: string;
}

export class UpdateMigrationDto {
  
    @ApiProperty({ description: "Migration status" })
    status: number;
  
    @ApiProperty()
    uuid: string;

    @ApiProperty({
      description: oneLine`
        Datetime this migration was executed (not submitted).
      `,
    })
    manifestDatetime: Date;
  
    @ApiProperty({ description: "Transaction Hash" })
    manifestHash: string;
}
