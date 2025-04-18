
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive: boolean;
}

export function NavLink({ to, children, isActive }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "text-indigo-700 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/50"
          : "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30"
      )}
    >
      {children}
    </Link>
  );
}
