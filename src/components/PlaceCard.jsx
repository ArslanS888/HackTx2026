import { useNavigate } from "react-router-dom";
import { MapPin, FileText } from "lucide-react";
import { formatDistance } from "../lib/geo";

export default function PlaceCard({ place, distanceMeters }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/place/${place.id}`)}
      className="w-full rounded-2xl bg-white p-4 shadow-sm text-left active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug">{place.name}</h3>
        {distanceMeters != null && (
          <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-primary">
            {formatDistance(distanceMeters)}
          </span>
        )}
      </div>
      {place.description && (
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{place.description}</p>
      )}
      <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {place.radius_meters ?? 50} m radius
        </span>
        <span className="flex items-center gap-1">
          <FileText className="h-3.5 w-3.5" />
          {place.creator?.display_name ?? "Someone"}
        </span>
      </div>
    </button>
  );
}
