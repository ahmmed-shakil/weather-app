import { useState } from "react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon } from "lucide-react";
import { useGetHistoricalWeatherQuery } from "../../lib/redux/weatherApi";
import { formatTemperature, formatDate, getDateRange } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";

export default function HistoricalWeather() {
  const { location: locationName, unit } = useSelector(
    (state) => state.weather
  );
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] // 7 days ago
  );

  const {
    data: historicalData,
    isLoading,
    error,
  } = useGetHistoricalWeatherQuery({
    location: locationName,
    date: selectedDate,
  });

  // Get a date range for the date picker
  const dateRange = getDateRange(30); // Last 30 days

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
          <p className="text-2xl font-bold mb-2">
            Error loading historical data
          </p>
          <p>
            {error?.data?.error?.message ||
              "Unable to fetch historical weather information"}
          </p>
        </div>
      </div>
    );
  }

  if (!historicalData) return null;

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    if (newDate <= today) {
      setSelectedDate(newDate);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Historical Weather
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {historicalData.location.name}, {historicalData.location.country}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <CalendarIcon
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={16}
            />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              max={today}
              min={dateRange.start}
              className="pl-10 input"
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{formatDate(selectedDate)} - Historical Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col items-center bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <img
                src={historicalData.forecast.forecastday[0].day.condition.icon}
                alt={historicalData.forecast.forecastday[0].day.condition.text}
                className="w-24 h-24 mb-2"
              />
              <h3 className="text-xl font-semibold mb-1">
                {historicalData.forecast.forecastday[0].day.condition.text}
              </h3>
              <div className="text-4xl font-bold mb-2">
                {formatTemperature(
                  unit === "c"
                    ? historicalData.forecast.forecastday[0].day.avgtemp_c
                    : historicalData.forecast.forecastday[0].day.avgtemp_f,
                  unit
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 text-center w-full mt-4">
                <div>
                  <p className="text-sm text-gray-500">Min Temp</p>
                  <p className="text-lg font-medium">
                    {formatTemperature(
                      unit === "c"
                        ? historicalData.forecast.forecastday[0].day.mintemp_c
                        : historicalData.forecast.forecastday[0].day.mintemp_f,
                      unit
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Max Temp</p>
                  <p className="text-lg font-medium">
                    {formatTemperature(
                      unit === "c"
                        ? historicalData.forecast.forecastday[0].day.maxtemp_c
                        : historicalData.forecast.forecastday[0].day.maxtemp_f,
                      unit
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Max Wind</p>
                <p className="text-xl font-semibold">
                  {unit === "c"
                    ? historicalData.forecast.forecastday[0].day.maxwind_kph
                    : historicalData.forecast.forecastday[0].day
                        .maxwind_mph}{" "}
                  {unit === "c" ? "km/h" : "mph"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Total Precipitation</p>
                <p className="text-xl font-semibold">
                  {unit === "c"
                    ? historicalData.forecast.forecastday[0].day.totalprecip_mm
                    : historicalData.forecast.forecastday[0].day
                        .totalprecip_in}{" "}
                  {unit === "c" ? "mm" : "in"}
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">Avg Humidity</p>
                <p className="text-xl font-semibold">
                  {historicalData.forecast.forecastday[0].day.avghumidity}%
                </p>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-500">UV Index</p>
                <p className="text-xl font-semibold">
                  {historicalData.forecast.forecastday[0].day.uv}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Hourly Breakdown</h3>
            <div className="overflow-x-auto pb-2">
              <div className="inline-flex gap-4">
                {historicalData.forecast.forecastday[0].hour
                  .filter((_, i) => i % 3 === 0)
                  .map((hour) => (
                    <motion.div
                      key={hour.time}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-32 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex-shrink-0"
                    >
                      <p className="text-sm font-medium text-center mb-1">
                        {hour.time.split(" ")[1]}
                      </p>
                      <div className="flex justify-center">
                        <img
                          src={hour.condition.icon}
                          alt={hour.condition.text}
                          className="w-12 h-12 my-1"
                        />
                      </div>
                      <p className="text-lg font-semibold text-center mb-1">
                        {formatTemperature(
                          unit === "c" ? hour.temp_c : hour.temp_f,
                          unit
                        )}
                      </p>
                      <p className="text-xs text-gray-500 text-center">
                        {hour.condition.text}
                      </p>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-center">
                        <div>
                          <p className="text-gray-500">Precip</p>
                          <p>
                            {unit === "c" ? hour.precip_mm : hour.precip_in}{" "}
                            {unit === "c" ? "mm" : "in"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Humidity</p>
                          <p>{hour.humidity}%</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How This Compares to Averages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-center text-gray-500 mb-2">Temperature</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-lg font-medium">
                    {formatTemperature(24, unit)}
                  </p>
                </div>
                <div className="h-10 border-l border-gray-300 dark:border-gray-600"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Actual</p>
                  <p
                    className={`text-lg font-medium ${
                      historicalData.forecast.forecastday[0].day.avgtemp_c > 24
                        ? "text-red-500"
                        : historicalData.forecast.forecastday[0].day.avgtemp_c <
                            24
                          ? "text-blue-500"
                          : ""
                    }`}
                  >
                    {formatTemperature(
                      unit === "c"
                        ? historicalData.forecast.forecastday[0].day.avgtemp_c
                        : historicalData.forecast.forecastday[0].day.avgtemp_f,
                      unit
                    )}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs mt-3 text-gray-500">
                {historicalData.forecast.forecastday[0].day.avgtemp_c > 24
                  ? "Above average"
                  : historicalData.forecast.forecastday[0].day.avgtemp_c < 24
                    ? "Below average"
                    : "Average"}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-center text-gray-500 mb-2">Precipitation</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-lg font-medium">
                    {unit === "c" ? "2.0 mm" : "0.08 in"}
                  </p>
                </div>
                <div className="h-10 border-l border-gray-300 dark:border-gray-600"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Actual</p>
                  <p
                    className={`text-lg font-medium ${
                      historicalData.forecast.forecastday[0].day
                        .totalprecip_mm > 2
                        ? "text-blue-500"
                        : ""
                    }`}
                  >
                    {unit === "c"
                      ? `${historicalData.forecast.forecastday[0].day.totalprecip_mm} mm`
                      : `${historicalData.forecast.forecastday[0].day.totalprecip_in} in`}
                  </p>
                </div>
              </div>
              <p className="text-center text-xs mt-3 text-gray-500">
                {historicalData.forecast.forecastday[0].day.totalprecip_mm > 2
                  ? "More than average"
                  : historicalData.forecast.forecastday[0].day.totalprecip_mm <
                      2
                    ? "Less than average"
                    : "Average"}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-center text-gray-500 mb-2">Humidity</p>
              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Average</p>
                  <p className="text-lg font-medium">65%</p>
                </div>
                <div className="h-10 border-l border-gray-300 dark:border-gray-600"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Actual</p>
                  <p
                    className={`text-lg font-medium ${
                      historicalData.forecast.forecastday[0].day.avghumidity >
                      65
                        ? "text-blue-500"
                        : ""
                    }`}
                  >
                    {historicalData.forecast.forecastday[0].day.avghumidity}%
                  </p>
                </div>
              </div>
              <p className="text-center text-xs mt-3 text-gray-500">
                {historicalData.forecast.forecastday[0].day.avghumidity > 65
                  ? "More humid than average"
                  : historicalData.forecast.forecastday[0].day.avghumidity < 65
                    ? "Less humid than average"
                    : "Average humidity"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
