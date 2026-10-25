import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, MapPin, AlertCircle } from "lucide-react";
import { getPlaces } from "../lib/api";
import { distanceMeters } from "../lib/geo";
import PlaceCard from "../components/PlaceCard";
import { PlaceCardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import BottomNav from "../components/BottomNav";

export default function Places() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPlaces();
      setPlaces(data);
    } catch {
      setError("Could not load places. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
    );
  }, [load]);

  function getDistance(place) {
    if (!userLocation || !place.lat) return null;
    return distanceMeters(userLocation, { lat: place.lat, lng: place.lng });
  }

  const sorted = [...places].sort((a, b) => {
    if (!userLocation) return 0;
    return getDistance(a) - getDistance(b);
  });

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8]">
      <header
        className="sticky top-0 z-10 border-b border-amber-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Katha</h1>
          <button
            onClick={load}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-3">
        {userLocation && (
          <p className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Sorted by distance from you
          </p>
        )}

        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <PlaceCardSkeleton key={i} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-300" />
            <p className="text-gray-500">{error}</p>
            <button
              onClick={load}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <EmptyState
            icon={MapPin}
            message="No places yet. Be the first to mark a spot!"
            action="Add a place"
            onAction={() => navigate("/place/new")}
          />
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                distanceMeters={getDistance(place)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
