import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Product } from "@/lib/types";
import { StarRating } from "@/components/ui/star-rating";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { user, toggleFavorite } = useAuth();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoadingFav, setIsLoadingFav] = useState(false);

  const isFavorite = user?.favorites?.includes(product.id) || false;

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast({
        title: "Faça login",
        description: "Precisa de estar autenticado para guardar favoritos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingFav(true);

    try {
      await toggleFavorite(product.id);
      
      if (!isFavorite) {
        toast({
          title: "Guardado ❤️",
          description: "Adicionado à sua lista de desejos.",
          className: "bg-rose-50 border-rose-200 text-rose-800",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar os favoritos.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingFav(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR"
    }).format(price);
  };

  return (
    <Link 
      to={`/product/${product.id}`}
      className={cn("group block h-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="h-full overflow-hidden border-0 bg-transparent shadow-none transition-all duration-300">
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-secondary/20">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-secondary/10 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 opacity-20" />
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.condition === "novo_com_etiqueta" && (
              <Badge className="w-fit bg-white/80 text-foreground backdrop-blur-md hover:bg-white/90 border-0 shadow-sm font-medium px-3 py-1">
                Novo
              </Badge>
            )}
            {product.isVerified && (
              <Badge className="w-fit bg-emerald-500/90 text-white backdrop-blur-md hover:bg-emerald-600/90 border-0 shadow-sm font-medium px-3 py-1">
                Verificado
              </Badge>
            )}
          </div>

          {/* Favorite Button Overlay */}
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFav}
            className={cn(
              "absolute right-3 top-3 z-10 rounded-full p-2.5 transition-all duration-300 focus:outline-none",
              isFavorite 
                ? "bg-white text-rose-500 shadow-md scale-100" 
                : "bg-black/20 text-white backdrop-blur-sm hover:bg-white hover:text-rose-500 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
            )}
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-all duration-300", 
                isFavorite && "fill-current animate-in zoom-in duration-300"
              )} 
            />
          </button>

          {/* Quick Action Overlay */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 flex justify-center",
            isHovered ? "opacity-100" : "opacity-0"
          )}>
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full bg-white/90 text-black hover:bg-white backdrop-blur-sm font-medium shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
            >
              Ver Detalhes
            </Button>
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-4 pt-4 space-y-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-serif text-lg font-medium leading-tight text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <span className="font-medium text-lg whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="line-clamp-1">{product.brand || "Marca não especificada"}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/50 border border-border/50">
              {product.sizes?.[0] || "TU"}
            </span>
          </div>

          {/* Rating */}
          {product.rating !== undefined && (
            <div className="flex items-center gap-1 pt-1">
              <StarRating rating={product.rating} size="xs" readonly />
              <span className="text-xs text-muted-foreground">({product.reviewCount || 0})</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
