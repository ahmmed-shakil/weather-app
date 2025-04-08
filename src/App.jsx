import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './lib/redux/store';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './components/layout/ThemeProvider';
import Layout from './components/layout/Layout';
import CurrentWeather from './components/weather/CurrentWeather';
import ForecastWeather from './components/weather/ForecastWeather';
import HistoricalWeather from './components/weather/HistoricalWeather';
import AirQualityWidget from './components/weather/AirQualityWidget';
import AstronomyWidget from './components/weather/AstronomyWidget';
import WeatherMap from './components/weather/WeatherMap';

// This wrapper allows us to access the Redux store
function AppContent() {
  const { viewMode } = useSelector((state) => state.weather);

  // Render different components based on the selected view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'forecast':
        return <ForecastWeather />;
      case 'historical':
        return <HistoricalWeather />;
      case 'airquality':
        return <AirQualityWidget />;
      case 'astronomy':
        return <AstronomyWidget />;
      case 'map':
        return <WeatherMap />;
      case 'current':
      default:
        return <CurrentWeather />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Provider>
  );
}

export default App;
