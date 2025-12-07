import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Loader2, ShoppingBag, Calendar, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import firestoreService from "@/lib/firestore-service";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define Purchase type locally if not exported, or import if available
// Assuming Purchase type structure based on firestore-service usage
interface Purchase {
  id: string;
  date: any; // Timestamp
  total: number;
  status: 'pending' | 'completed' | 'shipped' | 'cancelled';
  items: Array<{
    productId: string;
    name: string;
    price: number;
    image?: string;
  }>;
  sellerName?: string;
}

export default function Purchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      if (!user?.uid) return;

      try {
        const data = await firestoreService.Transactions.getPurchasesByUser(user.uid);
        setPurchases(data as unknown as Purchase[]);
      } catch (error) {
        console.error("Error fetching purchases:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPurchases();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-emerald-500 hover:bg-emerald-600">Concluído</Badge>;
      case 'shipped':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Enviado</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium">As minhas compras</h1>
          <p className="text-muted-foreground">Histórico de encomendas</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/catalog">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuar a Comprar
          </Link>
        </Button>
      </div>

      {purchases.length > 0 ? (
        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id} className="overflow-hidden border-border/50 bg-card/50 transition-all hover:bg-card hover:shadow-sm">
              <CardHeader className="border-b border-border/50 bg-secondary/5 p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {purchase.date ? format(purchase.date.toDate(), "d 'de' MMMM, yyyy", { locale: pt }) : "Data desconhecida"}
                    </div>
                    <div>
                      ID: <span className="font-mono text-xs">{purchase.id.substring(0, 8)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-foreground">
                      {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(purchase.total)}
                    </span>
                    {getStatusBadge(purchase.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {purchase.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-md bg-secondary/20">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground/30" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(item.price)}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/product/${item.productId}`}>
                          Ver Artigo <ChevronRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/5 py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary/20">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 font-serif text-xl font-medium">Ainda não fizeste compras</h3>
          <p className="mb-6 max-w-sm text-muted-foreground">
            Explora o nosso catálogo e encontra peças únicas.
          </p>
          <Button asChild>
            <Link to="/catalog">Ir para o Catálogo</Link>
          </Button>
        </div>
      )}
    </div>
  );
}