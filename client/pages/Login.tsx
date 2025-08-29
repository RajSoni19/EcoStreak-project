import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Leaf, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { apiService, LoginRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: LoginRequest = { email, password };
      const response = await apiService.login(loginData);

      if (response.success && response.data) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', response.data.accessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Show success message
        toast({
          title: "Login successful!",
          description: `Welcome back, ${response.data.user.fullName}!`,
        });

        // Navigate based on user role
        switch (response.data.user.role) {
          case 'admin':
            navigate("/admin/dashboard");
            break;
          case 'ngo':
            navigate("/ngo/dashboard");
            break;
          default:
            navigate("/user/dashboard");
        }
      } else {
        toast({
          title: "Login failed",
          description: response.message || "Please check your credentials",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-eco-forest/20 via-eco-leaf/10 to-eco-sky/20 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div
        className={
          'absolute inset-0 bg-[url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23059669" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')] opacity-40'
        }
      ></div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
            <Leaf className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-eco-forest">EcoConnect</h1>
          <p className="text-muted-foreground mt-2">
            Building sustainable communities together
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-card-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue making a difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ecoconnect.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-border/50 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-border/50 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <Link
                  to="/forgot-password"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Create account
              </Link>
            </div>

            {/* API Status */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">Connected to Backend API:</p>
              <p>✅ Real authentication system</p>
              <p>✅ MongoDB Atlas database</p>
              <p>✅ JWT token security</p>
              <p className="mt-2 text-primary">Register a new account to get started!</p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-xs text-muted-foreground">
          © 2024 EcoConnect. All rights reserved.
        </div>
      </div>
    </div>
  );
}
