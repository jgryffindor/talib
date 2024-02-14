import { Address } from "@liftedinit/many-js";
import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from "nestjs-typeorm-paginate";
import { Neighborhood } from "src/database/entities/neighborhood.entity";
import { Brackets, Repository } from "typeorm";
import { Token as TokenEntity } from "../../database/entities/token.entity";

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);

    constructor(
      @InjectRepository(TokenEntity)
      private tokenRepository: Repository<TokenEntity>,
    ) {}
  
    async getTokens(neighborhood: Neighborhood): Promise<Pagination<TokenEntity>> {
      const query = this.tokenRepository
        .createQueryBuilder("t")
        .where("t.neighborhoodId = :nid", { nid: neighborhood.id })
        .orderBy("t.id", "DESC");
  
      this.logger.debug(`getTokens: ${query.getQuery()}`);
      return await paginate(query, { page: 1, limit: 10 });
    }

    async addTokens(neighborhood, missingTokens) {
      // const query = this.tokenRepository
      //   .createQueryBuilder("t")
      //   .where("t.neighborhoodId = :nid", { nid: neighborhood.id })
      //   .orderBy("t.id", "DESC");
  
      // this.logger.debug(`addTokens: ${query.getQuery()}`);
      // return await query.getMany();
      return "Got Tokens"
    }
    

}