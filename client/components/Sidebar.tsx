import { NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Leaf,
  LayoutDashboard,
  CheckSquare,
  Trophy,
  Users,
  Store,
  Calendar,
  MessageSquare,
  LogOut,
  X,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const navigate = useNavigate();

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Log Habits", href: "/user/habits", icon: CheckSquare },
    { name: "Events", href: "/user/events", icon: Calendar },
    { name: "Communities", href: "/user/communities", icon: Users },
    { name: "Store", href: "/user/store", icon: Store },
    { name: "Leaderboard", href: "/user/leaderboard", icon: Trophy },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  const userName = "Alex Johnson";
  const userEmail = "alex@example.com";

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* App Logo and Name */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-eco-forest to-eco-leaf rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-sidebar-foreground">EcoConnect</h1>
              <p className="text-xs text-sidebar-foreground/70">Eco Habits Tracker</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="lg:hidden p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <button
                  onClick={() => handleNavigation(item.href)}
                  className="w-full text-left"
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </NavLink>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">{userEmail}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-sidebar-foreground hover:text-destructive hover:border-destructive"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
