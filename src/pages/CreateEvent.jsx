import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle, Minus, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createEvent } from "../lib/api";
import { CATEGORIES } from "../components/CategoryChip";
import BottomNav from "../components/BottomNav";

function addMinutes(mins) {
  const d = new Date(Date.now() + mins * 60000);
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function CreateEvent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("other");
  const [placeName, setPlaceName] = useState("");
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [startsAt, setStartsAt] = useState(addMinutes(30));
  const [maxPeople, setMaxPeople] = useState(5);
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  function validate() {
    const e = {};
    if (title.trim().length < 3)
      e.title = "Title must be at least 3 characters.";
    if (title.trim().length > 80)
      e.title = "Title must be 80 characters or less.";
    if (!placeName.trim()) e.placeName = "Location name is required.";
    if (!startsAt) e.startsAt = "Start time is required.";
    if (description.length > 500)
      e.description = "Description must be 500 characters or less.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    setSaveError("");
    try {
      const event = await createEvent(
        {
          title: title.trim(),
          category,
          place_name: placeName.trim(),
          lat: location?.lat ?? null,
          lng: location?.lng ?? null,
          starts_at: new Date(startsAt).toISOString(),
          max_people: maxPeople,
          description: description.trim() || null,
        },
        user.id,
      );
      navigate(`/event/${event.id}`);
    } catch (err) {
      setSaveError(err.message ?? "Could not create event. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function useMyLocation() {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => setLocLoading(false),
    );
  }

  const Field = ({ label, error, children }) => (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
          <h1 className="font-bold text-gray-900">New Event</h1>
          <div className="w-12" />
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-md space-y-5 px-4 pb-32 pt-5"
      >
        <Field label="Title" error={errors.title}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            placeholder="e.g. Study session at Alkek"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  category === cat
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <Field label="Location name" error={errors.placeName}>
          <div className="flex gap-2">
            <input
              type="text"
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              placeholder="e.g. Alkek Library, Room 201"
              className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locLoading}
              className="flex items-center gap-1 rounded-xl bg-gray-100 px-3 py-2 text-xs font-medium text-gray-600 disabled:opacity-50"
            >
              {location ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {locLoading ? "…" : location ? "Saved" : "GPS"}
            </button>
          </div>
        </Field>

        <Field label="Start time" error={errors.startsAt}>
          <div className="flex flex-wrap gap-2">
            {[
              ["Now", 0],
              ["+15 min", 15],
              ["+30 min", 30],
              ["+1 hr", 60],
            ].map(([label, mins]) => (
              <button
                key={label}
                type="button"
                onClick={() => setStartsAt(addMinutes(mins))}
                className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {label}
              </button>
            ))}
          </div>
          <input
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
          />
        </Field>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Max people
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setMaxPeople((p) => Math.max(2, p - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center text-lg font-bold text-gray-900">
              {maxPeople}
            </span>
            <button
              type="button"
              onClick={() => setMaxPeople((p) => Math.min(20, p + 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Field
          label={`Description (optional) — ${description.length}/500`}
          error={errors.description}
        >
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Any extra details…"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </Field>

        {saveError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {saveError}
          </p>
        )}

        <p className="text-center text-xs text-gray-400">
          🛡 Meet in public places and tell a friend where you&apos;re going.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
        >
          {saving ? "Creating…" : "Create event"}
        </button>
      </form>

      <BottomNav />
    </div>
  );
}
