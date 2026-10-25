import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  Users,
  Share2,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getEvent, joinEvent, leaveEvent, cancelEvent } from "../lib/api";
import { supabase } from "../lib/supabase";
import { formatRelativeTime, formatTime, formatDate } from "../lib/format";
import Avatar from "../components/Avatar";
import CategoryChip from "../components/CategoryChip";

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await getEvent(id);
      setEvent(data);
    } catch (err) {
      if (err.code === "PGRST116") setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`event-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_members",
          filter: `event_id=eq.${id}`,
        },
        () => load(),
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, load]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function handleJoin() {
    setActionLoading(true);
    try {
      await joinEvent(id, user.id);
      await load();
    } catch (err) {
      if (err.message?.includes("full"))
        showToast("Sorry, this event just filled up.");
      else showToast(err.message ?? "Could not join.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeave() {
    setActionLoading(true);
    try {
      await leaveEvent(id, user.id);
      await load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Cancel this event? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await cancelEvent(id);
      await load();
    } finally {
      setActionLoading(false);
    }
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      showToast("Link copied!");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-gray-500">Event not found.</p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          Back to feed
        </button>
      </div>
    );
  }

  const isHost = event.created_by === user.id;
  const isMember = event.members.some((m) => m.user_id === user.id);
  const isFull = event.member_count >= event.max_people;
  const isCancelled = event.status === "cancelled";

  const mapsUrl = event.lat
    ? `https://www.google.com/maps/search/?api=1&query=${event.lat},${event.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.place_name)}`;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header
        className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 py-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        <div className="mx-auto flex max-w-md items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-1 text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-sm font-semibold text-gray-700">Event</h1>
          <button
            onClick={handleShare}
            className="rounded-lg p-1 text-gray-500"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 space-y-4 px-4 pb-10 pt-4">
        {isCancelled && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            This event has been cancelled.
          </div>
        )}

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-xl font-bold text-gray-900 leading-tight">
              {event.title}
            </h2>
            <CategoryChip category={event.category} />
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 shrink-0" />
              <span>
                {formatTime(event.starts_at)} · {formatDate(event.starts_at)}
              </span>
              <span className="text-gray-400">
                ({formatRelativeTime(event.starts_at)})
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                {event.place_name}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-gray-400 shrink-0" />
              <span>
                {event.member_count}/{event.max_people} going
              </span>
            </div>
          </div>

          {event.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Hosted by
          </h3>
          <div className="flex items-center gap-3">
            <Avatar name={event.host_name} />
            <span className="font-medium text-gray-900">{event.host_name}</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-700">
            Attendees ({event.member_count}/{event.max_people})
          </h3>
          <div className="space-y-2">
            {event.members.map((m) => (
              <div key={m.user_id} className="flex items-center gap-3">
                <Avatar name={m.profile?.display_name ?? ""} size="sm" />
                <span className="text-sm text-gray-800">
                  {m.profile?.display_name ?? "Unknown"}
                </span>
                {m.user_id === event.created_by && (
                  <span className="text-xs text-gray-400">host</span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2">
          {isHost && !isCancelled && (
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="w-full rounded-xl border-2 border-red-200 py-3 font-semibold text-red-500 disabled:opacity-60 active:opacity-80"
            >
              {actionLoading ? "Processing…" : "Cancel event"}
            </button>
          )}
          {!isHost && !isCancelled && !isMember && !isFull && (
            <button
              onClick={handleJoin}
              disabled={actionLoading}
              className="w-full rounded-xl bg-primary py-3 font-semibold text-white disabled:opacity-60 active:opacity-80"
            >
              {actionLoading ? "Joining…" : "I'm going"}
            </button>
          )}
          {!isHost && !isCancelled && isMember && (
            <button
              onClick={handleLeave}
              disabled={actionLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary py-3 font-semibold text-primary disabled:opacity-60"
            >
              <CheckCircle className="h-4 w-4" />
              {actionLoading ? "Leaving…" : "You're going · Leave"}
            </button>
          )}
          {!isHost && !isCancelled && !isMember && isFull && (
            <button
              disabled
              className="w-full rounded-xl bg-gray-200 py-3 font-semibold text-gray-400"
            >
              Full
            </button>
          )}
          {isCancelled && (
            <button
              disabled
              className="w-full rounded-xl bg-gray-200 py-3 font-semibold text-gray-400"
            >
              Event cancelled
            </button>
          )}
        </div>
      </main>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
