import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login after a brief moment
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-forest/20 via-eco-leaf/10 to-eco-sky/20 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-8 shadow-lg">
          <Leaf className="w-10 h-10 text-primary-foreground" />
        </div>

        <h1 className="text-5xl font-bold text-eco-forest mb-4">EcoConnect</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Building sustainable communities together through environmental action
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/login")}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate("/register")}
            variant="outline"
            className="px-8 py-3"
          >
            Create Account
          </Button>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          Redirecting to login in a moment...
        </p>
      </div>
    </div>
  );
}
