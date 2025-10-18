import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { getLocation } from './api/getLocation';
import { getPlaces } from './api/getPlaces';
import { savePlaces, getSavedPlaces } from './storage/idb';
import './index.css';
import L from 'leaflet';
import MyMap from './components/MyMap';

function App() {
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  const detailRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const position = await getLocation();
        if (!position) return;

        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        const data = await getPlaces(latitude, longitude);
        setPlaces(data);
        await savePlaces(data);
      } catch {
        const cached = await getSavedPlaces();
        setPlaces(cached);
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    // Suivi en temps réel
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);
        if (mapRef.current) {
          mapRef.current.setView([latitude, longitude], 16, { animate: true });
        }
      },
      (error) => console.error('Erreur géolocalisation :', error),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handlePlaceClick = (place: any) => {
    setSelectedPlace(place);
    setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleLocateMe = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 16, { animate: true });
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p className="loading-text">Chargement des lieux...</p>
      </div>
    );
  }

  const filteredPlaces = places.filter((p) =>
    p.display_name.toLowerCase().includes(search.toLowerCase())
  );

  const getEmoji = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('cafe') || lower.includes('coffee')) return '☕';
    if (lower.includes('bar') || lower.includes('pub')) return '🍸';
    if (lower.includes('restaurant') || lower.includes('food')) return '🍽️';
    return '📍';
  };

  const defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const userIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>GoNow 🗺️</h1>

      <button
        onClick={handleLocateMe}
        style={{
          marginBottom: '12px',
          padding: '8px 12px',
          borderRadius: '8px',
          border: 'none',
          backgroundColor: '#3b82f6',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        📍 Localiser moi
      </button>

      <input
        className="search-input"
        type="text"
        placeholder="Rechercher un lieu..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredPlaces.map((p) => (
        <div key={p.place_id} className="place-card" onClick={() => handlePlaceClick(p)}>
          <span>{getEmoji(p.display_name)}</span>
          {p.display_name}
        </div>
      ))}

      {!filteredPlaces.length && (
        <p style={{ textAlign: 'center', color: '#6b7280', fontStyle: 'italic' }}>
          Aucun lieu trouvé.
        </p>
      )}

      {selectedPlace && (
        <div className="place-detail" ref={detailRef}>
          <h2>{selectedPlace.display_name}</h2>
          <p>Latitude : {selectedPlace.lat}</p>
          <p>Longitude : {selectedPlace.lon}</p>
          <button onClick={() => setSelectedPlace(null)}>Fermer</button>

          <MapContainer
            center={[parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lon)]}
            zoom={16}
            style={{ height: '400px', width: '100%', marginTop: '16px' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            <MyMap
              selectedPlace={selectedPlace}
              userLocation={userLocation}
              mapRef={mapRef}
              defaultIcon={defaultIcon}
              userIcon={userIcon}
            />
          </MapContainer>
        </div>
      )}

      <footer>© {new Date().getFullYear()} GoNow</footer>
    </div>
  );
}

export default App;
 