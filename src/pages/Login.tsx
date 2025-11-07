import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

const ADMIN_EMAIL = "warrenokumu98@gmail.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Fetch user profile to check role
    if (data.user) {
      let profile = null;
      let profileError = null;

      // Try to fetch profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', data.user.id)
        .single();

      profile = profileData;
      profileError = fetchError;

      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist - create it
        const userRole = data.user.email === 'warrenokumu98@gmail.com' ? 'admin' : 'tenant';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            role: userRole,
            is_active: true,
          })
          .select('role, email')
          .single();

        if (createError) {
          console.error('Error creating profile:', createError);
          setLoading(false);
          toast({
            title: "Login Failed",
            description: "Could not create user profile. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        profile = newProfile;
      } else if (profileError) {
        // Other error
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        toast({
          title: "Login Failed",
          description: profileError.message || "Could not fetch user profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setLoading(false);
      
      // Check role from profile
      if (profile?.role === 'admin') {
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin!",
        });
        navigate("/admin");
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      }
    } else {
      setLoading(false);
      toast({
        title: "Login Failed",
        description: "No user data received",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-4 bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p><Link to="/signup" className="text-primary hover:underline">Don't have an account? Sign Up</Link></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
