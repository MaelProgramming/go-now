import { useEffect } from 'react';
import type {  FC  } from 'react' 
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface MyMapProps {
  selectedPlace: any;
  userLocation: [number, number] | null;
  mapRef: React.MutableRefObject<any>;
  defaultIcon: L.Icon;
  userIcon: L.Icon;
}

const MyMap: FC<MyMapProps> = ({ selectedPlace, userLocation, mapRef, defaultIcon, userIcon }) => {
  const map = useMap();

  // On assigne la ref à la carte
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);

  return (
    <>
      {/* Marqueur de l'utilisateur */}
      {userLocation && (
        <Marker position={userLocation} icon={userIcon}>
          <Popup>Moi</Popup>
        </Marker>
      )}

      {/* Marqueur du lieu sélectionné */}
      {selectedPlace && (
        <Marker
          position={[parseFloat(selectedPlace.lat), parseFloat(selectedPlace.lon)]}
          icon={defaultIcon}
        >
          <Popup>{selectedPlace.display_name}</Popup>
        </Marker>
      )}
    </>
  );
};

export default MyMap;
