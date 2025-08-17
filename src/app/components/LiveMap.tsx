"use client";

import React, { useEffect, useState } from "react";
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

export default function LiveMap() {
    const [center, setCenter] = useState<[number, number] | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setCenter([pos.coords.latitude, pos.coords.longitude]);
                },
                () => {
                    setError("Location access denied.");
                }
            );
        } else {
            setError("Geolocation not supported by this browser.");
        }
    }, []);

    if (error) {
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontSize: "1.2rem",
                }}
            >
                {error}
            </div>
        );
    }

    if (!center) {
        return (
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.05)",
                    color: "white",
                    fontSize: "1.2rem",
                }}
            >
                Locating...
            </div>
        );
    }

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100%", width: "100%", borderRadius: 12 }}
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={center}>
                <Popup>You are here</Popup>
            </Marker>
        </MapContainer>
    );
}
