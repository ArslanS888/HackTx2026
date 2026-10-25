// Haversine formula — returns distance in meters between two lat/lng points
export function distanceMeters(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function distanceMiles(a, b) {
  return distanceMeters(a, b) / 1609.344;
}

// Returns true if userPos is within the place's radius
export function isWithinRadius(userPos, place) {
  if (!userPos || !place.lat || !place.lng) return false;
  const d = distanceMeters(userPos, { lat: place.lat, lng: place.lng });
  return d <= (place.radius_meters ?? 50);
}

// Human-readable distance string
export function formatDistance(meters) {
  if (meters < 50) return "< 50 m";
  if (meters < 1000) return `${Math.round(meters)} m`;
  const km = meters / 1000;
  return km < 10 ? `${km.toFixed(1)} km` : `${Math.round(km)} km`;
}
