
import { useLocation } from "react-router-dom";
import { Home, FileText, History } from "lucide-react";
import { NavLink } from "./NavLink";

export function DesktopNav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
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
  );
}
