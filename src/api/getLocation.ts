export async function getLocation(): Promise<GeolocationPosition | null> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('La géolocalisation n’est pas supportée');
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, () =>
      reject('Impossible d’obtenir la position')
    );
  });
}
