import React, { useMemo, useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Star, ArrowUpRight, Plus, MessageCircle, Printer, TrendingUp, Clock } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Review } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

// Lazy load the chart
const SplineChart = React.lazy(() => import('@/components/spline-chart'));

export function CockpitDashboard() {
  const { user } = useAuth();
  const { products } = useProducts();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchReviews = async () => {
      try {
        const reviewsQuery = query(collection(db, 'reviews'), where("sellerId", "==", user.uid));
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const sellerReviews = reviewsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        setReviews(sellerReviews);
      } catch (error) {
        console.error("Erro ao carregar avaliações:", error);
      } finally {
        setLoadingReviews(false);
      }
    };
    
    fetchReviews();
  }, [user]);

  const userProducts = useMemo<Product[]>(() => {
    if (!user) return [];
    return products.filter((p: Product) => p.userId === user.uid);
  }, [products, user]);

  const totalRevenue = useMemo(() => {
    return userProducts
      .filter((product: Product) => product.status === 'vendido')
      .reduce((acc: number, product: Product) => acc + product.price, 0);
  }, [userProducts]);
  
  const activeListings = useMemo(() => {
      return userProducts.filter((p: Product) => p.status !== 'vendido').length;
  }, [userProducts]);

  const averageRating = useMemo(() => {
      if (reviews.length === 0) return 0;
        const total = reviews.reduce((acc: number, review: Review) => acc + review.rating, 0);
      return total / reviews.length;
  }, [reviews]);

  const monthlySalesData = useMemo(() => {
    const salesByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    monthNames.forEach(month => {
        const year = new Date().getFullYear();
        salesByMonth[`${month}-${year}`] = 0;
    });

    userProducts
      .filter((p: Product) => p.status === 'vendido' && p.createdAt)
      .forEach((product: Product) => {
        const saleDate = product.createdAt!.toDate();
        const month = monthNames[saleDate.getMonth()];
        const year = saleDate.getFullYear();
        const key = `${month}-${year}`;
        salesByMonth[key] = (salesByMonth[key] || 0) + product.price;
      });

    return Object.entries(salesByMonth)
      .map(([monthYear, revenue]) => ({
        month: monthYear.split('-')[0],
        revenue,
      }))
      .filter(item => item.revenue > 0)
      .slice(-6);
  }, [userProducts]);

  const firstName = user?.name?.split(' ')[0] || 'Visitante';

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto">
      {/* 1. Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
            Bom dia, {firstName}.
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            O mundo agradece por você circular a moda hoje. 🌿
          </p>
        </div>
        <Button asChild className="rounded-xl h-12 px-6 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-base">
          <Link to="/sell">
            <Plus className="mr-2 h-5 w-5" /> Novo Anúncio
          </Link>
        </Button>
      </div>

      {/* 2. Stats Overview (Neumorphism Light) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-soft bg-background hover:shadow-elevated transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                <TrendingUp className="h-3 w-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Rendimento Total</p>
            <h3 className="text-3xl font-serif font-medium mt-1">{totalRevenue.toFixed(2)} €</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-background hover:shadow-elevated transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                <Package className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">Ativos</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Peças à Venda</p>
            <h3 className="text-3xl font-serif font-medium mt-1">{activeListings}</h3>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-background hover:shadow-elevated transition-all duration-300 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <Star className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{reviews.length} avaliações</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Classificação Média</p>
            <h3 className="text-3xl font-serif font-medium mt-1">{averageRating.toFixed(1)}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Data Visualization (Spline Chart) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-soft bg-background rounded-3xl overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-xl font-normal">Tendência de Vendas</CardTitle>
            </CardHeader>
            <CardContent className="pl-0">
              <Suspense fallback={<div className="h-[300px] w-full flex items-center justify-center"><Skeleton className="h-[250px] w-[90%] rounded-xl" /></div>}>
                <SplineChart data={monthlySalesData} />
              </Suspense>
            </CardContent>
          </Card>

          {/* 4. Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-foreground">
                <Plus className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Novo Anúncio</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-foreground">
                <MessageCircle className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Mensagens</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl shadow-sm border border-border/50 hover:border-primary/30 hover:shadow-md transition-all group">
              <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform text-foreground">
                <Printer className="h-6 w-6" />
              </div>
              <span className="font-medium text-sm">Etiquetas</span>
            </button>
          </div>
        </div>

        {/* 5. Recent Activity Feed */}
        <div className="lg:col-span-1">
          <Card className="border-none shadow-soft bg-background h-full rounded-3xl">
            <CardHeader>
              <CardTitle className="font-serif text-xl font-normal">Atividade Recente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                {/* Activity Item 1 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/40 bg-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-foreground text-sm">Venda Realizada</div>
                      <time className="font-caveat font-medium text-xs text-muted-foreground">Hoje, 10:30</time>
                    </div>
                    <div className="text-muted-foreground text-xs">Vendeste "Casaco Vintage" por 45€</div>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/40 bg-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-foreground text-sm">Nova Pergunta</div>
                      <time className="font-caveat font-medium text-xs text-muted-foreground">Ontem, 18:45</time>
                    </div>
                    <div className="text-muted-foreground text-xs">Maria perguntou sobre as medidas das calças.</div>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-amber-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <Star className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-border/40 bg-secondary/10 shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-foreground text-sm">Nova Avaliação</div>
                      <time className="font-caveat font-medium text-xs text-muted-foreground">2 dias atrás</time>
                    </div>
                    <div className="text-muted-foreground text-xs">Recebeste 5 estrelas de João P.</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
