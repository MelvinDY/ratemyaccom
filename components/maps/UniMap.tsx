'use client';

import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import type { LatLngBoundsExpression } from 'leaflet';
import { useRouter } from 'next/navigation';
import 'leaflet/dist/leaflet.css';

export interface MapUni {
  id: string;
  abbr: string;
  lat: number;
  lng: number;
  rating: number;
}

interface Props {
  unis: MapUni[];
  bounds: LatLngBoundsExpression;
  visibleIds: Set<string>;
  hoverId: string | null;
  onHover: (id: string | null) => void;
}

const BLUE = '#0C06F7';
const INK = '#0A0A0F';

/**
 * Editorial-styled Leaflet map. Light CartoDB "Positron" basemap (free, no API
 * key) with university campuses as blue circle markers. Hover syncs with the
 * list via onHover; clicking a marker filters Browse to that university.
 */
export default function UniMap({ unis, bounds, visibleIds, hoverId, onHover }: Props) {
  const router = useRouter();

  return (
    <MapContainer
      bounds={bounds}
      scrollWheelZoom={false}
      zoomControl
      style={{ width: '100%', height: '100%', background: '#fff' }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      {unis.map((u) => {
        const vis = visibleIds.has(u.id);
        const hi = hoverId === u.id;
        return (
          <CircleMarker
            key={u.id}
            center={[u.lat, u.lng]}
            radius={hi ? 9 : 6}
            pathOptions={{
              color: vis ? BLUE : INK,
              weight: hi ? 3 : 2,
              opacity: vis ? 1 : 0.3,
              fillColor: hi ? BLUE : '#ffffff',
              fillOpacity: vis ? 1 : 0.2,
            }}
            eventHandlers={{
              mouseover: () => onHover(u.id),
              mouseout: () => onHover(null),
              click: () => router.push(`/browse?university=${u.abbr}`),
            }}
          >
            <Tooltip
              permanent
              direction="top"
              offset={[0, -6]}
              className={`uniMapTip${hi ? ' uniMapTipHi' : ''}${vis ? '' : ' uniMapTipDim'}`}
            >
              {u.abbr} · {u.rating}★
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
