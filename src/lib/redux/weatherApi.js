import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Import environment variables
const API_KEY = '5ab23cb165b24023bbc154932250604';
const BASE_URL = 'https://api.weatherapi.com/v1';

export const weatherApi = createApi({
  reducerPath: 'weatherApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  endpoints: (builder) => ({
    // Current weather data
    getCurrentWeather: builder.query({
      query: (location) => ({
        url: '/current.json',
        params: {
          key: API_KEY,
          q: location,
          aqi: 'yes', // Include air quality data
        },
      }),
    }),

    // Weather forecast
    getForecast: builder.query({
      query: ({ location, days = 7 }) => ({
        url: '/forecast.json',
        params: {
          key: API_KEY,
          q: location,
          days,
          aqi: 'yes',
          alerts: 'yes',
        },
      }),
    }),

    // Search/autocomplete locations
    searchLocation: builder.query({
      query: (query) => ({
        url: '/search.json',
        params: {
          key: API_KEY,
          q: query,
        },
      }),
    }),

    // Historical weather data
    getHistoricalWeather: builder.query({
      query: ({ location, date }) => ({
        url: '/history.json',
        params: {
          key: API_KEY,
          q: location,
          dt: date, // Format: yyyy-MM-dd (e.g. 2023-01-01)
        },
      }),
    }),

    // Astronomy data (sunrise, sunset, moon phases)
    getAstronomy: builder.query({
      query: ({ location, date }) => ({
        url: '/astronomy.json',
        params: {
          key: API_KEY,
          q: location,
          dt: date, // Format: yyyy-MM-dd (e.g. 2023-01-01)
        },
      }),
    }),

    // Marine weather (if applicable)
    getMarineWeather: builder.query({
      query: ({ location, days = 1 }) => ({
        url: '/marine.json',
        params: {
          key: API_KEY,
          q: location,
          days,
        },
      }),
    }),

    // Air Quality data
    getAirQuality: builder.query({
      query: (location) => ({
        url: '/current.json',
        params: {
          key: API_KEY,
          q: location,
          aqi: 'yes',
        },
        transformResponse: (response) => response.current.air_quality,
      }),
    }),
  }),
});

export const {
  useGetCurrentWeatherQuery,
  useGetForecastQuery,
  useSearchLocationQuery,
  useGetHistoricalWeatherQuery,
  useGetAstronomyQuery,
  useGetMarineWeatherQuery,
  useGetAirQualityQuery,
} = weatherApi;
