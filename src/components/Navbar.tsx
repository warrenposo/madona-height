import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { listener.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold text-primary">
            Madona Heights
          </NavLink>
          <div className="hidden md:flex items-center gap-8">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/rooms" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
              }
            >
              Rooms
            </NavLink>
            <NavLink 
              to="/blogs" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
              }
            >
              Blogs
            </NavLink>
            <NavLink 
              to="/testimonials" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
              }
            >
              Testimonials
            </NavLink>
            <a href="tel:+254700000000" className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contact
            </a>
            {user ? (
              <Button onClick={handleLogout}>Logout</Button>
            ) : (
              <NavLink to="/login">
                <Button>Login</Button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
