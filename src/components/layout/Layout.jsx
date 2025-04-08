import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Header from './Header';
import { getWeatherBackground } from '../../lib/utils';

export default function Layout({ children }) {
  const { viewMode } = useSelector((state) => state.weather);

  // Use a dynamic background based on the current weather data
  // This assumes we'll have weather data available in the child components

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />

      <main className="flex-1 w-full px-4 py-6 md:py-8">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto"
        >
          {children}
        </motion.div>
      </main>

      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <p>Weather<span className="text-primary-500">Plus</span> &copy; {new Date().getFullYear()} | Powered by <a href="https://weatherapi.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">WeatherAPI.com</a></p>
      </footer>
    </div>
  );
}
