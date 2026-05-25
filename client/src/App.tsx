import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/protected_route/ProtectedRoute';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import FeedPage from './pages/feed/FeedPage';
import AboutPage from './pages/info/AboutPage';
import HelpPage from './pages/info/HelpPage';
import NotFoundPage from './pages/not_found/NotFoundPage';
import CommunityPage from './pages/communities/CommunityPage';
import CreatePostPage from './pages/communities/CreatePostPage';
import EditPostPage from './pages/post/EditPostPage';
import PostDetailPage from './pages/post/PostDetailPage';
import CommentsPage from './pages/comments/CommentsPage';
import AdminDashboard from './pages/admin/AdminDashboardPage';



export default function App() {
    return (
        <Routes>
      
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />     
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/communities/:id" element={<CommunityPage />} />            

            <Route
                path="/admin"
                element={
                    //<ProtectedRoute requiredRole="admin">
                        <AdminDashboard />
                    //</ProtectedRoute>
                }
            />


            <Route
                path="/post/:postId/comments"
                element={
                    //<ProtectedRoute requiredRole="user">
                        <CommentsPage />
                    //</ProtectedRoute>
                }
            />


              <Route path="/communities/:id" element={<CommunityPage />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />


            <Route path="/communities/:id/create-post" element={
                <ProtectedRoute requiredRole="user">
                    <CreatePostPage />
                </ProtectedRoute>
            } />

        <Route path="/posts/:id/edit" element={
            <ProtectedRoute requiredRole="user">
                <EditPostPage />
            </ProtectedRoute>
            } />



            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
    );
}