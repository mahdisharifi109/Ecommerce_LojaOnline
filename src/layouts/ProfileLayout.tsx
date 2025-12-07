import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  User, 
  Settings, 
  Heart, 
  ShoppingBag, 
  MessageSquare, 
  LogOut, 
  LayoutDashboard,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (!user) return null;

  const navigation = [
    { name: "Visão Geral", href: "/profile", icon: User },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mensagens", href: "/messages", icon: MessageSquare },
    { name: "Favoritos", href: "/favorites", icon: Heart },
    { name: "Compras", href: "/purchases", icon: ShoppingBag },
    { name: "Vendas", href: "/sales", icon: Package },
    { name: "Definições", href: "/settings", icon: Settings },
  ];

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          {/* User Mini Profile */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-border/50">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarImage src={user.photoURL || ""} />
              <AvatarFallback>{user.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </NavLink>
            ))}
            
            <div className="pt-4 mt-4 border-t border-border/50">
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Terminar Sessão
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}