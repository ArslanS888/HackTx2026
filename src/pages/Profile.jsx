import { useEffect, useState } from "react";
import { LogOut, Edit2, Check, X, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  updateProfile,
  getMyHostedEvents,
  getMyJoinedEvents,
} from "../lib/api";
import { CATEGORIES } from "../components/CategoryChip";
import Avatar from "../components/Avatar";
import EventCard from "../components/EventCard";
import EmptyState from "../components/EmptyState";
import BottomNav from "../components/BottomNav";

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [major, setMajor] = useState(profile?.major ?? "");
  const [interests, setInterests] = useState(profile?.interests ?? []);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [hosted, setHosted] = useState([]);
  const [joined, setJoined] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [installPrompt, setInstallPrompt] = useState(null);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    async function loadEvents() {
      try {
        const [h, j] = await Promise.all([
          getMyHostedEvents(user.id),
          getMyJoinedEvents(user.id),
        ]);
        setHosted(h);
        setJoined(j);
      } finally {
        setEventsLoading(false);
      }
    }
    loadEvents();
  }, [user.id]);

  function toggleInterest(cat) {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  async function saveProfile() {
    if (!displayName.trim()) {
      setEditError("Display name is required.");
      return;
    }
    setSaving(true);
    setEditError("");
    try {
      await updateProfile(user.id, {
        display_name: displayName.trim(),
        major: major.trim() || null,
        interests,
      });
      await refreshProfile();
      setEditing(false);
    } catch (err) {
      setEditError(err.message ?? "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setDisplayName(profile?.display_name ?? "");
    setMajor(profile?.major ?? "");
    setInterests(profile?.interests ?? []);
    setEditError("");
    setEditing(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto max-w-md">
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-5 px-4 pb-28 pt-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar name={profile?.display_name ?? ""} size="lg" />
            <div className="flex-1 min-w-0">
              {!editing ? (
                <>
                  <h2 className="font-bold text-gray-900 text-lg">
                    {profile?.display_name}
                  </h2>
                  {profile?.major && (
                    <p className="text-sm text-gray-500">{profile.major}</p>
                  )}
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </>
              ) : null}
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            )}
          </div>

          {!editing && profile?.interests?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.interests.map((i) => (
                <span
                  key={i}
                  className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium capitalize text-gray-600"
                >
                  {i}
                </span>
              ))}
            </div>
          )}

          {editing && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Major
                </label>
                <input
                  type="text"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  maxLength={60}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleInterest(cat)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                        interests.includes(cat)
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              {editError && <p className="text-xs text-red-500">{editError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  <Check className="h-4 w-4" /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center justify-center rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!isStandalone && (
          <div className="rounded-2xl bg-primary/5 p-4 border border-primary/20">
            <p className="text-sm font-semibold text-primary">
              Install Tagalong
            </p>
            {installPrompt ? (
              <button
                onClick={() => installPrompt.prompt()}
                className="mt-2 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
              >
                <Download className="h-4 w-4" /> Install app
              </button>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                On iPhone: tap Share → Add to Home Screen
              </p>
            )}
          </div>
        )}

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-gray-700">
            Hosting
          </h3>
          {eventsLoading ? (
            <p className="text-sm text-gray-400 px-1">Loading…</p>
          ) : hosted.length === 0 ? (
            <EmptyState message="No upcoming events you're hosting." />
          ) : (
            <div className="space-y-3">
              {hosted.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-gray-700">
            Going
          </h3>
          {eventsLoading ? (
            <p className="text-sm text-gray-400 px-1">Loading…</p>
          ) : joined.length === 0 ? (
            <EmptyState message="No upcoming events you've joined." />
          ) : (
            <div className="space-y-3">
              {joined.map((e) => (
                <EventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 active:bg-gray-50"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
