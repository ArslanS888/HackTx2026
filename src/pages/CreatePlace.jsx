import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Navigation } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createPlace } from "../lib/api";

const RADIUS_OPTIONS = [30, 50, 100, 200];

export default function CreatePlace() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [radius, setRadius] = useState(50);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  function useMyLocation() {
    setLocLoading(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6));
        setLng(pos.coords.longitude.toFixed(6));
        setLocLoading(false);
      },
      () => {
        setError("Could not get your location. Enter coordinates manually.");
        setLocLoading(false);
      },
      { timeout: 10000 },
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required."); return; }
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      setError("Enter valid coordinates or use your current location.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const place = await createPlace(
        { name: name.trim(), description: description.trim() || null, lat: latNum, lng: lngNum, radius_meters: radius },
        user.id,
      );
      navigate(`/place/${place.id}`, { replace: true });
    } catch (err) {
      setError(err.message ?? "Could not create place. Try again.");
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8]">
      <header
        className="sticky top-0 z-10 border-b border-amber-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-lg p-1.5 text-gray-400">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="flex-1 text-base font-bold text-gray-900">Mark a new place</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-4 pt-4 pb-8">
        <p className="mb-5 text-sm text-gray-500">
          Give this spot a name so people can find it. Use your current location or enter GPS coordinates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Place name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              maxLength={80}
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quiet corner by the window"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description (optional)
            </label>
            <textarea
              rows={2}
              maxLength={200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe how to find this exact spot…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Location */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locLoading}
              className="mb-3 flex items-center gap-2 rounded-xl border border-primary px-4 py-2.5 text-sm font-semibold text-primary disabled:opacity-60"
            >
              <Navigation className="h-4 w-4" />
              {locLoading ? "Getting location…" : "Use my current location"}
            </button>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="e.g. 29.8897"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-gray-500">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="e.g. -97.9402"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          {/* Radius */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Check-in radius: <span className="text-primary font-semibold">{radius} m</span>
            </label>
            <div className="flex gap-2">
              {RADIUS_OPTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRadius(r)}
                  className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-colors ${
                    radius === r
                      ? "bg-primary text-white"
                      : "bg-white border border-gray-200 text-gray-600"
                  }`}
                >
                  {r} m
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">
              Users must be within this radius to leave or reply to notes here.
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
          >
            {saving ? "Creating…" : "Create place"}
          </button>
        </form>
      </main>
    </div>
  );
}
