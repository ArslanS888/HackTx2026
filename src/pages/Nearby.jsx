import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, MapPin, AlertCircle } from "lucide-react";
import { getUpcomingEvents } from "../lib/api";
import { distanceMiles } from "../lib/format";
import EventCard from "../components/EventCard";
import { EventCardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import CategoryChip, { CATEGORIES } from "../components/CategoryChip";
import BottomNav from "../components/BottomNav";

export default function Nearby() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("all");
  const [userLocation, setUserLocation] = useState(null);
  const [sort, setSort] = useState("soonest");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getUpcomingEvents();
      setEvents(data);
    } catch {
      setError("Could not load events. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    navigator.geolocation?.getCurrentPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {}, // silently ignore denial
    );
  }, [load]);

  const filtered = events.filter(
    (e) => category === "all" || e.category === category,
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "closest" && userLocation && a.lat && b.lat) {
      return (
        distanceMiles(userLocation, { lat: a.lat, lng: a.lng }) -
        distanceMiles(userLocation, { lat: b.lat, lng: b.lng })
      );
    }
    return new Date(a.starts_at) - new Date(b.starts_at);
  });

  function getDistance(event) {
    if (!userLocation || !event.lat) return null;
    const d = distanceMiles(userLocation, { lat: event.lat, lng: event.lng });
    return d < 0.1 ? "< 0.1 mi" : `${d.toFixed(1)} mi`;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Nearby</h1>
          <div className="flex items-center gap-2">
            {userLocation && (
              <button
                onClick={() =>
                  setSort((s) => (s === "soonest" ? "closest" : "soonest"))
                }
                className="flex items-center gap-1 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-600"
              >
                <MapPin className="h-3.5 w-3.5" />
                {sort === "soonest" ? "Soonest" : "Closest"}
              </button>
            )}
            <button
              onClick={load}
              className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="sticky top-[57px] z-10 bg-white px-4 pb-2 shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-none">
            <button
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                category === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                className="shrink-0"
                onClick={() => setCategory(cat === category ? "all" : cat)}
              >
                <CategoryChip
                  category={cat}
                  selected={category === cat}
                  onClick={() => {}}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <EventCardSkeleton key={i} />
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
            message="Nothing happening yet — start something!"
            action="Post an event"
            onAction={() => navigate("/create")}
          />
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-3">
            {sorted.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                distanceText={getDistance(event)}
              />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
