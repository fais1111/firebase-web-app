'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// This is a workaround for a known issue with react-leaflet and Next.js App Router.
// It ensures that the marker icons are loaded correctly.
const icon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface SafeZone {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  details: string;
}

interface SafeZonesMapProps {
  safeZones: SafeZone[];
}

function ChangeView({ center, zoom }: { center: L.LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function SafeZonesMap({ safeZones }: SafeZonesMapProps) {
  if (!safeZones || safeZones.length === 0) {
    return <p className="text-center text-muted-foreground p-4">No safe zones available to display on the map.</p>;
  }

  const center: L.LatLngExpression = [safeZones[0].latitude, safeZones[0].longitude];
  
  return (
    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} className="rounded-lg border">
      <ChangeView center={center} zoom={10} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {safeZones.map((zone) => (
        <Marker key={zone.id} position={[zone.latitude, zone.longitude]} icon={icon}>
          <Popup>
            <h4 className="font-bold">{zone.name}</h4>
            <p>{zone.details}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
