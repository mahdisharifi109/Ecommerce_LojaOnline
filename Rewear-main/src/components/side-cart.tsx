import { useCart } from "@/context/cart-context";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Image from "@/components/ui/image";
import { memo } from "react";
import { Minus, Plus, Trash2, ShoppingBag, X, Leaf, ArrowRight, ShieldCheck, Truck, RefreshCw } from "lucide-react"; 
import { Progress } from "@/components/ui/progress";

const CROSS_SELL_PRODUCTS = [
  { id: 'cs1', name: 'Cinto Vintage Couro', price: 25, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=200&auto=format&fit=crop' },
  { id: 'cs2', name: 'Lenço de Seda', price: 15, image: 'https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=200&auto=format&fit=crop' },
]; 

interface SideCartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SideCartComponent({ open, onOpenChange }: SideCartProps) {
  const { cartItems, removeFromCart, updateItemQuantity, subtotal, cartCount } = useCart();
  
  // Gamification: Free Shipping / Carbon Zero Goal
  const FREE_SHIPPING_THRESHOLD = 100;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md bg-background/80 backdrop-blur-xl border-l border-border/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <span className="font-heading text-lg font-medium">
            O Teu Carrinho {cartCount > 0 && `(${cartCount})`}
          </span>
          {/* Redundant Close Button Removed - Using Sheet's default close button */}
        </div>

        {cartItems.length > 0 ? (
          <>
            {/* Carbon Zero / Free Shipping Progress - REMOVED */}
            
            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-8">
                {cartItems.map(item => (
                  <li key={item.id} className="flex gap-5 group">
                    <div className="h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-muted/30 relative shadow-sm">
                      <Image
                        src={item.product.imageUrls[0]}
                        alt={item.product.name}
                        width={96}
                        height={112}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-1">
                      <div>
                        <Link 
                          to={`/product/${item.product.id}`}
                          className="font-heading text-lg leading-tight text-foreground hover:text-primary transition-colors line-clamp-2"
                          onClick={() => onOpenChange(false)}
                        >
                          {item.product.name}
                        </Link>
                        <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground font-body uppercase tracking-wide">
                          {item.size && <span className="bg-secondary/30 px-1.5 py-0.5 rounded">{item.size}</span>}
                          <span>{item.product.condition}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 border border-border/50 rounded-full px-2 py-1 bg-background/50">
                          <button 
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted transition-colors"
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-4 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                          <button 
                            className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-muted transition-colors"
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-heading text-lg font-medium text-foreground">
                            {(item.product.price * item.quantity).toFixed(0)}€
                          </span>
                          <button 
                            className="text-muted-foreground/50 hover:text-destructive transition-colors p-1"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4 stroke-[1.5]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer */}
            <div className="border-t border-border/40 bg-secondary/5 p-6 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Envio</span>
                  <span className="text-green-600 font-medium">
                    {progress === 100 ? "Grátis" : "Calculado no checkout"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <span className="font-heading text-lg font-medium">Total</span>
                <span className="font-heading text-xl font-medium">{subtotal.toFixed(2)}€</span>
              </div>
              <SheetClose asChild>
                <Button asChild className="w-full h-12 text-base rounded-full shadow-soft hover:shadow-elevated transition-all group">
                  <Link to="/checkout">
                    Finalizar Compra
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </SheetClose>
              
              {/* Trust Badges */}
              <div className="flex justify-between pt-4 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground/70" />
                  <span>Compra Segura</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Leaf className="h-4 w-4 text-muted-foreground/70" />
                  <span>Carbono Zero</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RefreshCw className="h-4 w-4 text-muted-foreground/70" />
                  <span>Devolução Fácil</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center space-y-6 p-8 text-center">
            <div className="relative">
              <div className="absolute -inset-4 rounded-full bg-primary/5 animate-pulse" />
              <ShoppingBag className="h-16 w-16 text-muted-foreground/50 relative z-10" strokeWidth={1} />
            </div>
            <div className="space-y-2 max-w-xs">
              <h3 className="font-heading text-xl font-medium">O teu carrinho está leve como uma pluma 🪶</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Parece que ainda não encontraste a peça perfeita. Explora a nossa coleção de tesouros únicos.
              </p>
            </div>
            <SheetClose asChild>
              <Button variant="outline" className="rounded-full px-8 border-primary/20 hover:border-primary/50 hover:bg-primary/5">
                Explorar Coleção
              </Button>
            </SheetClose>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export const SideCart = memo(SideCartComponent, (prev, next) => 
  prev.open === next.open && prev.onOpenChange === next.onOpenChange
);

export default SideCart;