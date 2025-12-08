import { useEffect, useState } from "react";
import { collection, getDocs, query, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminStatsService, AdminStats } from "@/lib/admin-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Users, ShoppingBag, DollarSign, Activity, PackageCheck, Gavel, Ticket } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { AdminSearch } from "@/components/admin/AdminSearch";

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Load Stats INSTANTLY (Priority)
        const statsData = await AdminStatsService.getStats();
        setStats(statsData);
        setLoading(false); // Unblock UI immediately after stats

        // 2. Load Secondary Data (Background)
        // Helper para buscar produtos recentes com fallback se a ordenação falhar
        const getRecentProductsSafe = async () => {
          try {
            return await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"), limit(5)));
          } catch (e) {
            console.warn("Dashboard: Ordenação falhou, usando fallback sem ordem.");
            return await getDocs(query(collection(db, "products"), limit(5)));
          }
        };

        const [recentProductsSnap, categorySnap] = await Promise.all([
          getRecentProductsSafe(),
          getDocs(query(collection(db, "products"), limit(50)))
        ]);

        const recentProds = recentProductsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentProducts(recentProds);

        const categories: {[key: string]: number} = {};
        categorySnap.docs.forEach(doc => {
          const cat = doc.data().category || "Outros";
          categories[cat] = (categories[cat] || 0) + 1;
        });
        
        const pieData = Object.keys(categories).map(key => ({
          name: key,
          value: categories[key]
        }));
        setCategoryData(pieData);

      } catch (error) {
        console.error("Error loading dashboard:", error);
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
           <Skeleton className="h-10 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral do desempenho da plataforma.
          </p>
        </div>
        <div className="w-full md:w-auto">
          <AdminSearch />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Base de clientes ativa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">Inventário atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSales || 0}</div>
            <p className="text-xs text-muted-foreground">Transações completas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {stats?.totalRevenue?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Volume bruto</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-muted">
          <PackageCheck className="h-6 w-6 text-primary" />
          <span className="font-medium">Aprovar Produtos</span>
          <span className="text-xs text-muted-foreground font-normal">Verificar itens pendentes</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-muted">
          <Gavel className="h-6 w-6 text-yellow-500" />
          <span className="font-medium">Resolver Disputas</span>
          <span className="text-xs text-muted-foreground font-normal">3 casos abertos</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2 hover:bg-muted">
          <Ticket className="h-6 w-6 text-blue-500" />
          <span className="font-medium">Criar Cupom</span>
          <span className="text-xs text-muted-foreground font-normal">Campanhas de marketing</span>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Performance de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Jan', total: Math.floor(Math.random() * 5000) + 1000 },
                  { name: 'Fev', total: Math.floor(Math.random() * 5000) + 1000 },
                  { name: 'Mar', total: Math.floor(Math.random() * 5000) + 1000 },
                  { name: 'Abr', total: Math.floor(Math.random() * 5000) + 1000 },
                  { name: 'Mai', total: Math.floor(Math.random() * 5000) + 1000 },
                  { name: 'Jun', total: Math.floor(Math.random() * 5000) + 1000 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `€${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px' }}
                    cursor={{ fill: 'transparent' }}
                  />
                  <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Categorias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1 text-xs text-muted-foreground">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  {entry.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Produtos Adicionados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 hover:bg-muted/50 p-2 rounded transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded bg-muted overflow-hidden border">
                    {product.imageUrls?.[0] && (
                      <img src={product.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.userName || "Vendedor Anônimo"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium font-mono">€ {product.price}</p>
                  <div className="flex items-center justify-end gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${product.status === 'available' ? 'bg-green-500' : 'bg-muted-foreground'}`}></span>
                    <p className="text-xs text-muted-foreground capitalize">{product.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
