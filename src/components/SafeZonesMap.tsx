
'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issues in React-Leaflet with Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
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

const SafeZonesMap: React.FC<SafeZonesMapProps> = ({ safeZones }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Initialize map only if the ref is set and map is not already initialized
    if (mapRef.current && !mapInstanceRef.current) {
      const defaultCenter: L.LatLngExpression = [6.9271, 79.8612];
      
      const map = L.map(mapRef.current).setView(defaultCenter, 7);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    // Add/update markers when safeZones data changes
    if (mapInstanceRef.current && safeZones) {
        // Clear existing markers
        mapInstanceRef.current.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                mapInstanceRef.current?.removeLayer(layer);
            }
        });

        if (safeZones.length > 0) {
            const markers = safeZones.map(zone => {
                const marker = L.marker([zone.latitude, zone.longitude]);
                marker.bindPopup(`<b>${zone.name}</b><br>${zone.details}`);
                return marker;
            });
            
            const featureGroup = L.featureGroup(markers).addTo(mapInstanceRef.current);
            if(featureGroup.getBounds().isValid()){
              mapInstanceRef.current.fitBounds(featureGroup.getBounds().pad(0.1));
            }

        }
    }
    
    // Cleanup function to destroy the map instance
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [safeZones]);

  if (safeZones && safeZones.length === 0) {
     return (
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-lg border">
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                <p className="text-center text-muted-foreground p-4">No safe zones available to display on the map.</p>
            </div>
        </div>
     )
  }

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-lg border" />;
};

export default SafeZonesMap;
