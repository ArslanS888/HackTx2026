export default function EmptyState({ icon: Icon, message, action, onAction }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      {Icon && <Icon className="h-12 w-12 text-gray-300" strokeWidth={1.5} />}
      <p className="text-gray-500">{message}</p>
      {action && (
        <button
          onClick={onAction}
          className="mt-1 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white active:opacity-80"
        >
          {action}
        </button>
      )}
    </div>
  );
}
