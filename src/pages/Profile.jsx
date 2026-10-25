import { useEffect, useState } from "react";
import { LogOut, Edit2, Check, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { updateProfile, getMyNotes } from "../lib/api";
import { formatTimeAgo } from "../lib/format";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import BottomNav from "../components/BottomNav";
import { FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [notes, setNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(true);

  useEffect(() => {
    getMyNotes(user.id)
      .then(setNotes)
      .finally(() => setNotesLoading(false));
  }, [user.id]);

  async function saveProfile() {
    if (!displayName.trim()) { setEditError("Display name is required."); return; }
    setSaving(true);
    setEditError("");
    try {
      await updateProfile(user.id, { display_name: displayName.trim() });
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
    setEditError("");
    setEditing(false);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F0E8]">
      <header
        className="sticky top-0 z-10 border-b border-amber-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto max-w-md">
          <h1 className="text-lg font-bold text-gray-900">Profile</h1>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-5 px-4 pb-28 pt-5">
        {/* Profile card */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar name={profile?.display_name ?? ""} size="lg" />
            <div className="flex-1 min-w-0">
              {!editing ? (
                <>
                  <h2 className="font-bold text-gray-900 text-lg">{profile?.display_name}</h2>
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

          {editing && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Display name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={40}
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
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

        {/* My notes */}
        <div>
          <h3 className="mb-2 px-1 text-sm font-semibold text-gray-700">My notes</h3>
          {notesLoading ? (
            <p className="text-sm text-gray-400 px-1">Loading…</p>
          ) : notes.length === 0 ? (
            <EmptyState icon={FileText} message="You haven't left any notes yet." />
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => navigate(`/note/${note.id}`)}
                  className="w-full rounded-2xl bg-white p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
                >
                  <p className="text-xs font-medium text-primary mb-1">{note.place?.name}</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{note.content}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatTimeAgo(note.created_at)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={signOut}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-500 active:bg-gray-50 bg-white"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </main>

      <BottomNav />
    </div>
  );
}
