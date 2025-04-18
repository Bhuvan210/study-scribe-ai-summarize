
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NavLogo() {
  return (
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
  );
}
