import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Combine multiple class names and ensure Tailwind classes are properly merged
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format temperature based on selected unit
export function formatTemperature(temp, unit = 'c') {
  return `${Math.round(temp)}°${unit.toUpperCase()}`;
}

// Format date to human-readable format
export function formatDate(dateString) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

// Format time to 12-hour format
export function formatTime(timeString) {
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Get weather background class based on condition and is_day
export function getWeatherBackground(condition, isDay = 1) {
  const code = typeof condition === 'object' ? condition.code : condition;
  const conditionText = typeof condition === 'object' ? condition.text.toLowerCase() : '';

  // Night time
  if (isDay === 0) {
    return 'bg-night';
  }

  // Check for rain/precipitation
  if (
    code >= 1063 && code <= 1171 || // Patchy rain, moderate rain, heavy rain
    code >= 1180 && code <= 1201 || // Light/moderate/heavy rain
    code >= 1240 && code <= 1246 || // Light/moderate/heavy rain showers
    conditionText.includes('rain') ||
    conditionText.includes('drizzle') ||
    conditionText.includes('sleet')
  ) {
    return 'bg-rainy';
  }

  // Check for cloudy conditions
  if (
    code >= 1003 && code <= 1030 || // Cloudy, overcast
    code >= 1135 && code <= 1147 || // Fog, mist
    conditionText.includes('cloud') ||
    conditionText.includes('overcast')
  ) {
    return 'bg-cloudy';
  }

  // Default to sunny for clear conditions
  return 'bg-sunny';
}

// Format air quality index to descriptive text
export function formatAirQuality(aqiValue) {
  if (aqiValue <= 50) return { level: 'Good', color: 'bg-green-500' };
  if (aqiValue <= 100) return { level: 'Moderate', color: 'bg-yellow-500' };
  if (aqiValue <= 150) return { level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500' };
  if (aqiValue <= 200) return { level: 'Unhealthy', color: 'bg-red-500' };
  if (aqiValue <= 300) return { level: 'Very Unhealthy', color: 'bg-purple-600' };
  return { level: 'Hazardous', color: 'bg-red-900' };
}

// Get wind direction arrow based on degree
export function getWindDirection(degree) {
  const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
  return directions[Math.round(degree / 45) % 8];
}

// Helper function to calculate date range for historical data
export function getDateRange(days = 7) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return {
    start: startDate.toISOString().split('T')[0],
    end: endDate.toISOString().split('T')[0],
  };
}

// Convert between Celsius and Fahrenheit
export function convertTemperature(temp, fromUnit = 'c', toUnit = 'f') {
  if (fromUnit === toUnit) return temp;

  if (fromUnit === 'c' && toUnit === 'f') {
    return (temp * 9/5) + 32;
  }

  if (fromUnit === 'f' && toUnit === 'c') {
    return (temp - 32) * 5/9;
  }

  return temp;
}

// Format precipitation to include units
export function formatPrecipitation(amount, unit = 'mm') {
  return `${amount} ${unit}`;
}

// Format wind speed with units
export function formatWindSpeed(speed, unit = 'kph') {
  return `${speed} ${unit}`;
}

// Generate chart data for temperature forecast
export function generateTempChartData(forecast) {
  if (!forecast || !forecast.forecastday) return null;

  return {
    labels: forecast.forecastday.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [
      {
        label: 'Max Temp',
        data: forecast.forecastday.map(day => day.day.maxtemp_c),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Min Temp',
        data: forecast.forecastday.map(day => day.day.mintemp_c),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      }
    ]
  };
}

// Generate hourly chart data
export function generateHourlyTempChartData(forecast, day = 0) {
  if (!forecast || !forecast.forecastday || !forecast.forecastday[day]) return null;

  const hourlyData = forecast.forecastday[day].hour;

  return {
    labels: hourlyData.map(hour => hour.time.split(' ')[1]),
    datasets: [
      {
        label: 'Temperature',
        data: hourlyData.map(hour => hour.temp_c),
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.5)',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Feels Like',
        data: hourlyData.map(hour => hour.feelslike_c),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.5)',
        tension: 0.3,
        fill: false,
        borderDash: [5, 5],
      }
    ]
  };
}
