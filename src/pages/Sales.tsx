import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { Loader2, Package, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import firestoreService from "@/lib/firestore-service";
import { where } from "firebase/firestore";

export default function Sales() {
  const { user } = useAuth();
  const [activeProducts, setActiveProducts] = useState<Product[]>([]);
  const [soldProducts, setSoldProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSales() {
      if (!user?.uid) return;

      try {
        // Fetch Active Listings
        const { products: active } = await firestoreService.Products.list({
          filters: [
            where("userId", "==", user.uid),
            where("status", "==", "disponível")
          ]
        });
        setActiveProducts(active);

        // Fetch Sold Listings
        // Note: In a real app, we might query a 'sales' collection, but for now we check products marked as sold
        const { products: sold } = await firestoreService.Products.list({
          filters: [
            where("userId", "==", user.uid),
            where("status", "==", "vendido")
          ]
        });
        setSoldProducts(sold);

      } catch (error) {
        console.error("Error fetching sales:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSales();
  }, [user?.uid]);

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
          <h1 className="font-serif text-3xl font-medium">As minhas vendas</h1>
          <p className="text-muted-foreground">Gere os teus anúncios e vendas</p>
        </div>
        <Button asChild>
          <Link to="/sell">
            <Plus className="mr-2 h-4 w-4" />
            Vender Artigo
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="active">À Venda ({activeProducts.length})</TabsTrigger>
          <TabsTrigger value="sold">Vendidos ({soldProducts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {activeProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/5 py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-medium">Não tens artigos à venda</h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Dá uma nova vida às tuas roupas e ganha dinheiro extra.
              </p>
              <Button asChild>
                <Link to="/sell">Começar a Vender</Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sold" className="space-y-6">
          {soldProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {soldProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/5 py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 font-serif text-xl font-medium">Ainda não vendeste nada</h3>
              <p className="mb-6 max-w-sm text-muted-foreground">
                Assim que venderes um artigo, ele aparecerá aqui.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}