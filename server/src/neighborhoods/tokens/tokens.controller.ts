import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { ApiOkResponse } from "@nestjs/swagger";
import { Pagination } from "nestjs-typeorm-paginate";
import { TokenDto } from "../../dto/token.dto";
import { TransactionDto } from "../../dto/transaction.dto";
import { TokenService } from "./tokens.service";

@Controller("neighborhoods/:nid/tokens")
export class TokenController {
  constructor(private events: TokenService) {}


}