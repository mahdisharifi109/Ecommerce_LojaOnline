import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import firestoreService from "@/lib/firestore-service";
import { documentId, where } from "firebase/firestore";

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      if (!user?.favorites || user.favorites.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      try {
        // Firestore 'in' limit is 10. For larger lists, we need to batch or fetch individually.
        // For this MVP, we'll fetch in batches of 10.
        const favoriteIds = user.favorites;
        const chunks = [];
        for (let i = 0; i < favoriteIds.length; i += 10) {
          chunks.push(favoriteIds.slice(i, i + 10));
        }

        const allProducts: Product[] = [];
        for (const chunk of chunks) {
          const { products } = await firestoreService.Products.list({
            filters: [where(documentId(), "in", chunk)]
          });
          allProducts.push(...products);
        }

        setFavorites(allProducts);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [user?.favorites]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium">Favoritos</h1>
          <p className="text-muted-foreground">
            {favorites.length} {favorites.length === 1 ? "artigo guardado" : "artigos guardados"}
          </p>
        </div>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {favorites.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/5 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-medium">Ainda não tens favoritos</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Guarda os artigos que mais gostas para não os perderes de vista.
          </p>
          <Button asChild>
            <Link to="/catalog">Explorar Catálogo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}