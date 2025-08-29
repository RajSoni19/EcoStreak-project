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

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import ManageNGOs from "./pages/admin/ManageNGOs";

// NGO Pages
import NGODashboard from "./pages/ngo/Dashboard";
import NGOEvents from "./pages/ngo/Events";

// User Pages
import UserDashboard from "./pages/user/Dashboard";
import UserHabits from "./pages/user/Habits";
import UserLeaderboard from "./pages/user/Leaderboard";
import UserStore from "./pages/user/Store";
import UserCommunities from "./pages/user/Communities";
import UserCommunity from "./pages/user/Community";

// Shared Pages
import NotFound from "./pages/NotFound";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/ngos" element={<ManageNGOs />} />
          <Route path="/admin/settings" element={<PlaceholderPage title="Admin Settings" />} />
          <Route path="/admin/reports" element={<PlaceholderPage title="Platform Reports" />} />

          {/* NGO Routes */}
          <Route path="/ngo/dashboard" element={<NGODashboard />} />
          <Route path="/ngo/events" element={<NGOEvents />} />
          <Route path="/ngo/events/create" element={<PlaceholderPage title="Create Event" />} />
          <Route path="/ngo/rewards" element={<PlaceholderPage title="Rewards Store Management" />} />
          <Route path="/ngo/community" element={<PlaceholderPage title="Community Management" />} />
          <Route path="/ngo/settings" element={<PlaceholderPage title="NGO Settings" />} />

          {/* User Routes */}
          <Route path="/user/dashboard" element={<PlaceholderPage title="User Dashboard" />} />
          <Route path="/user/events" element={<PlaceholderPage title="Browse Events" />} />
          <Route path="/user/rewards" element={<PlaceholderPage title="My Rewards" />} />
          <Route path="/user/settings" element={<PlaceholderPage title="User Settings" />} />

          {/* Utility Routes */}
          <Route path="/forgot-password" element={<PlaceholderPage title="Reset Password" />} />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
