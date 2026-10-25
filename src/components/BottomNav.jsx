import { useNavigate, useLocation } from "react-router-dom";
import { Home, PlusCircle, User } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const active = (path) =>
    pathname === path ? "text-primary" : "text-gray-400";

  return (
    <nav
      className="fixed bottom-0 left-1/2 w-full max-w-md -translate-x-1/2 border-t border-gray-100 bg-white"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-center justify-around py-2">
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center gap-0.5 px-6 py-1 text-xs font-medium ${active("/")}`}
        >
          <Home className="h-6 w-6" />
          <span>Nearby</span>
        </button>

        <button
          onClick={() => navigate("/create")}
          className="flex flex-col items-center gap-0.5 px-6 py-1"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg">
            <PlusCircle className="h-6 w-6 text-white" />
          </div>
        </button>

        <button
          onClick={() => navigate("/profile")}
          className={`flex flex-col items-center gap-0.5 px-6 py-1 text-xs font-medium ${active("/profile")}`}
        >
          <User className="h-6 w-6" />
          <span>Profile</span>
        </button>
      </div>
    </nav>
  );
}
