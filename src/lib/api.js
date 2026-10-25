import { supabase } from "./supabase";

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function sendLoginCode(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyLoginCode(email, code) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "email",
  });
  if (error) throw error;
  return data.session;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createProfile({ id, display_name, major, interests }) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id, display_name, major, interests })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  userId,
  { display_name, major, interests },
) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name, major, interests })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getUpcomingEvents() {
  const now = new Date();
  const windowStart = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
  const windowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      host:profiles!created_by(display_name),
      event_members(count)
    `,
    )
    .eq("status", "open")
    .gte("starts_at", windowStart)
    .lte("starts_at", windowEnd)
    .order("starts_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map((e) => ({
    ...e,
    host_name: e.host?.display_name ?? "Unknown",
    member_count: e.event_members?.[0]?.count ?? 0,
  }));
}

export async function getEvent(id) {
  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      host:profiles!created_by(id, display_name),
      event_members(user_id, joined_at, profile:profiles(id, display_name))
    `,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    ...data,
    host_name: data.host?.display_name ?? "Unknown",
    member_count: data.event_members?.length ?? 0,
    members: data.event_members ?? [],
  };
}

export async function createEvent(
  { title, description, category, place_name, lat, lng, starts_at, max_people },
  userId,
) {
  const { data: event, error } = await supabase
    .from("events")
    .insert({
      title,
      description,
      category,
      place_name,
      lat,
      lng,
      starts_at,
      max_people,
      created_by: userId,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("event_members")
    .insert({ event_id: event.id, user_id: userId });
  return event;
}

export async function joinEvent(eventId, userId) {
  const { error } = await supabase
    .from("event_members")
    .insert({ event_id: eventId, user_id: userId });
  if (error) throw error;
}

export async function leaveEvent(eventId, userId) {
  const { error } = await supabase
    .from("event_members")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function cancelEvent(eventId) {
  const { error } = await supabase
    .from("events")
    .update({ status: "cancelled" })
    .eq("id", eventId);
  if (error) throw error;
}

export async function getMyHostedEvents(userId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*, event_members(count)")
    .eq("created_by", userId)
    .eq("status", "open")
    .gte("starts_at", now)
    .order("starts_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((e) => ({
    ...e,
    member_count: e.event_members?.[0]?.count ?? 0,
  }));
}

export async function getMyJoinedEvents(userId) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("event_members")
    .select(
      "event:events(*, host:profiles!created_by(display_name), event_members(count))",
    )
    .eq("user_id", userId)
    .gte("event.starts_at", now)
    .neq("event.created_by", userId);
  if (error) throw error;
  return (data ?? [])
    .map((r) => r.event)
    .filter(Boolean)
    .map((e) => ({
      ...e,
      host_name: e.host?.display_name ?? "Unknown",
      member_count: e.event_members?.[0]?.count ?? 0,
    }));
}
