import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Droplets,
  Wind,
  Sunrise,
  Sunset,
  Thermometer,
  Gauge,
  Compass,
  Eye,
  Clock,
  Calendar,
} from "lucide-react";
import {
  useGetCurrentWeatherQuery,
  useGetAstronomyQuery,
} from "../../lib/redux/weatherApi";
import {
  formatTemperature,
  formatDate,
  formatTime,
  getWindDirection,
} from "../../lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  GlassCard,
} from "../ui/Card";

export default function CurrentWeather() {
  const { location: locationName, unit } = useSelector(
    (state) => state.weather
  );
  const currentDate = new Date().toISOString().split("T")[0];

  const {
    data: currentWeather,
    isLoading: isLoadingCurrent,
    error: currentError,
  } = useGetCurrentWeatherQuery(locationName);
  const { data: astronomy, isLoading: isLoadingAstronomy } =
    useGetAstronomyQuery({
      location: locationName,
      date: currentDate,
    });

  if (isLoadingCurrent || isLoadingAstronomy) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-xl text-gray-500">
          Loading weather data...
        </div>
      </div>
    );
  }

  if (currentError) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500 text-center">
          <p className="text-2xl font-bold mb-2">Error loading weather data</p>
          <p>
            {currentError?.data?.error?.message ||
              "Unable to fetch weather information"}
          </p>
        </div>
      </div>
    );
  }

  if (!currentWeather) return null;

  const { current, location } = currentWeather;
  const temp = unit === "c" ? current.temp_c : current.temp_f;
  const feelsLike = unit === "c" ? current.feelslike_c : current.feelslike_f;
  const windSpeed = unit === "c" ? current.wind_kph : current.wind_mph;
  const windUnit = unit === "c" ? "km/h" : "mph";
  const precipUnit = unit === "c" ? "mm" : "in";
  const precipAmount = unit === "c" ? current.precip_mm : current.precip_in;
  const visibilityValue = unit === "c" ? current.vis_km : current.vis_miles;
  const visibilityUnit = unit === "c" ? "km" : "mi";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            {location.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {location.region}
            {location?.region ? "," : ""} {location.country}
          </p>
        </div>
        <div className="ml-0 md:ml-auto text-gray-600 dark:text-gray-300 text-sm md:text-base flex gap-2 items-center">
          <Clock size={16} />
          <span>
            Local time: {formatTime(location.localtime.split(" ")[1])}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main current weather card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="md:col-span-5"
        >
          <GlassCard className="h-full relative overflow-hidden bg-primary-500/10">
            <div className="absolute inset-0 overflow-hidden -z-10">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{
                  backgroundImage: `url(${current.condition.icon.replace("64x64", "128x128")})`,
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between">
              <div className="flex flex-col items-center sm:items-start">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(currentDate)}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={current.condition.icon}
                    alt={current.condition.text}
                    className="w-16 h-16"
                  />
                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                    {formatTemperature(temp, unit)}
                  </span>
                </div>
                <span className="text-lg text-gray-700 dark:text-gray-300">
                  {current.condition.text}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Feels like {formatTemperature(feelsLike, unit)}
                </span>
              </div>

              <div className="mt-4 sm:mt-0 flex flex-col gap-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Thermometer size={16} className="text-red-500" />
                  <span>
                    Max/Min: {formatTemperature(temp + 2, unit)}/
                    {formatTemperature(temp - 4, unit)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={16} className="text-blue-500" />
                  <span>Humidity: {current.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-500" />
                  <span>
                    Updated: {formatTime(location.localtime.split(" ")[1])}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <Wind size={20} className="text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {windSpeed} {windUnit}
                  </span>
                  <span className="text-xs text-gray-500">Wind</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <Compass size={20} className="text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {getWindDirection(current.wind_degree)}
                  </span>
                  <span className="text-xs text-gray-500">Direction</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <Gauge size={20} className="text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {current.pressure_mb} mb
                  </span>
                  <span className="text-xs text-gray-500">Pressure</span>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center"
                >
                  <Eye size={20} className="text-gray-500 mb-1" />
                  <span className="text-sm font-medium">
                    {visibilityValue} {visibilityUnit}
                  </span>
                  <span className="text-xs text-gray-500">Visibility</span>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Supplementary data cards */}
        <div className="md:col-span-7 space-y-6">
          {/* Day/Night + Precipitation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sunrise/Sunset card */}
            <Card animate={true} delay={1}>
              <CardHeader>
                <CardTitle>Day & Night</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center">
                    <Sunrise size={28} className="mb-2 text-orange-500" />
                    <span className="text-lg font-medium">
                      {astronomy?.astronomy?.astro?.sunrise || "6:00 AM"}
                    </span>
                    <span className="text-sm text-gray-500">Sunrise</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Sunset size={28} className="mb-2 text-indigo-500" />
                    <span className="text-lg font-medium">
                      {astronomy?.astronomy?.astro?.sunset || "6:00 PM"}
                    </span>
                    <span className="text-sm text-gray-500">Sunset</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium">
                        {astronomy?.astronomy?.astro?.moon_phase || "Full Moon"}
                      </p>
                      <p className="text-xs text-gray-500">Moon Phase</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {astronomy?.astronomy?.astro?.moon_illumination ||
                          "100"}
                        %
                      </p>
                      <p className="text-xs text-gray-500">Illumination</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Precipitation card */}
            <Card animate={true} delay={2}>
              <CardHeader>
                <CardTitle>Precipitation & Clouds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Precipitation</span>
                    <span className="text-sm font-medium">
                      {precipAmount} {precipUnit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${Math.min(precipAmount * 100, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm">Cloud Cover</span>
                    <span className="text-sm font-medium">
                      {current.cloud}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-500 rounded-full"
                      style={{ width: `${current.cloud}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <span className="text-sm">UV Index</span>
                    <span className="text-sm font-medium">
                      {current.uv} of 10
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${current.uv * 10}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Air Quality card */}
          <Card animate={true} delay={3}>
            <CardHeader>
              <CardTitle>Air Quality</CardTitle>
            </CardHeader>
            <CardContent>
              {current.air_quality ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">CO</p>
                      <p className="text-lg font-medium">
                        {current.air_quality.co.toFixed(1)}
                      </p>
                      <p className="text-xs">μg/m³</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">NO₂</p>
                      <p className="text-lg font-medium">
                        {current.air_quality.no2.toFixed(1)}
                      </p>
                      <p className="text-xs">μg/m³</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">O₃</p>
                      <p className="text-lg font-medium">
                        {current.air_quality.o3.toFixed(1)}
                      </p>
                      <p className="text-xs">μg/m³</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500">PM2.5</p>
                      <p className="text-lg font-medium">
                        {current.air_quality.pm2_5.toFixed(1)}
                      </p>
                      <p className="text-xs">μg/m³</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Air Quality Index:
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          current.air_quality["us-epa-index"] <= 2
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : current.air_quality["us-epa-index"] <= 4
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {current.air_quality["us-epa-index"] === 1 && "Good"}
                        {current.air_quality["us-epa-index"] === 2 &&
                          "Moderate"}
                        {current.air_quality["us-epa-index"] === 3 &&
                          "Unhealthy for Sensitive Groups"}
                        {current.air_quality["us-epa-index"] === 4 &&
                          "Unhealthy"}
                        {current.air_quality["us-epa-index"] === 5 &&
                          "Very Unhealthy"}
                        {current.air_quality["us-epa-index"] === 6 &&
                          "Hazardous"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 text-gray-500">
                  No air quality data available for this location
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
