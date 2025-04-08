import React from "react";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useGetCurrentWeatherQuery } from "../../lib/redux/weatherApi";
import { formatTemperature } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import "leaflet/dist/leaflet.css";

// This is our client-side only map component
function ClientSideMap({ currentWeather, unit }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Only run once to initialize the map
    if (!mapRef.current && mapContainerRef.current) {
      // Dynamically import Leaflet
      import("leaflet").then((L) => {
        // Fix the icon issue
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
          iconUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
          shadowUrl:
            "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        });

        // Create map
        const initialLat = currentWeather?.location?.lat || 51.505;
        const initialLon = currentWeather?.location?.lon || -0.09;

        mapRef.current = L.map(mapContainerRef.current).setView(
          [initialLat, initialLon],
          9
        );

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapRef.current);

        // If we have weather data, add a marker
        if (currentWeather) {
          updateMarker(L, currentWeather, unit);
        }
      });
    }

    // Cleanup function to destroy map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Function to update marker when weather data changes
  const updateMarker = (L, weatherData, unitType) => {
    // Remove existing marker if there is one
    if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
    }

    // Add new marker
    markerRef.current = L.marker([
      weatherData.location.lat,
      weatherData.location.lon,
    ]).addTo(mapRef.current);

    // Update view to center on new marker
    mapRef.current.setView(
      [weatherData.location.lat, weatherData.location.lon],
      mapRef.current.getZoom()
    );

    // Create popup content
    const popupContent = document.createElement("div");
    popupContent.className = "p-2";

    const locationName = document.createElement("div");
    locationName.className = "font-semibold";
    locationName.textContent = weatherData.location.name;

    const weatherInfoDiv = document.createElement("div");
    weatherInfoDiv.className = "flex items-center mt-1";

    const weatherIcon = document.createElement("img");
    weatherIcon.src = weatherData.current.condition.icon;
    weatherIcon.alt = weatherData.current.condition.text;
    weatherIcon.className = "w-10 h-10 mr-1";

    const tempSpan = document.createElement("span");
    tempSpan.className = "text-lg font-medium";
    tempSpan.textContent = formatTemperature(
      unitType === "c"
        ? weatherData.current.temp_c
        : weatherData.current.temp_f,
      unitType
    );

    const conditionDiv = document.createElement("div");
    conditionDiv.className = "text-sm mt-1";
    conditionDiv.textContent = weatherData.current.condition.text;

    weatherInfoDiv.appendChild(weatherIcon);
    weatherInfoDiv.appendChild(tempSpan);

    popupContent.appendChild(locationName);
    popupContent.appendChild(weatherInfoDiv);
    popupContent.appendChild(conditionDiv);

    // Bind popup to marker
    markerRef.current.bindPopup(popupContent).openPopup();
  };

  // Update marker when weather data changes
  useEffect(() => {
    if (mapRef.current && currentWeather) {
      import("leaflet").then((L) => {
        updateMarker(L, currentWeather, unit);
      });
    }
  }, [currentWeather, unit]);

  return <div ref={mapContainerRef} className="h-full w-full" />;
}

export default function WeatherMap() {
  const { location: locationName, unit } = useSelector(
    (state) => state.weather
  );
  const { data: currentWeather, isLoading } =
    useGetCurrentWeatherQuery(locationName);
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Weather Map
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {isLoading ? "Loading..." : currentWeather?.location?.name},{" "}
            {isLoading ? "" : currentWeather?.location?.country}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          {/* <CardTitle>Interactive Weather Map</CardTitle> */}
        </CardHeader>
        <CardContent>
          <div className="h-[450px] w-full rounded-lg overflow-hidden border">
            {isBrowser ? (
              <ClientSideMap currentWeather={currentWeather} unit={unit} />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gray-100">
                Loading map...
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            <p>
              The map shows the current weather conditions at your selected
              location. You can click on the marker to see more details.
            </p>
          </div>
        </CardContent>
      </Card>

      {currentWeather && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Temperature</h3>
                <div className="text-3xl font-bold">
                  {formatTemperature(
                    unit === "c"
                      ? currentWeather.current.temp_c
                      : currentWeather.current.temp_f,
                    unit
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Feels like{" "}
                  {formatTemperature(
                    unit === "c"
                      ? currentWeather.current.feelslike_c
                      : currentWeather.current.feelslike_f,
                    unit
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Wind</h3>
                <div className="text-3xl font-bold">
                  {unit === "c"
                    ? currentWeather.current.wind_kph
                    : currentWeather.current.wind_mph}{" "}
                  {unit === "c" ? "km/h" : "mph"}
                </div>
                <p className="text-sm text-gray-500">
                  Direction: {currentWeather.current.wind_dir} (
                  {currentWeather.current.wind_degree}°)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Humidity</h3>
                <div className="text-3xl font-bold">
                  {currentWeather.current.humidity}%
                </div>
                <p className="text-sm text-gray-500">
                  Cloud cover: {currentWeather.current.cloud}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center">
                <h3 className="text-lg font-medium mb-1">Pressure</h3>
                <div className="text-3xl font-bold">
                  {currentWeather.current.pressure_mb} mb
                </div>
                <p className="text-sm text-gray-500">
                  Visibility:{" "}
                  {unit === "c"
                    ? currentWeather.current.vis_km
                    : currentWeather.current.vis_miles}{" "}
                  {unit === "c" ? "km" : "miles"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
