import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Places from "./pages/Places";
import PlaceBoard from "./pages/PlaceBoard";
import CreateNote from "./pages/CreateNote";
import NoteDetail from "./pages/NoteDetail";
import CreatePlace from "./pages/CreatePlace";
import Profile from "./pages/Profile";

function Spinner() {
  return (
    <div className="flex h-screen items-center justify-center bg-surface">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (user && !profile) return <Navigate to="/onboarding" replace />;
  return children;
}

function RedirectIfAuthed({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user && profile) return <Navigate to="/" replace />;
  if (user && !profile) return <Navigate to="/onboarding" replace />;
  return children;
}

function RequireOnboarding({ children }) {
  const { user, profile, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (profile) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/onboarding"
          element={
            <RequireOnboarding>
              <Onboarding />
            </RequireOnboarding>
          }
        />
        <Route
          path="/"
          element={
            <RequireAuth>
              <Places />
            </RequireAuth>
          }
        />
        <Route
          path="/place/new"
          element={
            <RequireAuth>
              <CreatePlace />
            </RequireAuth>
          }
        />
        <Route
          path="/place/:id"
          element={
            <RequireAuth>
              <PlaceBoard />
            </RequireAuth>
          }
        />
        <Route
          path="/place/:id/note/new"
          element={
            <RequireAuth>
              <CreateNote />
            </RequireAuth>
          }
        />
        <Route
          path="/note/:id"
          element={
            <RequireAuth>
              <NoteDetail />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
