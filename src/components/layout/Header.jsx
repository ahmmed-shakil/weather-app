import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Search,
  MapPin,
  Clock,
  Star,
  Settings,
  Menu,
  X,
} from "lucide-react";
import {
  setLocation,
  setViewMode,
  addToFavorites,
} from "../../lib/redux/weatherSlice";
import { useTheme } from "./ThemeProvider";
import { useSearchLocationQuery } from "../../lib/redux/weatherApi";

export default function Header() {
  const dispatch = useDispatch();
  const { theme, toggle } = useTheme();
  const { location, favorites, recentSearches, viewMode } = useSelector(
    (state) => state.weather
  );
  // console.log("🚀 ~ Header ~ viewMode:", viewMode);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Skip auto-fetching until user types
  const { data: searchResults, isLoading } = useSearchLocationQuery(
    searchInput.length > 2 ? searchInput : "",
    { skip: searchInput.length <= 2 }
  );

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      dispatch(setLocation(searchInput.trim()));
      setSearchInput("");
      setShowSuggestions(false);
      setIsSearchOpen(false);
    }
  };

  const selectLocation = (location) => {
    const locationName =
      typeof location === "string"
        ? location
        : `${location.name}, ${location.country}`;
    dispatch(setLocation(locationName));
    setSearchInput("");
    setShowSuggestions(false);
    setIsSearchOpen(false);
  };

  const saveToFavorites = () => {
    dispatch(addToFavorites(location));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    {
      name: "Current",
      slug: "current",
      action: () => dispatch(setViewMode("current")),
    },
    {
      name: "Forecast",
      slug: "forecast",
      action: () => dispatch(setViewMode("forecast")),
    },
    {
      name: "Historical",
      slug: "historical",
      action: () => dispatch(setViewMode("historical")),
    },
    {
      name: "Air Quality",
      slug: "airquality",
      action: () => dispatch(setViewMode("airquality")),
    },
    {
      name: "Astronomy",
      slug: "astronomy",
      action: () => dispatch(setViewMode("astronomy")),
    },
    { name: "Map", slug: "map", action: () => dispatch(setViewMode("map")) }, // Added map navigation option
  ];

  return (
    <header
      style={{ zIndex: 9999999 }}
      className="sticky top-0 w-full backdrop-blur-lg bg-white/75 dark:bg-gray-900/75 shadow-sm"
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="text-primary-500 dark:text-primary-400"
          >
            <Sun size={28} />
          </motion.div>
          <div className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Weather<span className="text-primary-500">Plus</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={item.action}
              className={`px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${viewMode == item?.slug ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Search button/form */}
          <div className="relative" ref={searchRef}>
            {isSearchOpen ? (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "250px", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex items-center"
                onSubmit={handleSearch}
              >
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setShowSuggestions(e.target.value.length > 2);
                  }}
                  className="input w-full rounded-r-none border-r-0 focus:outline-none focus:ring-0 focus:border-0 focus:shadow-none"
                  placeholder="Search location..."
                  autoFocus
                />
                <button
                  type="submit"
                  className="h-10 px-3 rounded-l-none rounded-r-md border border-input bg-background hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Search size={16} />
                </button>
                {/* Location suggestions */}
                {showSuggestions && (
                  <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border z-50 max-h-60 overflow-auto">
                    {isLoading && (
                      <div className="p-2 text-sm text-gray-500">
                        Loading...
                      </div>
                    )}
                    {searchResults?.length === 0 && !isLoading && (
                      <div className="p-2 text-sm text-gray-500">
                        No locations found
                      </div>
                    )}
                    {searchResults?.map((result) => (
                      <button
                        key={`${result.id}-${result.name}`}
                        onClick={() => selectLocation(result)}
                        className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                      >
                        <MapPin size={14} />
                        <span>
                          {result.name}, {result.country}
                        </span>
                      </button>
                    ))}
                    {/* Recent searches */}
                    {recentSearches.length > 0 && (
                      <div className="border-t">
                        <div className="text-xs font-medium px-3 py-1 text-gray-500">
                          Recent Searches
                        </div>
                        {recentSearches.map((place, index) => (
                          <button
                            key={`recent-${index}`}
                            onClick={() => selectLocation(place)}
                            className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-sm"
                          >
                            <Clock size={14} />
                            <span>{place}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.form>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Search size={20} />
              </button>
            )}
          </div>

          {/* Favorites button */}
          <button
            onClick={saveToFavorites}
            className={`p-2 rounded-md ${
              favorites.includes(location)
                ? "text-yellow-500"
                : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={
              favorites.includes(location)
                ? "Saved to favorites"
                : "Add to favorites"
            }
          >
            <Star
              size={20}
              className={favorites.includes(location) ? "fill-yellow-500" : ""}
            />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  item.action();
                  setIsMobileMenuOpen(false);
                }}
                className="text-left py-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors px-2 rounded-md"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
