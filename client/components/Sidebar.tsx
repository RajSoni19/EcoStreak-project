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
  LogOut,
} from "lucide-react";

interface NavigationItem {
  name: string;
  href: string;
  icon: any;
}

export default function Sidebar() {
  const navigate = useNavigate();

  const navigation: NavigationItem[] = [
    { name: "Dashboard", href: "/user/dashboard", icon: LayoutDashboard },
    { name: "Log Habits", href: "/user/habits", icon: CheckSquare },
    { name: "Leaderboard", href: "/user/leaderboard", icon: Trophy },
    { name: "Communities", href: "/user/communities", icon: Users },
    { name: "Store", href: "/user/store", icon: Store },
  ];

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  const userName = "Alex Johnson";
  const userEmail = "alex@example.com";

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      {/* App Logo and Name */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-eco-forest to-eco-leaf rounded-lg flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">EcoConnect</h1>
            <p className="text-xs text-gray-500">Eco Habits Tracker</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-100 text-green-700 font-bold"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-eco-forest text-white">
              {userName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">{userEmail}</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full justify-start gap-2 text-gray-700 hover:text-red-600 hover:border-red-300"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
