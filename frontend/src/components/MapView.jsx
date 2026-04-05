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
  map.setView(center, 13);
  return null;
};

const MapView = ({ truck }) => {
  if (!truck) return null;

  // 🔥 SAFE DECODE
  let routePoints = [];
  try {
    routePoints =
      truck.polyline && truck.polyline.length > 0
        ? polyline.decode(truck.polyline)
        : [];
  } catch (e) {
    console.error("Polyline decode error:", e);
    routePoints = [];
  }

  console.log("RAW:", truck.polyline);
  console.log("DECODED:", routePoints);

  const currentPosition = truck.lastLocation || [28.8571, 76.827];

  return (
    <div className="w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
      <MapContainer
        center={currentPosition}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={currentPosition} />

        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />

        {/* ROUTE FIXED */}
        {routePoints && routePoints.length > 1 && (
          <Polyline
            positions={routePoints.map(([lat, lng]) => [lat, lng])}
            color="#ff0000" // 🔥 force visible red
            weight={6}
          />
        )}

        {/* Truck */}
        <Marker position={currentPosition} icon={truckIcon}>
          <Popup>
            <b>{truck.id}</b>
            <br />
            Driver: {truck.driver}
            <br />
            Risk: {truck.risk}%
          </Popup>
        </Marker>

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
