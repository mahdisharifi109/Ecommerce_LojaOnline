import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Trash2, 
  ExternalLink, 
  Loader2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Otimização: Limitar a 50 produtos para não travar o painel
      // Tenta query com ordenação primeiro
      try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (sortError) {
        console.warn("Ordenação falhou (provavelmente falta índice), tentando sem ordenação...", sortError);
        // Fallback: Query simples sem ordenação se o índice faltar
        const qFallback = query(collection(db, "products"), limit(50));
        const snapshotFallback = await getDocs(qFallback);
        const dataFallback = snapshotFallback.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(dataFallback);
        
        if (dataFallback.length > 0) {
             toast({ title: "Aviso", description: "Alguns recursos de ordenação podem estar indisponíveis temporariamente.", variant: "default" });
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({ title: "Erro ao carregar produtos", description: "Verifique sua conexão ou permissões.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (productId: string) => {
    try {
      await updateDoc(doc(db, "products", productId), {
        isVerified: true
      });
      setProducts(products.map(p => p.id === productId ? { ...p, isVerified: true } : p));
      toast({ title: "Produto Verificado", className: "bg-green-600 text-white" });
    } catch (error) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleReject = async (productId: string) => {
    if (!confirm("Tem certeza que deseja remover este produto? Esta ação é irreversível.")) return;
    
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter(p => p.id !== productId));
      toast({ title: "Produto Removido" });
    } catch (error) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Produtos</h2>
          <p className="text-muted-foreground">Gerencie o inventário global do marketplace.</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {products.length} Itens Totais
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventário</CardTitle>
          <CardDescription>Lista de todos os produtos cadastrados na plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Produto</th>
                  <th className="px-6 py-3 font-medium">Vendedor</th>
                  <th className="px-6 py-3 font-medium">Preço</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-muted overflow-hidden border">
                          {product.imageUrls?.[0] && (
                            <img src={product.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.userName || "Unknown"}
                    </td>
                    <td className="px-6 py-4 font-mono">
                      {product.price.toFixed(2)} €
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Badge variant={product.status === 'disponível' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                        {product.isVerified && (
                          <Badge variant="outline" className="border-blue-500 text-blue-500">
                            Verificado
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {product.createdAt?.toDate ? formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true, locale: pt }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => window.open(`/product/${product.id}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        
                        {!product.isVerified && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/30"
                            onClick={() => handleVerify(product.id)}
                            title="Aprovar / Verificar"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                          onClick={() => handleReject(product.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
