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
  private markers: L.Marker[] = []; // Array to store all markers
  // Visibility states for each type of data
  isWeatherDataVisible: boolean = false;
  isObservationsDataVisible: boolean = false;
  isAstronomicalDataVisible: boolean = false;
  startDate!: string;
  endDate!: string;
  
  constructor(private weatherService: WeatherServiceService) {
    // Automatically set the start and end dates based on current date
    const today = new Date();
    this.startDate = this.formatDate(today);
    const end = new Date();
    end.setDate(today.getDate() + 2); // Set end date 2 days from today
    this.endDate = this.formatDate(end);
  }

  ngOnInit(): void {
    this.initializeMap();
  }

  private initializeMap(): void {
    this.map = L.map('map').setView([20.5937, 78.9629], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(this.map);

    // Event listener for map view change (pan or zoom)
    this.map.on('moveend', () => {
      // Fetch data based on the visibility state of the layers
      if (this.isWeatherDataVisible) {
        this.fetchWeatherData();
      }
      if (this.isAstronomicalDataVisible) {
        this.fetchAstronomicalData();
      }
      if (this.isObservationsDataVisible) {
        this.fetchObservationsData();
      }
    });
  }
  
 // Format date as YYYY-MM-DD
 private formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
  // Toggle for Weather Data
  toggleWeatherData(): void {
    if (this.isWeatherDataVisible) {
      this.clearData();
    } else {
      this.fetchWeatherData();
    }
    this.isWeatherDataVisible = !this.isWeatherDataVisible;
  }

  // Toggle for Astronomical Data
  toggleAstronomicalData(): void {
    if (this.isAstronomicalDataVisible) {
      this.clearData();
    } else {
      this.fetchAstronomicalData();
    }
    this.isAstronomicalDataVisible = !this.isAstronomicalDataVisible;
  }

  // Toggle for Observations Data
  toggleObservationsData(): void {
    if (this.isObservationsDataVisible) {
      this.clearData();
    } else {
      this.fetchObservationsData();
    }
    this.isObservationsDataVisible = !this.isObservationsDataVisible;
  }
  clearData(): void {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers = [];
  }

  fetchWeatherData(): void {
    const currentLat = this.map.getCenter().lat;
    const currentLon = this.map.getCenter().lng;

    // Generate startTime and endTime dynamically
    const now = new Date();
    const endTime = now.toISOString(); // Current time as end time
    now.setHours(now.getHours() - 24); // Subtract 24 hours for start time
    const startTime = now.toISOString(); // 24 hours ago as start time

    console.log('Fetching weather data for period:', startTime, 'to', endTime);

    // Pass the generated startTime and endTime to the service
    this.weatherService.getWeatherData(currentLat, currentLon, startTime, endTime).subscribe({
      next: (data: any) => {
        if (data) {
          console.log('Fetched weather data:', data);
          // Display data markers on the map
          this.addMarkersForWeatherData(data);
        } else {
          console.error('No weather data received');
        }
      },
      error: (error: any) => {
        console.error('Error fetching weather data:', error);
      }
    });
  }

  private addMarkersForWeatherData(weatherData: any): void {
    const weatherHourlyData = weatherData.features[0].properties;
  
    for (let time in weatherHourlyData) {
      const data = weatherHourlyData[time];
      const weatherCode = data.weatherCode; // Assume `weatherCode` is available in your data
  
      // Map weather code to icon file name
      const iconFileName = this.getIconFileName(weatherCode);
      const iconUrl = `https://static-assets.dtn.com/icons/weather-conditions/v1/${iconFileName}`;
  
      // Create a custom icon
      const customIcon = L.icon({
        iconUrl: iconUrl,
        iconSize: [32, 32], // Customize the icon size as needed
        iconAnchor: [16, 32], // Anchor the icon to the marker's position
        popupAnchor: [0, -32] // Position the popup relative to the icon
      });
  
      // Create a marker with the custom icon
      const marker = L.marker([this.map.getCenter().lat, this.map.getCenter().lng], { icon: customIcon }).addTo(this.map);
  
      // Construct the popup content with all data fields
      // let popupContent = `<strong>Time:</strong> ${time}<br>`;
      // for (let key in data) {
      //   popupContent += `<strong>${this.formatKey(key)}:</strong> ${data[key]}<br>`;
      // }
  
      const popupContent = `
      <strong>Time:</strong> ${time}<br>
      <strong>Temperature:</strong> ${data.airTemp} °C<br>
      <strong>Dew Point:</strong> ${data.dewPoint} °C<br>
      <strong>Visibility:</strong> ${data.visibility} km<br>
      <strong>Total Cloud Cover:</strong> ${data.totalCloudCover} %<br>
      <strong>Surface Pressure:</strong> ${data.surfacePressure} hPa<br>
      <strong>Relative Humidity:</strong> ${data.relativeHumidity} %<br>
      <strong>Wind Direction:</strong> ${data.windDirection}°<br>
      <strong>Wind Speed:</strong> ${data.windSpeed} m/s
    `;

      marker.bindPopup(popupContent);
      this.markers.push(marker);
    }
  }


  private getIconFileName(weatherCode: number): string {
    // Map weather codes to corresponding icon file names
    const iconMap: { [key: number]: string } = {
      1: 'clear skies.svg',
      2: 'fair.svg',
      3: 'partly_cloudy.svg',
      4: 'mostly_cloudy.svg',
      5: 'cloudy.svg',
      6: 'mist.svg',
      7: 'fog.svg',
      8: 'drizzle.svg',
      9: 'rain.svg',
      10: 'heavy_rain.svg',
      11: 'freezing_drizzle.svg',
      12: 'freezing_rain.svg',
      13: 'freezing_heavy_rain.svg',
      14: 'rain_and_snow.svg',
      15: 'heavy_rain_and_snow.svg',
      16: 'snow.svg',
      17: 'heavy_snow.svg',
      18: 'blizzard.svg',
      19: 'ice_pellets.svg',
      20: 'rain_showers.svg',
      21: 'heavy_rain_showers.svg',
      22: 'freezing_rain_showers.svg',
      23: 'heavy_freezing_rain_showers.svg',
      24: 'rain_and_snow_showers.svg',
      25: 'heavy_rain_and_snow_showers.svg',
      26: 'snow_showers.svg',
      27: 'heavy_snow_showers.svg',
      28: 'hail_showers.svg',
      29: 'heavy_hail_showers.svg',
      30: 'thunderstorms.svg',
      31: 'heavy_thunderstorms.svg',
      32: 'windy.svg'
    };

    // Return the corresponding icon file name or a default one
    return iconMap[weatherCode] || 'default.svg';
  }




  
  fetchObservationsData(): void {
    // Define the audience for the Observations API
    const audience1 = 'https://weather.api.dtn.com/observations';

    // Fetch the access token with the specified audience
    this.weatherService.getAccessToken(audience1).subscribe(
      (tokenResponse: string) => {
        console.log('Token Response:', tokenResponse);
        if (tokenResponse) {
          const minLat = 6.0;
          const maxLat = 37.0;
          const minLon = 68.0;
          const maxLon = 97.0;

          // Fetch observations data using the access token
          this.weatherService.getObservationsData(minLat, maxLat, minLon, maxLon).subscribe(
            (observationsData: any) => {
              console.log('Observations Data:', observationsData);
              if (observationsData) {
                this.addMarkersForObservationsData(observationsData);
              }
            },
            (error) => {
              console.error('Error fetching observations data:', error);
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

  private addMarkersForObservationsData(observationsData: any): void {
    observationsData.features.forEach((feature: any) => {
      const [lon, lat] = feature.geometry.coordinates;
      const stationName = feature.properties.tags.name;
      const params = feature.properties.parameters.airTemp;
      const wmoCode = feature.properties.tags.wmo;
      const lastObsTimestamp = feature.properties.lastObsTimestamp;
      const marker = L.marker([lat, lon]).addTo(this.map);
  
      // Corrected popup content
      const popupContent = `
        <strong>Station:</strong> ${stationName} (${wmoCode})<br>
        <strong>Last Observation:</strong> ${lastObsTimestamp}<br>
        <strong>Elevation:</strong> ${feature.properties.elevation} m<br>
      `;
  
      marker.bindPopup(popupContent);
      this.markers.push(marker); // Use this.observationMarkers instead of this.markers
    });
  }



 // Fetch astronomical data based on current map view and generated dates
 fetchAstronomicalData() {
    
  const currentLat = this.map.getCenter().lat;
  const currentLon = this.map.getCenter().lng;

  // Define the audience for the Astronomical API
  const audience = 'https://astronomical.api.dtn.com';

  // Fetch the access token with the specified audience
  this.weatherService.getAccessToken(audience).subscribe({
    next: (accessToken) => {
      if (accessToken) {
        // Use current map center coordinates for fetching astronomical data
        this.weatherService.getAstronomicalData(currentLat, currentLon, this.startDate, this.endDate)
          .subscribe({
            next: (data: any) => {
              if (data) {
                console.log('Fetched astronomical data:', data);
                // Display data markers on the map
                this.displayAstronomicalDataOnMap(data);
              } else {
                console.error('No astronomical data received');
              }
            },
            error: (error: any) => {
              console.error('Error fetching astronomical data:', error);
            }
          });
      } else {
        console.error('Failed to obtain access token');
      }
    },
    error: (error) => {
      console.error('Error fetching access token:', error);
    }
  });
}


displayAstronomicalDataOnMap(data: any): void {
  // Assuming data is an array of features with moon and sun properties
  console.log('Displaying astronomical data markers', data);

  const astroIcon = L.divIcon({
    className: 'custom-astro-icon',
    html: '<div style="font-size: 24px; color: orange; text-align: center; line-height: 30px;">🌞</div>',
    iconSize: [30, 30],  // Icon size
    iconAnchor: [15, 15], // Icon anchor point
    popupAnchor: [0, -15] // Optional: position of the popup relative to the marker
  });

  // Layer group to manage markers
  const markerLayerGroup = L.layerGroup().addTo(this.map);

  // Check if the data contains features and is an array
  if (data && data.features && Array.isArray(data.features)) {
    // Loop through each feature
    data.features.forEach((feature: any) => {
      const lat = feature?.geometry?.coordinates[1]; // Assuming latitude is in the second position
      const lon = feature?.geometry?.coordinates[0]; // Assuming longitude is in the first position

      // Check if the coordinates are valid
      if (lat && lon) {
        // Create a new marker each time and add it to the marker layer group
        const marker = L.marker([lat, lon], { icon: astroIcon }).addTo(markerLayerGroup);
        this.markers.push(marker); // Add marker to the astroMarkers array

        // Loop over each date in the properties and prepare the popup content
        let popupContent = '';
        for (const date in feature.properties) {
          if (feature.properties.hasOwnProperty(date)) {
            const sunData = feature.properties[date]?.sun;
            const moonData = feature.properties[date]?.moon;

            if (sunData && moonData) {
              popupContent += `
                <b>Sun Event (${date}):</b><br>
                Sunrise: ${sunData.sunrise || 'Data not available'}<br>
                Sunset: ${sunData.sunset || 'Data not available'}<br>
                <br>
                <b>Moon Event (${date}):</b><br>
                Moonrise: ${moonData.moonrise || 'Data not available'}<br>
                Moonset: ${moonData.moonset || 'Data not available'}<br>
                Illumination: ${moonData.illumination || 'Data not available'}<br>
                phaseName: ${moonData.phaseName || 'Data not available'}<br><br>`;
            }
          }
        }

        // Bind the popup to the marker
        marker.bindPopup(popupContent || 'No data available for this location');
      }
    });
  }
}

}
