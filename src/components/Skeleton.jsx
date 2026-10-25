export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-amber-100 ${className}`} />
  );
}

export function PlaceCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-56" />
      <Skeleton className="mt-1 h-4 w-24" />
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <Skeleton className="h-4 w-20 rounded-full" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-1 h-4 w-3/4" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}
