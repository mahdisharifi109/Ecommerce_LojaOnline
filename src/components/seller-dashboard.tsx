import React, { useMemo, useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/context/auth-context';
import { useProducts } from '@/context/product-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, Star, ArrowUpRight, Camera, PenTool, Heart } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Product, Review } from '@/lib/types';
import { StarRating } from '@/components/ui/star-rating';
import { Button } from '@/components/ui/button';

// Code-split Recharts - import all at once to avoid type issues
const RechartsChart = React.lazy(() => import('@/components/recharts-chart'));

export function SellerDashboard() {
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

  // --- LÓGICA NOVA PARA O GRÁFICO ---
  const monthlySalesData = useMemo(() => {
    const salesByMonth: { [key: string]: number } = {};
    const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

    // Inicializa todos os meses com 0
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

    // Formata os dados para o gráfico, mostrando apenas os últimos 6 meses com vendas
    return Object.entries(salesByMonth)
      .map(([monthYear, revenue]) => ({
        month: monthYear.split('-')[0],
        revenue,
      }))
      .filter(item => item.revenue > 0) // Podes remover isto se quiseres mostrar meses com 0 vendas
      .slice(-6); // Mostra apenas os últimos 6 meses de dados
  }, [userProducts]);
  // --- FIM DA LÓGICA NOVA ---


  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-8">
        <div className="space-y-2">
          <h1 className="font-heading text-4xl md:text-5xl font-medium tracking-tight text-foreground">
            Estúdio de Criação
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl leading-relaxed">
            Bem-vindo de volta, <span className="text-foreground font-medium">{user?.name}</span>. 
            Sua curadoria está a redefinir o luxo sustentável.
          </p>
        </div>
        <div className="flex gap-3">
           <Button className="rounded-full h-12 px-8 bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all shadow-soft hover:shadow-elevated group">
             <Camera className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
             Nova Peça
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-none shadow-soft bg-gradient-to-br from-card/50 to-secondary/5 backdrop-blur-sm hover:shadow-elevated transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Receita Total
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
               <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-4xl md:text-5xl font-medium text-foreground mt-2">
              {totalRevenue.toFixed(0)}<span className="text-2xl align-top opacity-60">€</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-green-600 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>+20.1% este mês</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-card/50 to-secondary/5 backdrop-blur-sm hover:shadow-elevated transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Peças Ativas
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground group-hover:bg-secondary/30 transition-colors">
               <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="font-heading text-4xl md:text-5xl font-medium text-foreground mt-2">
              {activeListings}
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-body">
              {activeListings === 0 ? "Sua coleção aguarda o primeiro tesouro" : "Peças aguardando novo lar"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-soft bg-gradient-to-br from-card/50 to-secondary/5 backdrop-blur-sm hover:shadow-elevated transition-all duration-500 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              Reputação
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent-foreground group-hover:bg-accent/20 transition-colors">
               <Star className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-3 mt-2">
               <div className="font-heading text-4xl md:text-5xl font-medium text-foreground">
                 {loadingReviews ? '—' : averageRating.toFixed(1)}
               </div>
               <StarRating rating={averageRating} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-body">
              Baseado em {reviews.length} avaliações de compradores
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-7">
        {/* Chart Section */}
        <Card className="col-span-4 border-none shadow-soft bg-card/30 overflow-hidden">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-medium">Desempenho de Vendas</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {monthlySalesData.length > 0 ? (
               <div className="h-[300px] w-full">
                 <Suspense fallback={<div className="h-full w-full animate-pulse bg-muted/20 rounded-lg" />}>
                   <RechartsChart data={monthlySalesData} />
                 </Suspense>
               </div>
            ) : (
               <div className="h-[300px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border/50 rounded-xl bg-secondary/5">
                 <div className="h-16 w-16 rounded-full bg-background shadow-sm flex items-center justify-center mb-4">
                   <DollarSign className="h-8 w-8 text-muted-foreground/50" />
                 </div>
                 <h3 className="font-heading text-lg font-medium text-foreground mb-2">Sua jornada começa aqui</h3>
                 <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                   Ainda não há dados de vendas. Publique sua primeira peça e veja seu impacto crescer.
                 </p>
               </div>
            )}
          </CardContent>
        </Card>
        
        {/* Tips Section */}
        <Card className="col-span-3 border-none shadow-soft bg-card/30">
          <CardHeader>
            <CardTitle className="font-heading text-xl font-medium">Arte da Curadoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex gap-5 items-start group">
                <div className="h-12 w-12 rounded-2xl bg-background shadow-sm flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-medium text-foreground">Luz Natural é Tudo</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Fotografe suas peças perto de uma janela. A luz suave valoriza as texturas e cores reais.
                  </p>
                </div>
              </div>
              <div className="flex gap-5 items-start group">
                <div className="h-12 w-12 rounded-2xl bg-background shadow-sm flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                  <PenTool className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-medium text-foreground">Conte a História</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Descreva onde usou a peça ou por que a amou. Emoção vende mais que apenas medidas.
                  </p>
                </div>
              </div>
              <div className="flex gap-5 items-start group">
                <div className="h-12 w-12 rounded-2xl bg-background shadow-sm flex items-center justify-center shrink-0 text-primary group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-lg font-medium text-foreground">Detalhes Importam</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Mostre etiquetas, costuras e pequenos defeitos. Honestidade cria confiança e fidelidade.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading text-2xl font-medium">O que dizem sobre você</h2>
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground">Ver todas</Button>
        </div>
        
        {loadingReviews ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted/20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 border border-dashed border-border/50 rounded-xl text-center bg-secondary/5">
            <p className="text-muted-foreground font-body">Sua reputação será construída aqui.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <Card key={review.id} className="border-none shadow-soft bg-card/40 hover:bg-card/60 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-heading font-bold text-xs">
                        {review.buyerName.charAt(0)}
                      </div>
                      <span className="font-medium font-heading text-base">{review.buyerName}</span>
                    </div>
                    <StarRating rating={review.rating} size="xs" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 italic leading-relaxed">"{review.comment}"</p>
                  <p className="text-xs text-muted-foreground/50 mt-4">
                    {/* Mock date if not available */}
                    Há 2 dias
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}