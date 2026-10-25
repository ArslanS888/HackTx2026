import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProfile } from "../lib/api";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProfile({ id: user.id, display_name: displayName.trim() });
      await refreshProfile();
      navigate("/");
    } catch (err) {
      setError(err.message ?? "Could not save profile. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900">Choose a name</h1>
        <p className="mt-1 text-gray-500">
          This is what others see when they read your notes.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Display name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              autoFocus
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex B."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
          >
            {loading ? "Saving…" : "Start leaving notes"}
          </button>
        </form>
      </div>
    </div>
  );
}
