import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Leaf, 
  Menu, 
  X, 
  LayoutDashboard, 
  Building2, 
  Settings, 
  LogOut,
  Calendar,
  Gift,
  Users,
  ChevronDown
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "admin" | "ngo" | "user";
  userName?: string;
  organizationName?: string;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
}

export default function DashboardLayout({ 
  children, 
  userRole, 
  userName = "User", 
  organizationName 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const getNavItems = (): NavItem[] => {
    switch (userRole) {
      case "admin":
        return [
          { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
          { label: "Manage NGOs", path: "/admin/ngos", icon: Building2 },
          { label: "Settings", path: "/admin/settings", icon: Settings },
        ];
      case "ngo":
        return [
          { label: "Dashboard", path: "/ngo/dashboard", icon: LayoutDashboard },
          { label: "Events", path: "/ngo/events", icon: Calendar },
          { label: "Rewards Store", path: "/ngo/rewards", icon: Gift },
          { label: "Community", path: "/ngo/community", icon: Users },
          { label: "Settings", path: "/ngo/settings", icon: Settings },
        ];
      default:
        return [
          { label: "Dashboard", path: "/user/dashboard", icon: LayoutDashboard },
          { label: "Events", path: "/user/events", icon: Calendar },
          { label: "Rewards", path: "/user/rewards", icon: Gift },
          { label: "Settings", path: "/user/settings", icon: Settings },
        ];
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
  };

  const navItems = getNavItems();

  const getBrandTitle = () => {
    switch (userRole) {
      case "admin":
        return "Super Admin Portal";
      case "ngo":
        return organizationName || "NGO Portal";
      default:
        return "EcoConnect";
    }
  };

  const getUserInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground text-sm">EcoConnect</h1>
                <p className="text-xs text-sidebar-foreground/70">{getBrandTitle()}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 px-3 py-2 h-auto"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
                      {getUserInitials(userName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                    <p className="text-xs text-sidebar-foreground/70 capitalize">{userRole}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-sidebar-foreground/70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="hidden lg:block">
              <h2 className="text-lg font-semibold text-card-foreground">
                {getBrandTitle()}
              </h2>
            </div>

            {/* Right side actions could go here */}
            <div className="flex items-center gap-2">
              {/* Notifications, quick actions, etc. */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
