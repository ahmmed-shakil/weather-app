import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useGetForecastQuery } from "../../lib/redux/weatherApi";
import {
  formatTemperature,
  formatDate,
  formatPrecipitation,
} from "../../lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card";
import ForecastChart from "../charts/ForecastChart";
import HourlyChart from "../charts/HourlyChart";

export default function ForecastWeather() {
  const { location: locationName, unit } = useSelector(
    (state) => state.weather
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const {
    data: forecastData,
    isLoading,
    error,
  } = useGetForecastQuery({
    location: locationName,
    days: 7, // 7 days forecast
  });

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh]">
        <iframe src="https://lottie.host/embed/fb93c622-4636-444f-b45e-f7acfc5c8f1f/qCiyrpyHq0.lottie"></iframe>
        <div className="animate-pulse text-xl text-gray-500">
          Loading data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500 text-center">
          <p className="text-2xl font-bold mb-2">Error loading forecast data</p>
          <p>
            {error?.data?.error?.message ||
              "Unable to fetch forecast information"}
          </p>
        </div>
      </div>
    );
  }

  if (!forecastData) return null;

  const forecast = forecastData.forecast;
  const days = forecast.forecastday;
  const selectedDay = days[selectedDayIndex];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Weather Forecast
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {forecastData.location.name}, {forecastData.location.country}
          </p>
        </div>
      </div>

      {/* 7-days forecast overview */}
      <div className="grid grid-cols-1 gap-6">
        {/* Day selector for desktop */}
        <div className="hidden sm:grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <motion.button
              key={day.date}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedDayIndex(index)}
              className={`p-3 rounded-lg transition-colors ${
                selectedDayIndex === index
                  ? "bg-primary-100 dark:bg-primary-900 border-2 border-primary-500"
                  : "hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-sm font-medium">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                  })}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
                <img
                  src={day.day.condition.icon}
                  alt={day.day.condition.text}
                  className="w-12 h-12 my-1"
                />
                <div className="flex gap-2 text-sm">
                  <span className="font-medium">
                    {formatTemperature(day.day.maxtemp_c, unit)}
                  </span>
                  <span className="text-gray-500">
                    {formatTemperature(day.day.mintemp_c, unit)}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Day selector for mobile */}
        <div className="sm:hidden overflow-x-auto pb-2">
          <div className="flex gap-2">
            {days.map((day, index) => (
              <motion.button
                key={day.date}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDayIndex(index)}
                className={`p-3 rounded-lg flex-shrink-0 transition-colors ${
                  selectedDayIndex === index
                    ? "bg-primary-100 dark:bg-primary-900 border-2 border-primary-500"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800 bg-white dark:bg-gray-800"
                }`}
              >
                <div className="flex flex-col items-center w-16">
                  <span className="text-sm font-medium">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <img
                    src={day.day.condition.icon}
                    alt={day.day.condition.text}
                    className="w-12 h-12 my-1"
                  />
                  <div className="flex flex-col text-sm">
                    <span className="font-medium">
                      {formatTemperature(day.day.maxtemp_c, unit)}
                    </span>
                    <span className="text-gray-500">
                      {formatTemperature(day.day.mintemp_c, unit)}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature chart for the week */}
          <Card>
            <CardHeader>
              <CardTitle>Temperature Forecast (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ForecastChart data={forecast} unit={unit} />
            </CardContent>
          </Card>

          {/* Hourly forecast for selected day */}
          <Card>
            <CardHeader>
              <CardTitle>
                Hourly Temperature ({formatDate(selectedDay.date)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HourlyChart
                data={forecast}
                dayIndex={selectedDayIndex}
                unit={unit}
              />
            </CardContent>
          </Card>
        </div>

        {/* Detailed day forecast */}
        <Card>
          <CardHeader>
            <CardTitle>
              {formatDate(selectedDay.date)} - Detailed Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-2 flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <img
                  src={selectedDay.day.condition.icon}
                  alt={selectedDay.day.condition.text}
                  className="w-16 h-16"
                />
                <p className="text-lg font-medium text-center">
                  {selectedDay.day.condition.text}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:col-span-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Max Temperature</p>
                    <p className="text-xl font-semibold">
                      {formatTemperature(selectedDay.day.maxtemp_c, unit)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Min Temperature</p>
                    <p className="text-xl font-semibold">
                      {formatTemperature(selectedDay.day.mintemp_c, unit)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Avg Temperature</p>
                    <p className="text-xl font-semibold">
                      {formatTemperature(selectedDay.day.avgtemp_c, unit)}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Max Wind</p>
                    <p className="text-xl font-semibold">
                      {unit === "c"
                        ? selectedDay.day.maxwind_kph
                        : selectedDay.day.maxwind_mph}{" "}
                      {unit === "c" ? "km/h" : "mph"}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Total Precipitation</p>
                    <p className="text-xl font-semibold">
                      {formatPrecipitation(
                        unit === "c"
                          ? selectedDay.day.totalprecip_mm
                          : selectedDay.day.totalprecip_in,
                        unit === "c" ? "mm" : "in"
                      )}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Avg Humidity</p>
                    <p className="text-xl font-semibold">
                      {selectedDay.day.avghumidity}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">Chance of Rain</p>
                    <p className="text-xl font-semibold">
                      {selectedDay.day.daily_chance_of_rain}%
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-500">UV Index</p>
                    <p className="text-xl font-semibold">
                      {selectedDay.day.uv}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t">
              <h4 className="text-lg font-medium mb-4">Hourly Breakdown</h4>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4">
                  {selectedDay.hour
                    .filter((_, i) => i % 3 === 0)
                    .map((hour) => (
                      <div
                        key={hour.time}
                        className="flex-shrink-0 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-32 text-center"
                      >
                        <p className="text-sm font-medium">
                          {hour.time.split(" ")[1]}
                        </p>
                        <img
                          src={hour.condition.icon}
                          alt={hour.condition.text}
                          className="w-12 h-12 mx-auto my-1"
                        />
                        <p className="text-lg font-semibold">
                          {formatTemperature(
                            unit === "c" ? hour.temp_c : hour.temp_f,
                            unit
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          {hour.condition.text}
                        </p>
                        <div className="flex justify-between text-xs mt-2">
                          <span>💧 {hour.chance_of_rain}%</span>
                          <span>
                            💨 {unit === "c" ? hour.wind_kph : hour.wind_mph}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
