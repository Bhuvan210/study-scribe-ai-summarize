
import { useLocation } from "react-router-dom";
import { Home, FileText, History, User } from "lucide-react";
import { NavLink } from "./NavLink";

export function MobileNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden border-t border-gray-100 dark:border-gray-800">
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
  );
}
