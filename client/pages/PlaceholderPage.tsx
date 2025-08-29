import { useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  const location = useLocation();

  // Determine user role from path
  const getUserRole = () => {
    if (location.pathname.startsWith("/admin")) return "admin";
    if (location.pathname.startsWith("/ngo")) return "ngo";
    return "user";
  };

  const userRole = getUserRole();

  const getOrganizationName = () => {
    if (userRole === "ngo") return "Green Earth Foundation";
    return undefined;
  };

  const getUserName = () => {
    switch (userRole) {
      case "admin":
        return "Admin User";
      case "ngo":
        return "NGO Admin";
      default:
        return "User";
    }
  };

  const getBackRoute = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "ngo":
        return "/ngo/dashboard";
      default:
        return "/user/dashboard";
    }
  };

  return (
    <DashboardLayout
      userRole={userRole}
      userName={getUserName()}
      organizationName={getOrganizationName()}
    >
      <div className="min-h-[600px] flex items-center justify-center">
        <Card className="w-full max-w-md border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-eco-sky/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Construction className="w-8 h-8 text-eco-sky" />
            </div>

            <h1 className="text-2xl font-bold text-foreground mb-4">{title}</h1>

            <p className="text-muted-foreground mb-6">
              This page is currently under development. Our team is working hard
              to bring you this feature soon!
            </p>

            <div className="space-y-3">
              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>

              <Button
                onClick={() => (window.location.href = getBackRoute())}
                className="w-full bg-primary hover:bg-primary/90"
              >
                Return to Dashboard
              </Button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Have suggestions for this feature?{" "}
                <span className="text-primary cursor-pointer hover:underline">
                  Let us know
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
