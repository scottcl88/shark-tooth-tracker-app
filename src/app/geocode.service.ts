/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

export class GeocodeResult {
  state: string;
  city: string;
}

@Injectable({
  providedIn: 'root',
})
export class GeocodeService {
  constructor(private http: HttpClient) { }

  async init() {
  }

  public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Implement the Haversine formula here
    // You can use the previous Haversine code provided

    // Radius of the Earth in miles
    const earthRadius = 3959; // miles

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = this.toRadians(lat1);
    const lon1Rad = this.toRadians(lon1);
    const lat2Rad = this.toRadians(lat2);
    const lon2Rad = this.toRadians(lon2);

    // Haversine formula
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance
    const distance = earthRadius * c;
    
    // Round the distance to the nearest whole number
    const roundedDistance = Math.round(distance);
    return roundedDistance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  public async getCoordinates(city: string, state: string): Promise<any> {
    return new Promise(async (resolve: any) => {
      const apiKey = environment.googleApiKey;
      const address = `${city}, ${state}`;
      const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${apiKey}`;

      await this.http.get(apiUrl).subscribe({
        next: (res: any) => {
          resolve(res);
        },
        error: (err: any) => {
          console.error("Failed getCoordinates", err);
          resolve(null);
        }
      });
    });
  }

  public async getStateName(latitude: number, longitude: number): Promise<GeocodeResult> {
    return new Promise(async (resolve: any) => {
      let result: GeocodeResult = new GeocodeResult();

      const apiKey = environment.googleApiKey;
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
      console.log("Geocode url: ", url);
      await this.http.get(url).subscribe({
        next: (res: any) => {
          // Extract the state name from the geocoding result
          const addressComponents = res.results[0].address_components;
          const state = addressComponents.find((component: any) =>
            component.types.includes('administrative_area_level_1')
          );
          let stateName: string = "";
          if (state) {
            stateName = state.long_name;
          } else {
            console.log('State name not found in geocoding result.');
          }
          result.state = stateName;

          const city = addressComponents.find((component: any) =>
            component.types.includes('locality')
          );
          let cityName: string = "";
          if (city) {
            cityName = city.long_name;
          } else {
            console.log('City name not found in geocoding result.');
          }
          result.city = cityName;

          resolve(result);
        }, error: (err) => {
          console.error('Error fetching location data:', err);
          resolve(result);
        }
      });
    });
  }
}
