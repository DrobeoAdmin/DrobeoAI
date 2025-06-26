import { Link, useLocation } from "wouter";
import { Home, ShirtIcon, Sparkles, Calendar, User } from "lucide-react";

export default function MobileNav() {
  const [location] = useLocation();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Closet", href: "/closet", icon: ShirtIcon },
    { name: "AI", href: "/outfits", icon: Sparkles },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5 h-16">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.name} href={item.href}>
              <a className={`flex flex-col items-center justify-center transition-colors ${
                isActive ? "text-accent" : "text-neutral hover:text-accent"
              }`}>
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.name}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
