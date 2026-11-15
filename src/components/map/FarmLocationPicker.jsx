import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, AlertCircle, Layers } from 'lucide-react';

const pinIcon = L.divIcon({
  html: `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 2C8.82 2 3 7.82 3 15c0 9.75 13 23 13 23s13-13.25 13-23c0-7.18-5.82-13-13-13z" fill="#B5E61D" stroke="#061426" stroke-width="2.5"/>
      <circle cx="16" cy="15" r="5.5" fill="#061426"/>
    </svg>
  `,
  className: 'agrovision-picker-pin',
  iconSize: [32, 40],
  iconAnchor: [16, 38]
});

function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  if (!position) return null;
  const [lat, lng] = position;
  const poly = [
    [lat + 0.0015, lng - 0.0018],
    [lat + 0.0015, lng + 0.0018],
    [lat - 0.0015, lng + 0.0018],
    [lat - 0.0015, lng - 0.0018]
  ];
  return (
    <>
      <Polygon positions={poly} pathOptions={{ color: '#B5E61D', weight: 2, fillColor: '#38A832', fillOpacity: 0.35 }} />
      <Marker position={position} icon={pinIcon} />
    </>
  );
}

function MapCenterController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function FarmLocationPicker({
  latitude,
  longitude,
  onLocationChange
}) {
  const [currentPos, setCurrentPos] = useState(
    latitude && longitude ? [latitude, longitude] : [23.2324, 87.8615]
  );
  const [zoomLevel, setZoomLevel] = useState(11);
  const [mapMode, setMapMode] = useState('satellite');
  const [geoError, setGeoError] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);

  useEffect(() => {
    if (latitude && longitude) {
      setCurrentPos([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const handleSelect = (lat, lng) => {
    const fixedLat = parseFloat(lat.toFixed(5));
    const fixedLng = parseFloat(lng.toFixed(5));
    setCurrentPos([fixedLat, fixedLng]);
    onLocationChange(fixedLat, fixedLng);
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('GPS Geolocation is not supported by your current browser.');
      return;
    }
    setIsDetecting(true);
    setGeoError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        handleSelect(pos.coords.latitude, pos.coords.longitude);
        setZoomLevel(14);
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          setGeoError('Location permission was denied. Tap directly on the interactive map to place your farm pin.');
        } else {
          setGeoError('Unable to retrieve GPS signal. Select your farm location manually on the map.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const quickJump = (lat, lng) => {
    handleSelect(lat, lng);
    setZoomLevel(13);
  };

  const tileUrl =
    mapMode === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="btn btn-sm btn-primary"
          >
            <Navigation size={14} />
            <span>{isDetecting ? 'Detecting GPS...' : 'Detect My Location'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMapMode(mapMode === 'satellite' ? 'street' : 'satellite')}
            className="btn btn-sm btn-secondary"
          >
            <Layers size={14} />
            <span>{mapMode === 'satellite' ? 'Switch to Street View' : 'Switch to Satellite View'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1" style={{ fontSize: '0.75rem' }}>
          <span style={{ color: 'var(--color-text-muted)', fontWeight: 600 }}>Quick Jump:</span>
          <button type="button" onClick={() => quickJump(23.2324, 87.8615)} className="btn btn-sm btn-ghost">
            Burdwan
          </button>
          <button type="button" onClick={() => quickJump(22.8126, 88.2312)} className="btn btn-sm btn-ghost">
            Hooghly
          </button>
          <button type="button" onClick={() => quickJump(22.1648, 88.8062)} className="btn btn-sm btn-ghost">
            Gosaba
          </button>
        </div>
      </div>

      {geoError && (
        <div className="alert-strip alert-strip-warning" style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem', margin: 0 }}>
          <AlertCircle size={15} style={{ flexShrink: 0 }} />
          <span>{geoError}</span>
        </div>
      )}

      <div style={{ height: '360px', width: '100%', position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--color-border-dark)' }}>
        <MapContainer
          center={currentPos}
          zoom={zoomLevel}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            key={mapMode}
            attribution='&copy; Esri & OpenStreetMap contributors'
            url={tileUrl}
          />
          <LocationMarker position={currentPos} onLocationSelect={handleSelect} />
          <MapCenterController center={currentPos} zoom={zoomLevel} />
        </MapContainer>
      </div>

      <div className="flex items-center justify-between" style={{ background: 'rgba(6, 20, 38, 0.85)', padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', fontSize: '0.82rem' }}>
        <div className="flex items-center gap-1 tabular-nums" style={{ color: 'var(--color-lime-green)', fontWeight: 600 }}>
          <MapPin size={15} />
          <span>Selected Coordinates: {currentPos[0]}° N, {currentPos[1]}° E</span>
        </div>
        <span style={{ color: 'var(--color-bright-cyan)', fontWeight: 600 }}>
          West Bengal, India
        </span>
      </div>
    </div>
  );
}
