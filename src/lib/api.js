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

export async function createProfile({ id, display_name }) {
  const { data, error } = await supabase
    .from("profiles")
    .insert({ id, display_name })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId, { display_name }) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ display_name })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Places ──────────────────────────────────────────────────────────────────

export async function getPlaces() {
  const { data, error } = await supabase
    .from("places")
    .select("*, creator:profiles!created_by(display_name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPlace(id) {
  const { data, error } = await supabase
    .from("places")
    .select("*, creator:profiles!created_by(display_name)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPlace({ name, description, lat, lng, radius_meters }, userId) {
  const { data, error } = await supabase
    .from("places")
    .insert({ name, description, lat, lng, radius_meters, created_by: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export async function getNotesAtPlace(placeId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*, author:profiles!author_id(display_name), replies(count)")
    .eq("place_id", placeId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((n) => ({
    ...n,
    author_name: n.author?.display_name ?? "Anonymous",
    reply_count: n.replies?.[0]?.count ?? 0,
  }));
}

export async function getNote(id) {
  const { data, error } = await supabase
    .from("notes")
    .select("*, author:profiles!author_id(display_name), place:places(id, name, lat, lng, radius_meters)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    ...data,
    author_name: data.author?.display_name ?? "Anonymous",
  };
}

export async function createNote({ place_id, content }, userId) {
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("notes")
    .insert({ place_id, author_id: userId, content, expires_at: expiresAt })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getMyNotes(userId) {
  const { data, error } = await supabase
    .from("notes")
    .select("*, place:places(id, name)")
    .eq("author_id", userId)
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Replies ─────────────────────────────────────────────────────────────────

export async function getReplies(noteId) {
  const { data, error } = await supabase
    .from("replies")
    .select("*, author:profiles!author_id(display_name)")
    .eq("note_id", noteId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    ...r,
    author_name: r.author?.display_name ?? "Anonymous",
  }));
}

export async function createReply({ note_id, content }, userId) {
  const { data, error } = await supabase
    .from("replies")
    .insert({ note_id, author_id: userId, content })
    .select()
    .single();
  if (error) throw error;
  return data;
}
