import { ApiProperty } from "@nestjs/swagger";
import { oneLine } from "common-tags";

export class TokenDto {
  @ApiProperty()
  id: number;

  @ApiProperty({ description: "Token name." })
  name: string;

  @ApiProperty({ description: "Token symbol." })
  symbol: string;

  @ApiProperty({ description: "Token address." })
  address: string;

  @ApiProperty()
  precision: number;
}
