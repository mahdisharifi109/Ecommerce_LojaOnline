import { Link, Outlet, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Settings, 
  LogOut, 
  ShieldCheck,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const menuItems = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
  { icon: Package, label: "Produtos", path: "/admin/products" },
  { icon: Users, label: "Utilizadores", path: "/admin/users" },
  { icon: Settings, label: "Configurações", path: "/admin/settings" },
];

const SidebarContent = ({ onNavigate, logout }: { onNavigate?: () => void, logout: () => void }) => {
  const location = useLocation();
  return (
  <div className="flex h-full flex-col gap-2">
    <div className="flex h-14 items-center border-b px-6">
      <Link to="/" className="flex items-center gap-2 font-semibold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        <span className="">Rewear Admin</span>
      </Link>
    </div>
    <div className="flex-1 overflow-auto py-2">
      <nav className="grid items-start px-4 text-sm font-medium">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                isActive 
                  ? "bg-muted text-primary" 
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
    <div className="mt-auto p-4 border-t">
      <Button 
        variant="outline" 
        className="w-full justify-start gap-2"
        onClick={() => logout()}
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  </div>
)};

export default function AdminLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <SidebarContent logout={logout} />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px]">
          <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              <SidebarContent onNavigate={() => setIsMobileOpen(false)} logout={logout} />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">
              {menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-green-500" />
             <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
