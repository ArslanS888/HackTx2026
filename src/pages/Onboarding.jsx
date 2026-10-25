import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProfile } from "../lib/api";
import { CATEGORIES } from "../components/CategoryChip";

export default function Onboarding() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [major, setMajor] = useState("");
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleInterest(cat) {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createProfile({
        id: user.id,
        display_name: displayName.trim(),
        major: major.trim() || null,
        interests,
      });
      await refreshProfile();
      navigate("/");
    } catch (err) {
      setError(err.message ?? "Could not save profile. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900">
          Set up your profile
        </h1>
        <p className="mt-1 text-gray-500">
          Others will see this when you join events.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Display name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Alex B."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Major (optional)
            </label>
            <input
              type="text"
              maxLength={60}
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              placeholder="e.g. Computer Science"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Interests (optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInterest(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                    interests.includes(cat)
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
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
            {loading ? "Saving…" : "Get started"}
          </button>
        </form>
      </div>
    </div>
  );
}
