import { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Moon, Sun, Sunrise, Sunset } from 'lucide-react';
import { useGetAstronomyQuery } from '../../lib/redux/weatherApi';
import { formatDate } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export default function AstronomyWidget() {
  const { location: locationName } = useSelector((state) => state.weather);
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);

  const { data: astronomyData, isLoading, error } = useGetAstronomyQuery({
    location: locationName,
    date: selectedDate,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading astronomy data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-red-500 text-center">
          <p className="text-2xl font-bold mb-2">Error loading astronomy data</p>
          <p>{error?.data?.error?.message || 'Unable to fetch astronomy information'}</p>
        </div>
      </div>
    );
  }

  if (!astronomyData) return null;

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  // Calculate day length
  const calculateDayLength = () => {
    if (!astronomyData.astronomy.astro) return { hours: '12', minutes: '00' };

    const sunrise = astronomyData.astronomy.astro.sunrise;
    const sunset = astronomyData.astronomy.astro.sunset;

    // Convert to 24 hour format
    const convertTo24Hour = (time12h) => {
      const [time, modifier] = time12h.split(' ');
      let [hours, minutes] = time.split(':');

      if (hours === '12') {
        hours = '00';
      }

      if (modifier === 'PM') {
        hours = parseInt(hours, 10) + 12;
      }

      return { hours, minutes };
    };

    const sunriseTime = convertTo24Hour(sunrise);
    const sunsetTime = convertTo24Hour(sunset);

    // Calculate difference in minutes
    const sunriseMinutes = parseInt(sunriseTime.hours) * 60 + parseInt(sunriseTime.minutes);
    const sunsetMinutes = parseInt(sunsetTime.hours) * 60 + parseInt(sunsetTime.minutes);

    let dayLengthMinutes = sunsetMinutes - sunriseMinutes;
    if (dayLengthMinutes < 0) {
      dayLengthMinutes += 24 * 60; // Add a full day if sunset is on the next day
    }

    const dayHours = Math.floor(dayLengthMinutes / 60);
    const dayMinutes = dayLengthMinutes % 60;

    return {
      hours: dayHours.toString().padStart(2, '0'),
      minutes: dayMinutes.toString().padStart(2, '0'),
    };
  };

  const dayLength = calculateDayLength();

  // Get moon emoji based on moon phase
  const getMoonEmoji = (moonPhase) => {
    const phases = {
      'New Moon': '🌑',
      'Waxing Crescent': '🌒',
      'First Quarter': '🌓',
      'Waxing Gibbous': '🌔',
      'Full Moon': '🌕',
      'Waning Gibbous': '🌖',
      'Last Quarter': '🌗',
      'Waning Crescent': '🌘',
    };

    return phases[moonPhase] || '🌙';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Astronomy Data
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {astronomyData.location.name}, {astronomyData.location.country}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={16} />
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="pl-10 input"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sun Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sun className="mr-2 text-yellow-500" size={24} />
              Sun Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-full max-w-xs h-32 bg-gradient-to-b from-yellow-100 to-orange-200 dark:from-indigo-900 dark:to-blue-900 rounded-full overflow-hidden">
                  {/* Sunrise animation */}
                  <motion.div
                    initial={{ x: '0%', y: '100%', opacity: 0 }}
                    animate={{ x: '25%', y: '0%', opacity: 1 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute w-12 h-12 rounded-full bg-yellow-500"
                  />

                  {/* Sunset animation */}
                  <motion.div
                    initial={{ x: '75%', y: '0%', opacity: 1 }}
                    animate={{ x: '100%', y: '100%', opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", delay: 2 }}
                    className="absolute w-12 h-12 rounded-full bg-orange-500"
                  />
                </div>

                <div className="grid grid-cols-3 w-full mt-6 text-center">
                  <div className="flex flex-col items-center">
                    <Sunrise className="text-orange-500 mb-1" size={24} />
                    <p className="text-xl font-semibold">
                      {astronomyData.astronomy.astro.sunrise}
                    </p>
                    <p className="text-sm text-gray-500">Sunrise</p>
                  </div>

                  <div className="flex flex-col items-center border-x border-gray-200 dark:border-gray-700">
                    <Sun className="text-yellow-500 mb-1" size={24} />
                    <p className="text-xl font-semibold">
                      {dayLength.hours}h {dayLength.minutes}m
                    </p>
                    <p className="text-sm text-gray-500">Day Length</p>
                  </div>

                  <div className="flex flex-col items-center">
                    <Sunset className="text-indigo-500 mb-1" size={24} />
                    <p className="text-xl font-semibold">
                      {astronomyData.astronomy.astro.sunset}
                    </p>
                    <p className="text-sm text-gray-500">Sunset</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moon Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Moon className="mr-2 text-gray-500" size={24} />
              Moon Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-6xl mb-4">
                {getMoonEmoji(astronomyData.astronomy.astro.moon_phase)}
              </div>

              <h3 className="text-xl font-semibold mb-4">
                {astronomyData.astronomy.astro.moon_phase}
              </h3>

              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg font-semibold">
                    {astronomyData.astronomy.astro.moonrise}
                  </p>
                  <p className="text-sm text-gray-500">Moonrise</p>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg font-semibold">
                    {astronomyData.astronomy.astro.moonset}
                  </p>
                  <p className="text-sm text-gray-500">Moonset</p>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-lg font-semibold">
                    {astronomyData.astronomy.astro.moon_illumination}%
                  </p>
                  <p className="text-sm text-gray-500">Illumination</p>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${astronomyData.astronomy.astro.moon_illumination}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500">Visibility</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information about seasons and moon cycles */}
      <Card>
        <CardHeader>
          <CardTitle>Astronomy Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Moon Phases</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The Moon's appearance changes throughout the month as it orbits Earth,
                creating different phases from New Moon to Full Moon and back again.
              </p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🌑</div>
                  <p className="text-xs">New Moon</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🌓</div>
                  <p className="text-xs">First Quarter</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🌕</div>
                  <p className="text-xs">Full Moon</p>
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-2xl mb-1">🌗</div>
                  <p className="text-xs">Last Quarter</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-3">Did You Know?</h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5">•</div>
                  <p>Moonlight is actually reflected sunlight. The Moon doesn't produce its own light.</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5">•</div>
                  <p>The Moon is moving away from Earth at a rate of about 3.8 cm per year.</p>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-0.5">•</div>
                  <p>A lunar day (the time it takes for the Moon to rotate once) is equal to a lunar month.</p>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
