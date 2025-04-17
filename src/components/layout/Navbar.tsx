
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  History,
  LogOut,
  User,
  ChevronDown,
  Home,
  FileText,
  Settings,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center">
          <div className="relative">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="px-1 py-0 text-[8px] font-bold">AI</Badge>
            </div>
          </div>
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            StudyScribe
          </span>
        </Link>
        
        {isAuthenticated && (
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" isActive={isActive("/")}>
              <Home className="h-4 w-4 mr-1" />
              Home
            </NavLink>
            
            <NavLink to="/summarize" isActive={isActive("/summarize")}>
              <FileText className="h-4 w-4 mr-1" />
              Summarize
            </NavLink>
            
            <NavLink to="/summaries" isActive={isActive("/summaries")}>
              <History className="h-4 w-4 mr-1" />
              My Summaries
            </NavLink>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 border-2 hover:border-indigo-300 transition-colors relative group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10 flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-bold mr-1">
                      {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline max-w-[150px] truncate text-sm">
                      {user?.email}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 opacity-50" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    to="/profile"
                    className="flex cursor-pointer items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/summaries"
                    className="flex cursor-pointer items-center"
                  >
                    <History className="mr-2 h-4 w-4" />
                    My Summaries
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex cursor-pointer items-center"
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" className="hidden sm:flex" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-colors"
                asChild
              >
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isAuthenticated && (
        <div className="md:hidden border-t border-gray-100">
          <div className="container flex justify-between py-2">
            <NavLink to="/" isActive={isActive("/")}>
              <Home className="h-4 w-4" />
              <span className="sr-only">Home</span>
            </NavLink>
            
            <NavLink to="/summarize" isActive={isActive("/summarize")}>
              <FileText className="h-4 w-4" />
              <span className="sr-only">Summarize</span>
            </NavLink>
            
            <NavLink to="/summaries" isActive={isActive("/summaries")}>
              <History className="h-4 w-4" />
              <span className="sr-only">My Summaries</span>
            </NavLink>
            
            <NavLink to="/profile" isActive={isActive("/profile")}>
              <User className="h-4 w-4" />
              <span className="sr-only">Profile</span>
            </NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

function NavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "text-indigo-700 bg-indigo-50"
          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50"
      )}
    >
      {children}
    </Link>
  );
}
