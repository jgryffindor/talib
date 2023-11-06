import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Location } from "../../../database/entities/location.entity";
import { PrometheusQueryService } from "../../../metrics/prometheus-query/query.service";
import { PrometheusQueryDetailsService } from "../../../metrics/prometheus-query-details/query-details.service";
import { PrometheusQueries } from "../geo-scheduler.service";

const INTERVALMS = 30000;
const MAXDATAPOINTS = 30;

interface LocationQueryNames {
  latitude: string;
  longitude: string;
}

interface LocationValue {
  id: number;
  latitude: number;
  instance: string;
}

interface LocationData {
  latitudeValues: LocationValue[];
  longitudeValues: LocationValue[];
}

@Injectable()
export class GeoUpdater {
  private logger: Logger;
  private queries: PrometheusQueries;

  constructor(
    private prometheusQueryDetails: PrometheusQueryDetailsService,
    private prometheusQuery: PrometheusQueryService,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  with(queries: PrometheusQueries) {
    this.queries = queries;
    this.logger = new Logger(`${GeoUpdater.name}`);
    return this;
  }

  // Insert a new location into the locations table
  private async updateLocationNewValues(instance: string, latitude: number, longitude: number) {
    // Construct the location
    const entity = new Location();

    entity.latitude = latitude;
    entity.longitude  = longitude;
    entity.instance = instance;

    const result = await this.locationRepository.save(entity);

    return result;
  }

  private async getLocations(queryNames: LocationQueryNames, timestamp: number): Promise<LocationData> {

    // Retrieve the metric value from Grafana
    // Fetch the PromQL from the PrometheusQuery table to find the metric
    const latitudeValues =
      await this.prometheusQueryDetails.getPrometheusQueryCurrentFrames(
        queryNames.latitude,
        timestamp,
        INTERVALMS,
        MAXDATAPOINTS,
      );

    const longitudeValues =
      await this.prometheusQueryDetails.getPrometheusQueryCurrentFrames(
        queryNames.longitude,
        timestamp,
        INTERVALMS,
        MAXDATAPOINTS,
      );

    // shift decimal place 4 units to the left for latitude and longitude
    latitudeValues.forEach((value) => {
      // ensure value[1] is a float with 4 decimal places
      value[1] = parseFloat(value[1].toFixed(4));
      value[1] = value[1] / 10000;
    });

    longitudeValues.forEach((value) => {
      value[1] = parseFloat(value[1].toFixed(4));
      value[1] = value[1] / 10000;
    });

    return {
      latitudeValues, 
      longitudeValues
    };
    
    }

  private async checkNodeStatus(timestamp: number, instanceName: string): Promise<boolean> {
    // Retrieve the prometheus status query 
    const status = await this.prometheusQuery.get('status');
    let nodeStatus;

    if (!status) {
      return false;
    } else {
      nodeStatus = await this.prometheusQueryDetails.getPrometheusQuerySingleValue(
        status.name,
        timestamp,
        INTERVALMS,
        MAXDATAPOINTS,
        [{label: "instance", value: instanceName}]
      ) 
    }

    this.logger.debug(`nodeStatus: ${JSON.stringify(nodeStatus)}`);

    // If nodeStatus[1] = 1 return true, else return false
    if (nodeStatus[1] === 1) {
      return true;
    } else {
      return false;
    }

  }

  // Seed metric values for a prometheusQuery
  // This is the main job of the metrics scheduler
  private async seedLocationValues(queries: PrometheusQueries){
    const timestamp = new Date().getTime();

    // Get names of each prometheus Query and store in local var mapped to LocationQueryNames interface
    const locationQueryNames: LocationQueryNames = {
      latitude: queries.latitude.name,
      longitude: queries.longitude.name
    };
    const locationData = await this.getLocations(locationQueryNames, timestamp);

    // Create a dictionary to store the combined latitude and longitude objects
    const combinedLocations: { [key: string]: { latitude?: number; longitude?: number } } = {};

    // Process latitude values
    locationData.latitudeValues
      .map(latValue => [latValue[2], latValue[1]])
      .filter(([instanceName]) => instanceName)
      .forEach(([instanceName, latitude]) => {
        if (instanceName in combinedLocations) {
          combinedLocations[instanceName].latitude = latitude;
        } else {
          combinedLocations[instanceName] = { latitude };
        }
      });

    // Process longitude values
    locationData.longitudeValues
      .map(lonValue => [lonValue[2], lonValue[1]])
      .filter(([instanceName]) => instanceName)
      .forEach(([instanceName, longitude]) => {
        if (instanceName in combinedLocations) {
          combinedLocations[instanceName].longitude = longitude;
        } else {
          combinedLocations[instanceName] = { longitude };
        }
      });

    // Iterate over the combined locations and insert into the database
    for (const instanceName in combinedLocations) {

      // Check if the database has an entry for the instance name
      const instanceExists = await this.locationRepository.findOne({
        where: { instance: instanceName },
      });

      // if the instance doesn't exist, create a new entry
      if (!instanceExists) {
        // Check if the instance has both a latitude and longitude value
        if (
          combinedLocations[instanceName].latitude !== undefined &&
          combinedLocations[instanceName].longitude !== undefined
        ) {
          // If it does, insert the location into the database
          await this.updateLocationNewValues(
            instanceName,
            combinedLocations[instanceName].latitude,
            combinedLocations[instanceName].longitude,
          );
        }
      } else {
        // if the instance already exists check that the latitude and longitude values
        // are not null or aren't the same 
        if (
          (instanceExists.latitude !== combinedLocations[instanceName].latitude ||
            instanceExists.longitude !== combinedLocations[instanceName].longitude) &&
          combinedLocations[instanceName].latitude !== undefined &&
          combinedLocations[instanceName].longitude !== undefined
        ) {
          // If they are different, update the location in the database
          await this.updateLocationNewValues(
            instanceName,
            combinedLocations[instanceName].latitude,
            combinedLocations[instanceName].longitude,
          );
        }
      }
    }

    return null;
  }

  async run() {
    const queries = this.queries;
    try {
      this.logger.debug(`Seeding geolcations...`);
      await this.seedLocationValues(queries);
    } catch (e) {
      this.logger.log(`Error happened while updating geolocation:\n${e.stack}`);
    }
  }
}
