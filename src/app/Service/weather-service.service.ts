import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';

// Define interfaces for API responses
interface AuthResponse {
  data: {
    access_token: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WeatherServiceService {
  private clientId = 'ti5EIU0BJUuZPmsNnTfdsu5KePbIRgtL';
  private clientSecret = '3gzCHFoUdCk-OsOMMSn8O19qfVi4zkcJsF6OkTjs7lD9femzdzZc8O3HxdhmacHp';
  private audience = 'https://weather.api.dtn.com/conditions';
  private audience1 = 'https://weather.api.dtn.com/observations';
  private audience2 = 'https://astronomical.api.dtn.com';
  private authUrl = 'https://api.auth.dtn.com/v1/tokens/authorize';
  private conditionsApiUrl = 'https://weather.api.dtn.com/v2/conditions';
  private observationsApiUrl = 'https://obs.api.dtn.com/v2/observations';
  private astronomicalApiUrl = 'https://astronomical.api.dtn.com/v2/sun-moon';


  constructor(private http: HttpClient) { }

  // Method to get the access token
  getAccessToken(audience: string): Observable<string> {
    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      audience: audience
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(this.authUrl, body, { headers }).pipe(
      map(response => response.data.access_token), // Use 'access_token' from the response
      catchError(error => {
        console.error('Error obtaining access token:', error);
        return of(''); // Return empty string in case of error
      })
    );
  }

  // Method to fetch conditions data
  getWeatherData(lat: number, lon: number, startTime: string, endTime: string): Observable<any> {
    // Define the list of parameters to be included in the request
    const parameters = [
      "airTemp", "airTempLowerBound", "airTempNearGround", "airTempUpperBound", "totalCloudCover",
      "conditionalPrecipProbFreezing", "conditionalPrecipProbFrozen", "conditionalPrecipProbLiquid",
      "conditionalPrecipProbRefrozen", "convectivePrecipAmount", "dewPoint", "effectiveCloudCover",
      "feelsLikeTemp", "heatIndex", "iceAccretionAmount", "longWaveRadiation", "mslPressure",
      "precipAmount", "precipAmountMax", "precipAmountMin", "precipProb", "precipType",
      "relativeHumidity", "relativeHumidityUpperBound", "relativeHumidityLowerBound",
      "shortWaveRadiation", "globalRadiation", "snowFactor", "snowfallAmount", "sunshineDuration",
      "surfacePressure", "uWind", "visibility", "visibilityObstructionType", "vWind", "weatherCode",
      "windChill", "windDirection", "windGust", "windSpeed", "windSpeed100m", "windSpeed2m",
      "windSpeedLowerBound", "windSpeedUpperBound", "windGustLowerBound", "windGustUpperBound"
    ].join(",");

    // Construct the URL query parameters
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      parameters: parameters,
      startTime: startTime,
      endTime: endTime,
      units: 'us-std' // Add units if required
    }).toString();

    // Return an Observable with the request
    return this.getAccessToken(this.audience).pipe(
      switchMap((accessToken: string) => {
        if (!accessToken) {
          console.error('Failed to obtain access token for weather data');
          return of(null);
        }

        // Construct the complete URL
        const url = `${this.conditionsApiUrl}?${queryParams}`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        });

        // Make the HTTP GET request
        return this.http.get(url, { headers });
      })
    );
  }


  // Method to fetch observations data
  getObservationsData(minLat: number, maxLat: number, minLon: number, maxLon: number): Observable<any> {
    // Define the list of parameters to be included in the request
    const parameters = [
      "airTemp"
    ].join(",");


    const queryParams = new URLSearchParams({
      by: 'boundingBox',
      minLat: minLat.toString(),
      maxLat: maxLat.toString(),
      minLon: minLon.toString(),
      maxLon: maxLon.toString(),
      parameters: parameters,

      obsTypes: 'SYNOP'
    }).toString();

    return this.getAccessToken(this.audience1).pipe(
      switchMap((accessToken: string) => {
        if (!accessToken) {
          console.error('Failed to obtain access token for Observations Data');
          return of(null);
        }

        const url = `${this.observationsApiUrl}/stations?${queryParams}`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${accessToken}`
        });

        return this.http.get(url, { headers });
      })
    );
  }
  // Method to fetch astronomical data (Sun and Moon information)
  getAstronomicalData(lat: number, lon: number, startDate: string, endDate: string): Observable<any> {
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      startDate: startDate,
      endDate: endDate
    }).toString();

    return this.getAccessToken(this.audience2).pipe(
      switchMap((accessToken: string) => {
        if (!accessToken) {
          console.error('Failed to obtain access token for Astronomical Data');
          return of(null);
        }

        const url = `${this.astronomicalApiUrl}?${queryParams}`;
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        });

        return this.http.get(url, { headers });
      })
    );
  }



}