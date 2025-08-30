import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import NGORegister from "./pages/NGORegister";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageNGOs from "./pages/admin/ManageNGOs";

// NGO Pages
import NGODashboard from "./pages/ngo/Dashboard";
import NGOEvents from "./pages/ngo/Events";
import CreateEvent from "./pages/ngo/CreateEvent";
import NGOStore from "./pages/ngo/Store";
import NGOCommunity from "./pages/ngo/Community";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserHabits from "./pages/user/Habits";
import UserLeaderboard from "./pages/user/Leaderboard";
import UserStore from "./pages/user/Store";
import UserCommunities from "./pages/user/Communities";
import UserCommunity from "./pages/user/Community";
import CommunityPosts from "./pages/user/CommunityPosts";
import EventRegistration from "./pages/user/EventRegistration";

// Shared Pages
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";

// Components
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Default redirect to login for authentication */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/ngo" element={<NGORegister />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={
            <AuthGuard requiredRole="admin">
              <AdminDashboard />
            </AuthGuard>
          } />
          <Route path="/admin/ngos" element={
            <AuthGuard requiredRole="admin">
              <ManageNGOs />
            </AuthGuard>
          } />
          <Route
            path="/admin/settings"
            element={
              <AuthGuard requiredRole="admin">
                <PlaceholderPage title="Admin Settings" />
              </AuthGuard>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AuthGuard requiredRole="admin">
                <PlaceholderPage title="Platform Reports" />
              </AuthGuard>
            }
          />

          {/* NGO Routes */}
          <Route path="/ngo/dashboard" element={
            <AuthGuard requiredRole="ngo">
              <NGODashboard />
            </AuthGuard>
          } />
          <Route path="/ngo/events" element={
            <AuthGuard requiredRole="ngo">
              <NGOEvents />
            </AuthGuard>
          } />
          <Route path="/ngo/events/create" element={
            <AuthGuard requiredRole="ngo">
              <CreateEvent />
            </AuthGuard>
          } />
          <Route path="/ngo/rewards" element={
            <AuthGuard requiredRole="ngo">
              <NGOStore />
            </AuthGuard>
          } />
          <Route path="/ngo/community" element={
            <AuthGuard requiredRole="ngo">
              <NGOCommunity />
            </AuthGuard>
          } />
          <Route
            path="/ngo/settings"
            element={
              <AuthGuard requiredRole="ngo">
                <PlaceholderPage title="NGO Settings" />
              </AuthGuard>
            }
          />

          {/* User Routes */}
          <Route path="/user/dashboard" element={
            <AuthGuard requiredRole="user">
              <UserDashboard />
            </AuthGuard>
          } />
          <Route path="/user/habits" element={
            <AuthGuard requiredRole="user">
              <UserHabits />
            </AuthGuard>
          } />
          <Route path="/user/leaderboard" element={
            <AuthGuard requiredRole="user">
              <UserLeaderboard />
            </AuthGuard>
          } />
          <Route path="/user/store" element={
            <AuthGuard requiredRole="user">
              <UserStore />
            </AuthGuard>
          } />
          <Route path="/user/communities" element={
            <AuthGuard requiredRole="user">
              <UserCommunities />
            </AuthGuard>
          } />
          <Route path="/user/community/:id" element={
            <AuthGuard requiredRole="user">
              <UserCommunity />
            </AuthGuard>
          } />
          <Route path="/user/community/:id/posts" element={
            <AuthGuard requiredRole="user">
              <CommunityPosts />
            </AuthGuard>
          } />
          <Route path="/user/events" element={
            <AuthGuard requiredRole="user">
              <EventRegistration />
            </AuthGuard>
          } />
          <Route
            path="/user/settings"
            element={
              <AuthGuard requiredRole="user">
                <PlaceholderPage title="User Settings" />
              </AuthGuard>
            }
          />

          {/* Utility Routes */}
          <Route
            path="/forgot-password"
            element={<PlaceholderPage title="Reset Password" />}
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
