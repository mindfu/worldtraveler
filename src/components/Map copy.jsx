import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styles from './Map.module.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useCities } from '../contexts/CitiesContext';

export default function Map() {
  // const navigate = useNavigate();
  const { cities } = useCities();
  const [mapPosition] = useState([51.505, -0.09]);
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  if (lat && lng) {
    mapPosition[0] = parseFloat(lat);
    mapPosition[1] = parseFloat(lng);
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={[lat, lng]}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />
        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji}</span>
              {city.cityName}
            </Popup>
          </Marker>
        ))}
        {/* <ChangeCenter position={[lat, lng]} /> */}
      </MapContainer>
    </div>
  );
}

// function ChangeCenter({ position }) {
//   const map = useMap().setView(position);
//   console.log(map);
//   return null;
// }
