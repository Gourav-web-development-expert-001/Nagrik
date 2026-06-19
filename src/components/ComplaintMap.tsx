'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IGrievance } from '@/lib/models';

interface IMapProps {
  grievances?: IGrievance[];
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  visitMode?: boolean;
  visitCoords?: { lat: number; lng: number } | null;
  visitRadius?: number; // in meters
}

// Map Click Listener for Citizen portal location picker
function MapEventsHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

// Center/Fly Map Handler when location changes
function MapRecenter({ coords }: { coords: { lat: number; lng: number } | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], 14, { animate: true });
    }
  }, [coords, map]);
  return null;
}

// Custom color-coded SVG markers
const createMarkerIcon = (color: string) => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-6 w-6 animate-ping rounded-full opacity-40" style="background-color: ${color};"></span>
        <span class="relative inline-flex h-4 w-4 rounded-full border-2 border-white shadow-md" style="background-color: ${color};"></span>
      </div>
    `,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10]
  });
};

const getStatusColor = (status: string, priority: string, isCritical: boolean): string => {
  if (status === 'Resolved') return '#10b981'; // Green
  if (isCritical || priority === 'Urgent') return '#ef4444'; // Red
  if (status === 'Reopened' || priority === 'High') return '#f59e0b'; // Amber
  return '#3b82f6'; // Blue for pending/medium
};

export default function ComplaintMap({
  grievances = [],
  selectedLocation = null,
  onLocationSelect,
  visitMode = false,
  visitCoords = null,
  visitRadius = 2000
}: IMapProps) {
  
  const defaultCenter = { lat: 28.6139, lng: 77.2090 }; // Delhi CP
  const activeCenter = selectedLocation || visitCoords || defaultCenter;

  return (
    <div className="w-full h-full relative border border-border-color rounded-lg overflow-hidden bg-[#e5e7eb] dark:bg-slate-900 shadow-inner">
      <MapContainer
        center={[activeCenter.lat, activeCenter.lng]}
        zoom={11}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Dynamic Recenter */}
        {(selectedLocation || visitCoords) && <MapRecenter coords={selectedLocation || visitCoords} />}

        {/* Location Picker Handler */}
        {onLocationSelect && <MapEventsHandler onLocationSelect={onLocationSelect} />}

        {/* Citizen Selected Location Pin */}
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={createMarkerIcon('#0B3B82')}>
            <Popup>
              <div className="text-xs font-semibold text-[#0B3B82]">
                Selected Grievance Location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Complaint Markers */}
        {!onLocationSelect && grievances.map((g) => {
          const id = String(g.id || g._id);
          const color = getStatusColor(g.status, g.priority, g.isCriticalAlert);
          
          return (
            <Marker
              key={id}
              position={[g.location.lat, g.location.lng]}
              icon={createMarkerIcon(color)}
            >
              <Popup>
                <div className="p-1 max-w-[200px] text-xs">
                  <div className="font-bold text-slate-800 mb-1 border-b pb-1 flex justify-between items-center gap-2">
                    <span className="truncate">{g.category}</span>
                    <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase ${
                      g.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                      g.status === 'Reopened' ? 'bg-orange-100 text-orange-800' :
                      g.isCriticalAlert ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-900 line-clamp-2 mb-1">{g.title}</p>
                  <div className="text-[10px] text-slate-500 font-medium">
                    <div>Dist: {g.citizen.district}</div>
                    <div>Priority: <span className="font-semibold uppercase">{g.priority}</span></div>
                    {g.isCriticalAlert && <div className="text-red-600 font-bold uppercase text-[9px] mt-0.5">⚠️ CRITICAL ALERT</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* CM Visit Intelligence Circle Highlight */}
        {visitMode && visitCoords && (
          <>
            <Marker position={[visitCoords.lat, visitCoords.lng]} icon={createMarkerIcon('#ef4444')}>
              <Popup>
                <div className="text-xs font-bold text-red-600">
                  CM Visit Inspection Spot
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[visitCoords.lat, visitCoords.lng]}
              pathOptions={{ fillColor: '#ef4444', color: '#ef4444', weight: 1.5, fillOpacity: 0.15 }}
              radius={visitRadius}
            />
          </>
        )}
      </MapContainer>

      {/* Map Legend (Overlay) */}
      {!onLocationSelect && (
        <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-950 p-2.5 rounded-md shadow-lg border border-border-color text-[10px] z-[40] font-semibold flex flex-col gap-1.5 min-w-[110px]">
          <div className="text-slate-500 dark:text-slate-400 border-b pb-1 uppercase font-bold tracking-wider">Status Index</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical / Urgent</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High / Reopened</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Pending / Med</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</div>
        </div>
      )}
    </div>
  );
}
