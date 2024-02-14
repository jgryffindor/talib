import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Token } from "../database/entities/token.entity";
import { Block } from "../database/entities/block.entity";
import { Neighborhood } from "../database/entities/neighborhood.entity";
import { TransactionDetails } from "../database/entities/transaction-details.entity";
import { Transaction } from "../database/entities/transaction.entity";
import { NetworkService } from "../services/network.service";
import { TxAnalyzerService } from "../services/scheduler/tx-analyzer.service";
import { AddressesModule } from "./addresses/addresses.module";
import { BlockModule } from "./blocks/block.module";
import { BlockService } from "./blocks/block.service";
import { EventsModule } from "./events/events.module";
import { NeighborhoodController } from "./neighborhood.controller";
import { NeighborhoodService } from "./neighborhood.service";
import { TokenModule } from "./tokens/tokens.module";
import { TokenService } from "./tokens/tokens.service";
import { TransactionsModule } from "./transactions/transactions.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Neighborhood,
      Block,
      Transaction,
      TransactionDetails,
      Token,
    ]),
    BlockModule,
    TransactionsModule,
    EventsModule,
    AddressesModule,
    TokenModule,
  ],
  providers: [
    BlockService,
    NeighborhoodService,
    NetworkService,
    TxAnalyzerService,
    TokenService
  ],
  controllers: [NeighborhoodController],
  exports: [NeighborhoodService, BlockService],
})
export class NeighborhoodModule {}
