export function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function friendlyAuthError(error) {
  if (!error) return "Something went wrong. Please try again.";
  const msg = (error.message ?? "").toLowerCase();
  const status = error.status;
  if (
    msg.includes("expired") ||
    msg.includes("invalid") ||
    msg.includes("otp") ||
    msg.includes("token")
  ) {
    return "That code is wrong or expired. Try again or resend a new one.";
  }
  if (
    status === 429 ||
    msg.includes("rate limit") ||
    msg.includes("security purposes")
  ) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (
    msg.includes("not authorized") ||
    msg.includes("unable to send") ||
    msg.includes("email")
  ) {
    return "We couldn't send an email to that address. Check it and try again.";
  }
  return "Something went wrong. Please try again.";
}

export function formatRelativeTime(date, now = new Date()) {
  const diff = Math.round((new Date(date) - now) / 60000);
  if (diff > 60) return `in ${Math.round(diff / 60)}h`;
  if (diff > 1) return `in ${diff} min`;
  if (diff >= 0) return "starting now";
  if (diff > -60) return `started ${-diff} min ago`;
  return `started ${Math.round(-diff / 60)}h ago`;
}

export function distanceMiles(a, b) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export function isAllowedEmail(email, domain) {
  if (!domain) return true;
  return email.toLowerCase().endsWith("@" + domain.toLowerCase());
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
