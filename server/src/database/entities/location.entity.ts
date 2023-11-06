import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { LocationDto, CreateLocationDto } from "../../dto/location.dto";

@Entity()
export class Location {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  instance: string;

  @Column({ type: "float" })
  latitude: number;

  @Column({ type: "float" })
  longitude: number;

  intoDto(): LocationDto {
    return {
      id: this.id,
      instance: this.instance,
      latitude: this.latitude,
      longitude: this.longitude,
    };
  }

  public static createWithDto(dto: CreateLocationDto): Location {
    const result = new Location();
    result.instance = dto.instance;
    result.latitude = dto.latitude;
    result.longitude = dto.longitude;
    return result;
  }
}
