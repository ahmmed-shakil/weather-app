// src/components/weather/LeafletMap.jsx
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatTemperature } from "../../lib/utils";

// Fix for marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center]);
  return null;
}

export default function LeafletMap({ weather, unit, center }) {
  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={center} />
      {weather && (
        <Marker position={[weather.location.lat, weather.location.lon]}>
          <Popup>
            <div className="p-2">
              <div className="font-semibold">{weather.location.name}</div>
              <div className="flex items-center mt-1">
                <img
                  src={weather.current.condition.icon}
                  alt={weather.current.condition.text}
                  className="w-10 h-10 mr-1"
                />
                <span className="text-lg font-medium">
                  {formatTemperature(
                    unit === "c"
                      ? weather.current.temp_c
                      : weather.current.temp_f,
                    unit
                  )}
                </span>
              </div>
              <div className="text-sm mt-1">
                {weather.current.condition.text}
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
