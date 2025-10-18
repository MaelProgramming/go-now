// src/api/getPlaces.ts
const API_KEY = "50d0f6f245034735a2ce675cacc2b0b9";

export async function getPlaces(
  lat: number,
  lon: number,
  category = "catering.cafe"
) {
  const radius = 1000; // rayon en mètres
  const limit = 10;

  const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&limit=${limit}&apiKey=${API_KEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur API Geoapify");
    const data = await res.json();

    return data.features.map((f: any) => ({
      place_id: f.properties.place_id,
      display_name: f.properties.name || f.properties.address_line1 || "Lieu",
      lat: f.properties.lat,
      lon: f.properties.lon,
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
}
