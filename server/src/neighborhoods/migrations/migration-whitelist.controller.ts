import { Body, Controller, Get, Logger, Param, Post } from "@nestjs/common";
import { ApiCreatedResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { MigrationWhitelistDto } from "../../dto/migration-whitelist.dto";
import { MigrationWhitelistService } from "./migration-whitelist.service";

@Controller("migrations-whitelist")
export class MigrationWhitelistController {
  private readonly logger = new Logger(MigrationWhitelistController.name);

  constructor(private whitelistService: MigrationWhitelistService) {}

  @Get()
  @ApiOperation({
    description: "Get the complete migrations whitelist"
  })
  @ApiOkResponse({
    type: String,
    isArray: true,
    description: "The complete list of whitelisted manifest addresses"
  })
  async getWhitelist(): Promise<string[]> {
    const whitelist = await this.whitelistService.findAll();
    return whitelist.map((item) => item.manyAddress);
  }

  @Get(":address")
  @ApiOperation({
    description: "Check if an address is in the migration whitelist"
  })
  @ApiOkResponse({
    type: Boolean,
    description: "The address is in the whitelist"
  })
  async isInWhitelist(@Param("address") address: string): Promise<boolean> {
    const whitelist = await this.whitelistService.findAll();
    return whitelist.some((item) => item.manyAddress === address);
  }

  @Post()
  @ApiOperation({
    description: "Add a new address to the migration whitelist"
  })
  @ApiCreatedResponse({
    type: MigrationWhitelistDto,
    description: "The address was successfully added to the whitelist"
  })
  async addToWhitelist(@Body() dto: MigrationWhitelistDto): Promise<MigrationWhitelistDto> {
    console.log(`Adding address to whitelist: ${JSON.stringify(dto)}`);
    if (!dto || !dto.manyAddress) {
      throw new Error(`Invalid request body: ${JSON.stringify(dto)}`);
    }
    return this.whitelistService.addAddress(dto.manyAddress);
  }
}