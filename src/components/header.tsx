import React, { useState, Suspense, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Menu, Search, X, Heart, Bell, MessageCircle, Tag, Info, CheckCircle2, ShieldAlert } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import { AnimatePresence, motion } from "framer-motion";
import { SearchOverlay } from "@/components/search-overlay";
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { pt } from 'date-fns/locale';
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DynamicSideCart = React.lazy(() => import("./side-cart"));

const menuItems = [
  { name: "Novidades", href: "/catalog?sort=newest", image: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=1000&auto=format&fit=crop" },
  { name: "Roupa", href: "/catalog?category=Roupa", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1000&auto=format&fit=crop" },
  { name: "Calçado", href: "/catalog?category=Calçado", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000&auto=format&fit=crop" },
  { name: "Acessórios", href: "/catalog?category=Acessórios", image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800&auto=format&fit=crop" },
  { name: "Vender", href: "/sell", image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1000&auto=format&fit=crop" },
];

export function Header() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setIsAdmin(true);
          }
        } catch (e) {
          console.error("Error checking admin", e);
        }
      } else {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, [user]);

  // Close menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location]);

  const itemCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <>
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
          scrolled ? "bg-background/80 backdrop-blur-md py-3 border-b border-border/50" : "bg-transparent py-6"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          {/* Left: Menu Trigger */}
          <div className="flex items-center gap-6 w-1/3">
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="group flex items-center justify-center text-foreground hover:text-primary transition-colors p-1"
              aria-label="Menu"
            >
              <Menu className="h-6 w-6 stroke-[1.5]" />
            </button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="md:hidden text-foreground hover:text-primary transition-colors p-1"
            >
               <Search className="h-6 w-6 stroke-[1.5]" />
            </button>
          </div>

          {/* Center: Logo */}
          <div className="w-1/3 flex justify-center items-center">
            <Link to="/" className="relative z-50 flex items-center">
              <Logo className="h-8 md:h-10 w-auto" />
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-6 w-1/3">
            <div className="hidden md:flex items-center gap-6">
               <button 
                 onClick={() => setIsSearchOpen(true)}
                 className="text-foreground hover:text-primary transition-colors p-1"
               >
                 <Search className="h-6 w-6 stroke-[1.5]" />
               </button>
               {user ? (
                 <>
                   <Link to="/messages" className="text-foreground hover:text-primary transition-colors relative p-1" aria-label="Mensagens">
                     <MessageCircle className="h-6 w-6 stroke-[1.5]" />
                     <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                   </Link>

                   <DropdownMenu>
                     <DropdownMenuTrigger asChild>
                       <button className="text-foreground hover:text-primary transition-colors relative outline-none p-1" aria-label="Notificações">
                         <Bell className="h-6 w-6 stroke-[1.5]" />
                         {unreadCount > 0 && (
                           <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
                         )}
                       </button>
                     </DropdownMenuTrigger>
                     <DropdownMenuContent align="end" className="w-80 p-0 rounded-xl shadow-xl border-border/40 bg-background/95 backdrop-blur-sm">
                       <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
                         <span className="font-medium text-sm">Notificações</span>
                         {unreadCount > 0 && (
                           <span 
                             className="text-xs text-muted-foreground cursor-pointer hover:text-primary"
                             onClick={() => markAllAsRead()}
                           >
                             Marcar todas como lidas
                           </span>
                         )}
                       </div>
                       <div className="max-h-[300px] overflow-y-auto py-1">
                         {notifications.length === 0 ? (
                           <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                             Nenhuma notificação recente
                           </div>
                         ) : (
                           notifications.map((notification) => (
                             <DropdownMenuItem 
                               key={notification.id} 
                               className="px-4 py-3 cursor-pointer hover:bg-secondary/30 focus:bg-secondary/30 gap-3 items-start"
                               onClick={() => markAsRead(notification.id)}
                             >
                               {notification.type === 'offer' && (
                                 <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                                   <Tag className="h-4 w-4" />
                                 </div>
                               )}
                               {(notification.type === 'system' || notification.type === 'info') && (
                                 <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600 mt-0.5">
                                   <Info className="h-4 w-4" />
                                 </div>
                               )}
                               {notification.type === 'sale' && (
                                 <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 text-amber-600 mt-0.5">
                                   <CheckCircle2 className="h-4 w-4" />
                                 </div>
                               )}
                               
                               <div className="flex-1 space-y-1">
                                 <p className="text-sm leading-none font-medium">{notification.title}</p>
                                 <p className="text-xs text-muted-foreground">{notification.message}</p>
                                 <span className="text-[10px] text-muted-foreground/70">
                                   {notification.createdAt?.toDate ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'Agora'}
                                 </span>
                               </div>
                               {!notification.read && (
                                 <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                               )}
                             </DropdownMenuItem>
                           ))
                         )}
                       </div>
                       <div className="p-2 border-t border-border/40 text-center">
                         <Link to="/notifications" className="text-xs font-medium text-primary hover:underline">
                           Ver todas as notificações
                         </Link>
                       </div>
                     </DropdownMenuContent>
                   </DropdownMenu>

                   <Link to="/profile" className="text-foreground hover:text-primary transition-colors p-1">
                     <User className="h-6 w-6 stroke-[1.5]" />
                   </Link>
                   
                   {isAdmin && (
                     <Link to="/admin" className="text-red-500 hover:text-red-600 transition-colors p-1" title="Painel Admin">
                       <ShieldAlert className="h-6 w-6 stroke-[1.5]" />
                     </Link>
                   )}
                 </>
               ) : (
                 <Link to="/login" className="text-foreground hover:text-primary transition-colors p-1" aria-label="Entrar">
                   <User className="h-6 w-6 stroke-[1.5]" />
                 </Link>
               )}
            </div>

            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative text-foreground hover:text-primary transition-colors p-1"
            >
              <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Menu Header */}
            <div className="container mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
              <div className="text-sm font-medium text-muted-foreground">Navegação</div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="h-6 w-6 stroke-[1.5]" />
              </button>
            </div>

            {/* Menu Content */}
            <div className="flex-1 container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center md:items-stretch py-8 md:py-16 gap-8 md:gap-16">
              
              {/* Links List */}
              <nav className="flex-1 flex flex-col justify-center items-start space-y-4 md:space-y-8">
                {menuItems.map((item) => (
                  <Link 
                    key={item.name}
                    to={item.href}
                    className="group relative text-4xl md:text-6xl lg:text-7xl font-heading font-light text-foreground hover:text-primary transition-colors"
                    onMouseEnter={() => setHoveredItem(item.image)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="relative z-10">{item.name}</span>
                    <span className="absolute left-0 bottom-2 w-0 h-[2px] bg-primary transition-all duration-500 ease-out group-hover:w-full" />
                  </Link>
                ))}
              </nav>

              {/* Dynamic Image (Desktop Only) */}
              <div className="hidden md:block w-1/2 lg:w-1/3 relative h-[60vh] overflow-hidden rounded-lg bg-muted">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={hoveredItem || "default"}
                    src={hoveredItem || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop"}
                    alt="Menu Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-black/10" />
              </div>
            </div>

            {/* Menu Footer */}
            <div className="container mx-auto px-4 md:px-8 py-8 border-t border-border flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground gap-4">
              <div className="flex gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Instagram</a>
                <a href="#" className="hover:text-foreground transition-colors">Pinterest</a>
                <a href="#" className="hover:text-foreground transition-colors">Fale Conosco</a>
              </div>
              <p>Feito com amor e consciência 🌿</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Cart */}
      <Suspense fallback={null}>
        <DynamicSideCart open={isCartOpen} onOpenChange={setIsCartOpen} />
      </Suspense>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
