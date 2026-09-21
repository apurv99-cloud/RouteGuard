import React from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import "leaflet/dist/leaflet.css";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const truckIcon = new L.DivIcon({
  html: `<div class="bg-brand-deep p-1.5 rounded-lg border-2 border-white shadow-xl flex items-center justify-center transform rotate-45">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" stroke="#EFF6E0" stroke-width="3"><circle cx="12" cy="12" r="6"/></svg>
      </div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const ChangeView = ({ center }) => {
  const map = useMap();
  if (center) {
    map.setView(center, 13);
  }
  return null;
};

const MapView = ({ truck }) => {
  if (!truck) return null;

  let routePoints = [];
  try {
    if (truck.polyline && truck.polyline.length > 0) {
      const rawPoints = truck.polyline.split("|");
      const parsedRawPoints = rawPoints.map((point) => {
        const [latitude, longitude] = point.split(",").map(Number);
        return [latitude, longitude];
      });
      const isRawRoute = rawPoints.length > 1
        && parsedRawPoints.every(([latitude, longitude]) =>
          Number.isFinite(latitude) && Number.isFinite(longitude)
        );

      if (isRawRoute) {
        routePoints = parsedRawPoints;
      } else {
        routePoints = polyline.decode(truck.polyline);
      }
    }
  } catch (e) {
    console.error("Polyline decode error:", e);
    routePoints = [];
  }

  const currentPosition = truck.lastLocation || routePoints[0] || truck.origin;

  if (!currentPosition) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-brand-lightest flex items-center justify-center text-brand-steel">
        No route or GPS position available
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-xl relative">
      <MapContainer
        center={currentPosition}
        zoom={13}
        style={{ height: "100%", width: "100%", minHeight: "500px", zIndex: 1 }}
      >
        <ChangeView center={currentPosition} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ROUTE FIXED */}
        {routePoints && routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map(([lat, lng]) => [lat, lng])}
            color="#ff0000" // 🔥 force visible red
            weight={6}
          />
        )}

        {/* Truck */}
        {currentPosition && (
          <Marker position={currentPosition} icon={truckIcon}>
          <Popup>
            <b>{truck.id}</b>
            <br />
            Driver: {truck.driver}
            <br />
            Risk: {truck.riskLevel || "Unavailable"}
            <br />
            Deviation: {truck.deviating ? "DEVIATED" : "ON ROUTE"}
            <br />
            Distance from route: {truck.distanceFromRoute != null
              ? `${truck.distanceFromRoute.toFixed(1)} m`
              : "Unavailable"}
            <br />
            Speed: {truck.speedKmh != null
              ? `${truck.speedKmh.toFixed(2)} km/h`
              : "Unavailable"}
          </Popup>
          </Marker>
        )}

        {/* Destination */}
        {truck.destination && (
          <Marker position={truck.destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
