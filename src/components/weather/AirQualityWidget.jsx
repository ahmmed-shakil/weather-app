import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useGetAirQualityQuery } from "../../lib/redux/weatherApi";
import { formatAirQuality } from "../../lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { useEffect, useState } from "react";

export default function AirQualityWidget() {
  const { location: locationName } = useSelector((state) => state.weather);
  const [airQuality, setAirQuality] = useState(null);
  // const [airQuality, setAirQuality] = useState({
  //   co: 466.2,
  //   "gb-defra-index": 5,
  //   no2: 88.985,
  //   o3: 20,
  //   pm2_5: 47.175,
  //   pm10: 57.535,
  //   so2: 12.395,
  //   "us-epa-index": 3,
  // });

  const { data, isLoading, error, isSuccess } =
    useGetAirQualityQuery(locationName);
  // console.log("🚀 ~ AirQualityWidget ~ airQuality:", data);

  useEffect(() => {
    if (isSuccess) {
      setAirQuality(data?.current?.air_quality);
    }
  }, [isSuccess]);

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
            Error loading air quality data
          </p>
          <p>
            {error?.data?.error?.message ||
              "Unable to fetch air quality information"}
          </p>
        </div>
      </div>
    );
  }

  if (!airQuality) return null;

  // Calculate the US EPA index from 0-500 based on the EPA standards
  const calculateAQI = () => {
    // Using PM2.5 as a primary indicator since it's common
    const pm25 = airQuality.pm2_5;

    if (pm25 <= 12) {
      return {
        value: Math.round(((pm25 - 0) / (12 - 0)) * 50),
        category: "Good",
        color: "bg-green-500",
        textColor: "text-green-800",
        bgColor: "bg-green-100",
        darkBgColor: "dark:bg-green-900",
        darkTextColor: "dark:text-green-300",
      };
    } else if (pm25 <= 35.4) {
      return {
        value: Math.round(((pm25 - 12.1) / (35.4 - 12.1)) * 50 + 51),
        category: "Moderate",
        color: "bg-yellow-500",
        textColor: "text-yellow-800",
        bgColor: "bg-yellow-100",
        darkBgColor: "dark:bg-yellow-900",
        darkTextColor: "dark:text-yellow-300",
      };
    } else if (pm25 <= 55.4) {
      return {
        value: Math.round(((pm25 - 35.5) / (55.4 - 35.5)) * 50 + 101),
        category: "Unhealthy for Sensitive Groups",
        color: "bg-orange-500",
        textColor: "text-orange-800",
        bgColor: "bg-orange-100",
        darkBgColor: "dark:bg-orange-900",
        darkTextColor: "dark:text-orange-300",
      };
    } else if (pm25 <= 150.4) {
      return {
        value: Math.round(((pm25 - 55.5) / (150.4 - 55.5)) * 50 + 151),
        category: "Unhealthy",
        color: "bg-red-500",
        textColor: "text-red-800",
        bgColor: "bg-red-100",
        darkBgColor: "dark:bg-red-900",
        darkTextColor: "dark:text-red-300",
      };
    } else if (pm25 <= 250.4) {
      return {
        value: Math.round(((pm25 - 150.5) / (250.4 - 150.5)) * 50 + 201),
        category: "Very Unhealthy",
        color: "bg-purple-500",
        textColor: "text-purple-800",
        bgColor: "bg-purple-100",
        darkBgColor: "dark:bg-purple-900",
        darkTextColor: "dark:text-purple-300",
      };
    } else {
      return {
        value: Math.round(((pm25 - 250.5) / (500.4 - 250.5)) * 100 + 301),
        category: "Hazardous",
        color: "bg-red-900",
        textColor: "text-red-800",
        bgColor: "bg-red-100",
        darkBgColor: "dark:bg-red-900",
        darkTextColor: "dark:text-red-300",
      };
    }
  };

  const aqi = calculateAQI();

  // Get EPA index from API response
  const epaIndex = airQuality["us-epa-index"];
  const epaCategory =
    [
      "Good",
      "Moderate",
      "Unhealthy for Sensitive Groups",
      "Unhealthy",
      "Very Unhealthy",
      "Hazardous",
    ][epaIndex - 1] || "Unknown";

  // Health recommendations based on air quality
  const getHealthRecommendations = (category) => {
    switch (category) {
      case "Good":
        return "Air quality is considered satisfactory, and air pollution poses little or no risk.";
      case "Moderate":
        return "Air quality is acceptable; however, there may be some health concerns for a very small number of people who are unusually sensitive to air pollution.";
      case "Unhealthy for Sensitive Groups":
        return "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
      case "Unhealthy":
        return "Everyone may begin to experience health effects. Members of sensitive groups may experience more serious health effects.";
      case "Very Unhealthy":
        return "Health warnings of emergency conditions. The entire population is more likely to be affected.";
      case "Hazardous":
        return "Health alert: everyone may experience more serious health effects. Avoid outdoor activities and wear a mask if you must go outside.";
      default:
        return "No recommendations available.";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Air Quality Index
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {locationName}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main AQI Card */}
        <Card>
          <CardHeader>
            <CardTitle>Current Air Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <div
                className={`w-52 h-52 rounded-full flex items-center justify-center ${aqi.bgColor} ${aqi.darkBgColor} mb-6 relative`}
              >
                <div
                  className={`w-44 h-44 rounded-full ${aqi.color} flex items-center justify-center`}
                >
                  <div className="w-36 h-36 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold">{aqi.value}</span>
                    <span className="text-sm">AQI</span>
                  </div>
                </div>

                {/* Animated particles for visual effect */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-3 h-3 rounded-full ${aqi.color} animate-float animate-delayed`}
                    style={{
                      "--delay": `${i * 0.3}s`,
                      top: `${15 + Math.random() * 70}%`,
                      left: `${15 + Math.random() * 70}%`,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>

              <h3
                className={`text-2xl font-semibold mb-2 ${aqi.textColor} ${aqi.darkTextColor}`}
              >
                {aqi.category}
              </h3>

              <p className="text-center text-gray-600 dark:text-gray-300 max-w-md">
                {getHealthRecommendations(aqi.category)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pollutants Details */}
        <Card>
          <CardHeader>
            <CardTitle>Pollutant Measurements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>PM2.5</span>
                    <span className="font-medium">
                      {airQuality.pm2_5.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.pm2_5 / 150) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Fine particulate matter
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>PM10</span>
                    <span className="font-medium">
                      {airQuality.pm10.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.pm10 / 300) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Coarse particulate matter
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>O₃ (Ozone)</span>
                    <span className="font-medium">
                      {airQuality.o3.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.o3 / 200) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Ground-level ozone</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>NO₂</span>
                    <span className="font-medium">
                      {airQuality.no2.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.no2 / 200) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Nitrogen dioxide</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>SO₂</span>
                    <span className="font-medium">
                      {airQuality.so2.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.so2 / 350) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Sulfur dioxide</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CO</span>
                    <span className="font-medium">
                      {airQuality.co.toFixed(1)} μg/m³
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{
                        width: `${Math.min((airQuality.co / 15000) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">Carbon monoxide</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">About Air Quality</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Air Quality Index (AQI) is a measure used to communicate how
                  polluted the air currently is. The AQI focuses on health
                  effects you may experience within a few hours or days after
                  breathing polluted air.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Impact Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Impact & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className={`p-4 rounded-lg ${aqi.bgColor} ${aqi.darkBgColor}`}
              >
                <h4
                  className={`font-medium mb-2 ${aqi.textColor} ${aqi.darkTextColor}`}
                >
                  Sensitive Groups
                </h4>
                <p className="text-sm">
                  {aqi.category === "Good"
                    ? "No precautions needed."
                    : "People with respiratory or heart conditions, the elderly and children should limit prolonged outdoor exertion."}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${aqi.bgColor} ${aqi.darkBgColor}`}
              >
                <h4
                  className={`font-medium mb-2 ${aqi.textColor} ${aqi.darkTextColor}`}
                >
                  Health Effects
                </h4>
                <p className="text-sm">
                  {aqi.category === "Good"
                    ? "No health implications."
                    : aqi.category === "Moderate"
                      ? "Few people may experience respiratory symptoms."
                      : "May cause respiratory symptoms in sensitive individuals and irritation in healthy people."}
                </p>
              </div>

              <div
                className={`p-4 rounded-lg ${aqi.bgColor} ${aqi.darkBgColor}`}
              >
                <h4
                  className={`font-medium mb-2 ${aqi.textColor} ${aqi.darkTextColor}`}
                >
                  Precautions
                </h4>
                <p className="text-sm">
                  {aqi.category === "Good"
                    ? "Enjoy outdoor activities."
                    : aqi.category === "Moderate"
                      ? "Consider reducing prolonged or heavy exertion outdoors."
                      : "Reduce prolonged or heavy exertion. Take more breaks during outdoor activities."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
