import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  private clientId = 'ti5EIU0BJUuZPmsNnTfdsu5KePbIRgtL'; // Replace with your actual Client ID
  private clientSecret = '3gzCHFoUdCk-OsOMMSn8O19qfVi4zkcJsF6OkTjs7lD9femzdzZc8O3HxdhmacHp'; // Replace with your actual Client Secret
  private audience = 'https://weather.api.dtn.com/conditions';
  private authUrl = 'https://api.auth.dtn.com/v1/tokens/authorize';
  private apiBaseUrl = 'https://weather.api.dtn.com/v2/conditions';

  constructor(private http: HttpClient) {}

  // Method to get the access token
  getAccessToken(): Observable<string> {
    const body = {
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      audience: this.audience
    };
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    return this.http.post<AuthResponse>(this.authUrl, body, { headers }).pipe(
      map(response => response.data.access_token) // Use 'access_token' from the response
    );
  }

  // Method to fetch weather data
  getWeatherData(lat: number, lon: number, accessToken: string): Observable<any> {
    const currentTime = new Date().toISOString(); // Get current time in ISO 8601 format
    const endTime = '2024-11-14T00:06:10Z'; // Example static end time

    // Construct query parameters with start and end time
    const queryParams = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      startTime: currentTime,
      endTime: endTime
    }).toString();

    const url = `${this.apiBaseUrl}?${queryParams}`;
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get(url, { headers });
  }
}
