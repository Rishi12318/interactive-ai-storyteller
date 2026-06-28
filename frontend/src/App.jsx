import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./Store/authStore";
import { useStoryStore } from "./Store/StoryStore";
import Landing from "./pages/landingPage/Landing";
import SignIn from "./pages/signin";
import SignUp from "./pages/signup";
import PromptInput from "./components/PromptInput";
import StoryDisplay from "./components/StoryDisplay";

function StoryApp() {
  const { sessionId } = useStoryStore();
  return sessionId ? <StoryDisplay /> : <PromptInput />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <StoryApp />
            </ProtectedRoute>
          }
        />
        {/* Catch-all: redirect unknown paths to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
