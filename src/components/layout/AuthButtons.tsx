
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  return (
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
  );
}
