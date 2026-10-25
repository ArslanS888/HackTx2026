import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, AlertCircle, RefreshCw } from "lucide-react";
import { getPlace, getNotesAtPlace } from "../lib/api";
import { distanceMeters, isWithinRadius } from "../lib/geo";
import NoteCard from "../components/NoteCard";
import { NoteCardSkeleton } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";
import LocationStatus from "../components/LocationStatus";
import BottomNav from "../components/BottomNav";

export default function PlaceBoard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [place, setPlace] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { timeout: 8000 },
    );
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [p, n] = await Promise.all([getPlace(id), getNotesAtPlace(id)]);
      setPlace(p);
      setNotes(n);
    } catch {
      setError("Could not load this place.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const dist = place && userLocation
    ? distanceMeters(userLocation, { lat: place.lat, lng: place.lng })
    : null;

  const atPlace = place ? isWithinRadius(userLocation, place) : false;

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8]">
      <header
        className="sticky top-0 z-10 border-b border-amber-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="truncate text-base font-bold text-gray-900">
              {place?.name ?? "Loading…"}
            </h1>
          </div>
          <button onClick={load} className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="sticky top-[57px] z-10 bg-white px-4 py-2 shadow-sm">
        <div className="mx-auto max-w-md flex items-center justify-between gap-3">
          <LocationStatus
            isAtPlace={atPlace}
            distanceMeters={dist}
            loading={locLoading}
          />
          {atPlace && (
            <button
              onClick={() => navigate(`/place/${id}/note/new`)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shrink-0"
            >
              <PenLine className="h-4 w-4" />
              Leave a note
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pb-28 pt-3">
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <NoteCardSkeleton key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="mt-8 flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-red-300" />
            <p className="text-gray-500">{error}</p>
            <button onClick={load} className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && notes.length === 0 && (
          <EmptyState
            icon={PenLine}
            message={
              atPlace
                ? "No notes here yet. Be the first to leave one!"
                : "No notes here yet. Visit this place to leave the first one."
            }
            action={atPlace ? "Leave a note" : undefined}
            onAction={atPlace ? () => navigate(`/place/${id}/note/new`) : undefined}
          />
        )}

        {!loading && !error && notes.length > 0 && (
          <div className="space-y-3">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
