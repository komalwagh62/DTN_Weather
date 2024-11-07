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
  private lat = 20.5937;
  private lon = 78.9629;

  constructor(private weatherService: WeatherServiceService) {}

  ngOnInit(): void {
    this.initializeMap();
    this.fetchWeatherData();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([20.5937, 78.9629], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);
  }

  private fetchWeatherData(): void {
    this.weatherService.getAccessToken().subscribe(tokenResponse => {
      const accessToken = tokenResponse.data.access_token;

      this.weatherService.getWeatherData(this.lat, this.lon, accessToken)
        .subscribe(weatherData => {
          console.log(weatherData);
          this.displayWeatherDataOnMap(weatherData);
        });
    });
  }

  private displayWeatherDataOnMap(data: any): void {
    const marker = L.marker([this.lat, this.lon]).addTo(this.map);
    marker.bindPopup(`<b>Weather Data:</b><br>Temperature: ${data.temperature}°C`).openPopup();
  }
}