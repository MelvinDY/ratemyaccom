'use client';

import { useEffect, useState } from 'react';
import { MapPin, GraduationCap, Navigation } from 'lucide-react';

// University campus coordinates
const CAMPUS_COORDINATES: Record<
  string,
  { lat: number; lng: number; name: string; shortName: string }
> = {
  'University of New South Wales (UNSW)': {
    lat: -33.9173,
    lng: 151.2313,
    name: 'UNSW Sydney (Kensington)',
    shortName: 'UNSW',
  },
  'University of Sydney': {
    lat: -33.8888,
    lng: 151.1872,
    name: 'University of Sydney (Camperdown)',
    shortName: 'USYD',
  },
  'University of Technology Sydney (UTS)': {
    lat: -33.8833,
    lng: 151.2,
    name: 'UTS Sydney (Ultimo)',
    shortName: 'UTS',
  },
  'Macquarie University': {
    lat: -33.7738,
    lng: 151.1126,
    name: 'Macquarie University (North Ryde)',
    shortName: 'MQ',
  },
  'Western Sydney University': {
    lat: -33.756,
    lng: 150.754,
    name: 'WSU Penrith Campus',
    shortName: 'WSU',
  },
};

interface LocationMapProps {
  accommodationName: string;
  university: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  distanceToCampus: number;
}

export default function LocationMap({
  accommodationName,
  university,
  address,
  suburb,
  state,
  postcode,
  coordinates,
  distanceToCampus,
}: LocationMapProps) {
  const [Map, setMap] = useState<React.ComponentType<Record<string, never>> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const campusInfo = CAMPUS_COORDINATES[university];
  // Fallback to campus if no coords, then to Sydney default
  const defaultCoords = { lat: -33.8688, lng: 151.2093 }; // Sydney CBD
  const accommodationCoords = coordinates ?? campusInfo ?? defaultCoords;

  useEffect(() => {
    // Dynamically import Leaflet components (client-side only)
    const loadMap = async () => {
      const L = await import('leaflet');
      const { MapContainer, TileLayer, Marker, Popup, Polyline } = await import('react-leaflet');

      // Fix for default marker icons in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Custom markers
      const accommodationIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const campusIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      // Calculate center and bounds
      const center: [number, number] = campusInfo
        ? [
            (accommodationCoords.lat + campusInfo.lat) / 2,
            (accommodationCoords.lng + campusInfo.lng) / 2,
          ]
        : [accommodationCoords.lat, accommodationCoords.lng];

      // Create the map component
      const MapComponent = () => (
        <MapContainer
          center={center}
          zoom={14}
          style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Accommodation Marker */}
          <Marker
            position={[accommodationCoords.lat, accommodationCoords.lng]}
            icon={accommodationIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-purple-600">{accommodationName}</strong>
                <br />
                <span className="text-sm text-gray-600">{address}</span>
                <br />
                <span className="text-sm text-gray-600">
                  {suburb}, {state} {postcode}
                </span>
              </div>
            </Popup>
          </Marker>

          {/* Campus Marker */}
          {campusInfo && (
            <Marker position={[campusInfo.lat, campusInfo.lng]} icon={campusIcon}>
              <Popup>
                <div className="text-center">
                  <strong className="text-blue-600">{campusInfo.name}</strong>
                  <br />
                  <span className="text-sm text-gray-600">Main Campus</span>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Line connecting accommodation to campus */}
          {campusInfo && (
            <Polyline
              positions={[
                [accommodationCoords.lat, accommodationCoords.lng],
                [campusInfo.lat, campusInfo.lng],
              ]}
              color="#9E48FE"
              weight={3}
              opacity={0.7}
              dashArray="10, 10"
            />
          )}
        </MapContainer>
      );

      setMap(() => MapComponent);
      setIsLoaded(true);
    };

    loadMap();
  }, [accommodationName, address, suburb, state, postcode, accommodationCoords, campusInfo]);

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
      <h2 className="text-2xl font-bold bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent mb-4">
        Location
      </h2>

      {/* Address Info */}
      <div className="mb-4 space-y-2">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-lyra-purple-start mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">{accommodationName}</p>
            <p className="text-white/60 text-sm">{address}</p>
            <p className="text-white/60 text-sm">
              {suburb}, {state} {postcode}
            </p>
          </div>
        </div>

        {campusInfo && (
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white font-medium">{campusInfo.name}</p>
              <p className="text-white/60 text-sm">University Campus</p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Navigation className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-white">
            <span className="font-semibold">{distanceToCampus}km</span>
            <span className="text-white/60"> to campus</span>
          </p>
        </div>
      </div>

      {/* Map Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span className="text-white/70">Accommodation</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-white/70">Campus</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-charcoal-light">
        {!isLoaded ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-pulse text-white/40">Loading map...</div>
          </div>
        ) : (
          Map && <Map />
        )}
      </div>

      {/* Directions Link */}
      <a
        href={`https://www.google.com/maps/dir/?api=1&destination=${accommodationCoords.lat},${accommodationCoords.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/20 text-white py-2 px-4 rounded-lg transition-colors"
      >
        <Navigation className="w-4 h-4" />
        Get Directions
      </a>
    </div>
  );
}
