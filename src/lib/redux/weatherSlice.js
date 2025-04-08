import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  location: 'London',
  unit: 'c', // 'c' for Celsius, 'f' for Fahrenheit
  theme: 'light',
  selectedDate: new Date().toISOString().split('T')[0], // current date in YYYY-MM-DD format
  viewMode: 'current', // 'current', 'forecast', 'historical', 'astronomy', etc.
  favorites: [], // saved locations
  recentSearches: [],
};

export const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setLocation: (state, action) => {
      state.location = action.payload;
      // Add to recent searches if not already there
      if (!state.recentSearches.includes(action.payload)) {
        state.recentSearches = [action.payload, ...state.recentSearches].slice(0, 5);
      }
    },
    toggleUnit: (state) => {
      state.unit = state.unit === 'c' ? 'f' : 'c';
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    },
    addToFavorites: (state, action) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action) => {
      state.favorites = state.favorites.filter(location => location !== action.payload);
    },
    clearRecentSearches: (state) => {
      state.recentSearches = [];
    }
  },
});

export const {
  setLocation,
  toggleUnit,
  toggleTheme,
  setSelectedDate,
  setViewMode,
  addToFavorites,
  removeFromFavorites,
  clearRecentSearches,
} = weatherSlice.actions;

export default weatherSlice.reducer;
