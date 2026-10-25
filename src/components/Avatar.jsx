const COLORS = [
  "bg-primary",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-pink-500",
];

export default function Avatar({ name = "", size = "md" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  const sz =
    size === "lg"
      ? "h-16 w-16 text-2xl"
      : size === "sm"
        ? "h-7 w-7 text-xs"
        : "h-10 w-10 text-sm";

  return (
    <div
      className={`${sz} ${color} flex shrink-0 items-center justify-center rounded-full font-semibold text-white`}
    >
      {initials || "?"}
    </div>
  );
}
