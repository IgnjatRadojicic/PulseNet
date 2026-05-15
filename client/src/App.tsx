import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { authApi } from "./api_services/auth/AuthAPIService";
import LandingPage from "./pages/landing/LandingPage";
import PrijavaStranica from "./pages/auth/PrijavaStranica";
import RegistracijaStranica from "./pages/auth/RegistracijaStranica";
import NotFoundStranica from "./pages/not_found/NotFoundPage";
// import { usersApi } from "./api_services/users/UsersAPIService";
import TestCommentsPage from "./pages/comments/CommentsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PrijavaStranica authApi={authApi} />} />
      <Route path="/register" element={<RegistracijaStranica authApi={authApi} />} />
      <Route path="/404" element={<NotFoundStranica />} />
      <Route path="/comments" element={<TestCommentsPage />} />

            <Route
                path="/feed"
                element={
                    <ProtectedRoute requiredRole="user">
                        <div style={{ color: 'white' }}>Feed — coming soon</div>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin-dashboard"
                element={
                    <ProtectedRoute requiredRole="admin">
                        <div style={{ color: 'white' }}>Admin — coming soon</div>
                    </ProtectedRoute>
                }
            />

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}