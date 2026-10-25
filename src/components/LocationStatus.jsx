import { MapPin, Lock } from "lucide-react";
import { formatDistance } from "../lib/geo";

// Shows whether the user is at a place or how far they are
export default function LocationStatus({ isAtPlace, distanceMeters, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-500">
        <MapPin className="h-3.5 w-3.5 animate-pulse" />
        Getting location…
      </div>
    );
  }

  if (isAtPlace) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
        <MapPin className="h-3.5 w-3.5" />
        You're here
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
      <Lock className="h-3.5 w-3.5" />
      {distanceMeters != null
        ? `${formatDistance(distanceMeters)} away — go there to write`
        : "Location unavailable — go to the place to write"}
    </div>
  );
}
