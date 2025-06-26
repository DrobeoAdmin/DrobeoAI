import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const [location] = useLocation();

  const navigation = [
    { name: "My Closet", href: "/closet" },
    { name: "AI Outfits", href: "/outfits" },
    { name: "Calendar", href: "/calendar" },
    { name: "Wishlist", href: "/wishlist" },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-2xl font-bold text-primary cursor-pointer">StyleSync</h1>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <span className={`px-3 py-2 text-sm font-medium transition-colors cursor-pointer ${
                    location === item.href || (item.href === "/closet" && location === "/")
                      ? "tab-active"
                      : "text-neutral hover:text-accent"
                  }`}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt="User" />
              <AvatarFallback className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                SJ
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
