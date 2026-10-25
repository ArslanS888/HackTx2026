const STYLES = {
  study: "bg-blue-100 text-blue-700",
  sports: "bg-green-100 text-green-700",
  food: "bg-orange-100 text-orange-700",
  gaming: "bg-purple-100 text-purple-700",
  hackathon: "bg-red-100 text-red-700",
  music: "bg-pink-100 text-pink-700",
  outdoors: "bg-teal-100 text-teal-700",
  party: "bg-yellow-100 text-yellow-700",
  other: "bg-gray-100 text-gray-600",
};

export const CATEGORIES = Object.keys(STYLES);

export default function CategoryChip({ category, selected, onClick }) {
  const base = STYLES[category] ?? STYLES.other;
  const interactive = onClick
    ? "cursor-pointer hover:opacity-80 active:scale-95 transition-transform"
    : "";
  const ring = selected ? "ring-2 ring-offset-1 ring-current" : "";

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold capitalize ${base} ${interactive} ${ring}`}
    >
      {category}
    </span>
  );
}
