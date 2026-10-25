import { useNavigate } from "react-router-dom";
import { MapPin, Clock, Users } from "lucide-react";
import Avatar from "./Avatar";
import CategoryChip from "./CategoryChip";
import { formatRelativeTime } from "../lib/format";

export default function EventCard({ event, distanceText }) {
  const navigate = useNavigate();
  const isFull = event.member_count >= event.max_people;

  return (
    <div
      onClick={() => navigate(`/event/${event.id}`)}
      className="cursor-pointer rounded-2xl bg-white p-4 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {event.title}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <CategoryChip category={event.category} />
          {isFull && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500">
              Full
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
        <MapPin className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{event.place_name}</span>
        {distanceText && (
          <span className="ml-1 shrink-0 text-xs text-gray-400">
            · {distanceText}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>{formatRelativeTime(event.starts_at)}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar name={event.host_name} size="sm" />
          <span className="text-xs text-gray-500">{event.host_name}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          <span>
            {event.member_count}/{event.max_people} going
          </span>
        </div>
      </div>
    </div>
  );
}
