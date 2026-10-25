export default function Skeleton({ className = "" }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />
  );
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-4 w-32" />
      <Skeleton className="mt-1 h-4 w-24" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-7 w-7 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
