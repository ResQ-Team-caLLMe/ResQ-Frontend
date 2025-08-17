// components/LiveMap.tsx
import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x.src ?? markerIcon2x,
    iconUrl: markerIcon.src ?? markerIcon,
    shadowUrl: markerShadow.src ?? markerShadow,
});

const positions = [
    { lat: 51.505, lng: -0.09, label: "Emergency Call" },
    { lat: 51.515, lng: -0.1, label: "Emergency Call" },
];

export default function LiveMap() {
    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%", borderRadius: 12 }}>
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {positions.map((pos, idx) => (
                <Marker position={[pos.lat, pos.lng]} key={idx}>
                    <Popup>{pos.label}</Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
