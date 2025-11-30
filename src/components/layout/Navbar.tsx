import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Search, Bell, User, Menu, X, Upload, Settings, LogOut, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo2.png";

interface NavbarProps {
  onAuthClick?: () => void;
}

export const Navbar = ({ onAuthClick }: NavbarProps) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (! user) return;

    const { data } = await supabase
      .from("profiles")
      . select("*")
      .eq("id", user.id)
      .single();

    setProfile(data);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: "Movies", href: "/movies" },
    { label: "Series", href: "/series" },
    { label: "Photos", href: "/photos" },
    { label: "Creators", href: "/creators" },
    { label: "Watchlist", href: "/watchlist", auth: true },
    { label: "My Lists", href: "/lists", auth: true },
  ];

  const handleNavClick = (href: string, requiresAuth: boolean) => {
    if (requiresAuth && !user) {
      navigate("/signin");
    } else {
      navigate(href);
      setMobileOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-strong border-b border-border">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <img 
            src={logo} 
            alt="AI CineDB" 
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href, link. auth || false)}
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate("/search")}
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Notifications */}
          {user && (
            <Button variant="ghost" size="icon" className="rounded-full relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-xs">
                3
              </Badge>
            </Button>
          )}

          {/* User Menu or Sign In */}
          {user && profile ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <img
                    src={profile.avatar_url || `https://api. dicebear.com/7.x/avataaars/svg?seed=${profile. username}`}
                    alt={profile. username}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-strong">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/watchlist")}>
                  <Film className="mr-2 h-4 w-4" />
                  My Watchlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Content
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/signin")} className="hidden sm:inline-flex">
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon" className="rounded-full">
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass-strong">
              <div className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <button
                    key={link. href}
                    onClick={() => handleNavClick(link.href, link.auth || false)}
                    className="text-left text-lg font-medium text-foreground/80 hover:text-primary transition-colors py-2"
                  >
                    {link. label}
                  </button>
                ))}
                {!user && (
                  <>
                    <div className="border-t border-border my-4" />
                    <Button onClick={() => navigate("/signin")} className="w-full">
                      Sign In
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
};