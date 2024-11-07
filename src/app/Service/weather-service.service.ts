import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherServiceService {
  private authUrl = 'https://api.auth.dtn.com/v1/tokens/authorize';
  private apiBaseUrl = 'https://weather.api.dtn.com/v2';

  constructor(private http: HttpClient) {}

  // Method to obtain access token
  getAccessToken(): Observable<any> {
    const body = {
      grant_type: 'client_credentials',
      client_id: 'ti5EIU0BJUuZPmsNnTfdsu5KePbIRgtL',
      client_secret: '3h0iJvbhb7fyh5lyn78EEoqkBAkdXzd2RQOhloj_BB1c_fCXaC7yfcbKxsajQ0Ew',
      audience: 'https://weather.api.dtn.com/conditions'
    };

    return this.http.post<any>(this.authUrl, body);
  }

  // Method to get weather conditions using current date and time
  getWeatherData(lat: number, lon: number, accessToken: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    // Get current date and time in ISO format
    const now = new Date();
    const startTime = now.toISOString();

    // Set end time as one hour later (or adjust as needed)
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = oneHourLater.toISOString();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      startTime: startTime,
      endTime: endTime,
    });

    const endpoint = `${this.apiBaseUrl}/conditions?${params.toString()}`;
    return this.http.get<any>(endpoint, { headers });
  }
}
