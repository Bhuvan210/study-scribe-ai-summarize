
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { NavLogo } from "./NavLogo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { UserMenu } from "./UserMenu";
import { AuthButtons } from "./AuthButtons";

export function Navbar() {
  const { isAuthenticated } = useAuth();
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

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-950/80 dark:border-b dark:border-gray-800"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <NavLogo />
        {isAuthenticated && <DesktopNav />}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isAuthenticated ? <UserMenu /> : <AuthButtons />}
        </div>
      </div>
      {isAuthenticated && <MobileNav />}
    </nav>
  );
}
