import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Phone, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          
          {/* Desktop Menu */}
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
            <ThemeToggle />
            {user ? (
              <Button onClick={handleLogout}>Logout</Button>
            ) : (
              <NavLink to="/login">
                <Button>Login</Button>
              </NavLink>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 mt-8">
                  <NavLink 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-base font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
                    }
                  >
                    Home
                  </NavLink>
                  <NavLink 
                    to="/rooms" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-base font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
                    }
                  >
                    Rooms
                  </NavLink>
                  <NavLink 
                    to="/blogs" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-base font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
                    }
                  >
                    Blogs
                  </NavLink>
                  <NavLink 
                    to="/testimonials" 
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) => 
                      `text-base font-medium transition-colors hover:text-primary ${isActive ? 'text-primary' : 'text-foreground'}`
                    }
                  >
                    Testimonials
                  </NavLink>
                  <a 
                    href="tel:+254700000000" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-base font-medium transition-colors hover:text-primary flex items-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Contact
                  </a>
                  <div className="pt-4 border-t">
                    {user ? (
                      <Button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full">
                        Logout
                      </Button>
                    ) : (
                      <NavLink to="/login" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Login</Button>
                      </NavLink>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
