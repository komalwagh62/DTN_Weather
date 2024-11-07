import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { WeatherServiceService } from '../Service/weather-service.service';

@Component({
  selector: 'app-weather-map',
  standalone: true,
  imports: [],
  templateUrl: './weather-map.component.html',
  styleUrl: './weather-map.component.scss'
})
export class WeatherMapComponent implements OnInit {
  private map: any;
  private lat = 20.5937; // Default latitude for India
  private lon = 78.9629; // Default longitude for India
  private markers: L.Marker[] = []; // Array to store all markers

  constructor(private weatherService: WeatherServiceService) {}

  ngOnInit(): void {
    this.initializeMap();
    this.fetchWeatherData();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([this.lat, this.lon], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);
  }

  private fetchWeatherData(): void {
    this.weatherService.getAccessToken().subscribe(
      (tokenResponse: string) => {
        console.log('Token Response:', tokenResponse); // Log the JWT token to check it
        if (tokenResponse) {
          const accessToken = tokenResponse; // Use the tokenResponse directly as the access token
          this.weatherService.getWeatherData(this.lat, this.lon, accessToken).subscribe(
            (weatherData: any) => {
              console.log('Weather Data:', weatherData);
              this.addMarkersForWeatherData(weatherData);
            },
            (error) => {
              console.error('Error fetching weather data:', error);
            }
          );
        } else {
          console.error('Access token is missing or undefined');
        }
      },
      (error) => {
        console.error('Error obtaining access token:', error);
      }
    );
  }

  private addMarkersForWeatherData(weatherData: any): void {
    // Assuming weatherData contains an array of hourly data for different times
    const weatherHourlyData = weatherData.features[0].properties;
    
    for (let time in weatherHourlyData) {
      const data = weatherHourlyData[time];
      
      // Create a marker for each hourly data point
      const marker = L.marker([this.lat, this.lon]).addTo(this.map); // You can customize latitude and longitude for each marker
      
      // Add a popup with weather data
      const popupContent = `
        <strong>Time:</strong> ${time}<br>
        <strong>Temperature:</strong> ${data.airTemp} °C<br>
        <strong>Humidity:</strong> ${data.relativeHumidity} %<br>
        <strong>Wind Speed:</strong> ${data.windSpeed} m/s<br>
        <strong>Visibility:</strong> ${data.visibility} km
      `;
      
      marker.bindPopup(popupContent);
      this.markers.push(marker); // Store the marker if you want to later manipulate or remove them
    }
  }
}
