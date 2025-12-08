import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs, doc, updateDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Truck, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

interface Order {
  id: string;
  userId: string;
  userName?: string;
  totalAmount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: any;
  items: any[];
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Try with sort first
      try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(50));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(data);
      } catch (sortError) {
        console.warn("Sort failed, trying fallback", sortError);
        const qFallback = query(collection(db, "orders"), limit(50));
        const snapshotFallback = await getDocs(qFallback);
        const dataFallback = snapshotFallback.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        setOrders(dataFallback);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({ title: "Erro", description: "Não foi possível carregar as encomendas.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast({ title: "Status Atualizado", description: `Encomenda marcada como ${newStatus}.` });
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao atualizar status.", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-green-500">Pago</Badge>;
      case 'shipped': return <Badge className="bg-blue-500">Enviado</Badge>;
      case 'delivered': return <Badge className="bg-gray-500">Entregue</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelado</Badge>;
      default: return <Badge variant="outline">Pendente</Badge>;
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
          <h2 className="text-3xl font-bold tracking-tight">Encomendas</h2>
          <p className="text-muted-foreground">Gerencie os pedidos e envios.</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {orders.length} Pedidos Recentes
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Acompanhe o status de cada transação.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">ID / Cliente</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Data</th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium">#{order.id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">{order.userName || "Cliente"}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">
                      € {order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {order.createdAt?.seconds ? formatDistanceToNow(new Date(order.createdAt.seconds * 1000), { addSuffix: true, locale: pt }) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {order.status === 'paid' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'shipped')}>
                            <Truck className="h-4 w-4 mr-2" />
                            Marcar Enviado
                          </Button>
                        )}
                        {order.status === 'shipped' && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(order.id, 'delivered')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Concluir
                          </Button>
                        )}
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
