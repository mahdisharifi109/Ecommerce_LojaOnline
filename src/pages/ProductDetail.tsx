import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { 
  ShoppingCart, Heart, Share2, ChevronLeft, User, 
  ShieldCheck, MessageCircle, Lock, AlertCircle 
} from "lucide-react";

import { useProducts } from "@/context/product-context";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { optimizeImageUrl } from "@/hooks/use-image-optimization";
import { reviewService, type Review } from "@/lib/reviewService";
import type { Product } from "@/lib/types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "@/components/ui/image";
import { StarRating, RatingSummary } from "@/components/ui/star-rating";

// --- Sub-components ---

const ProductGallery = ({ product }: { product: Product }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isSold = product.status === "vendido";

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted/30 shadow-sm">
        <Image
          src={optimizeImageUrl(product.imageUrls?.[selectedIndex] || "", 800)}
          alt={product.name}
          fill
          priority
          className="object-cover transition-transform duration-500 hover:scale-105"
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <Badge variant="destructive" className="px-4 py-2 text-lg font-bold uppercase tracking-widest">
              Vendido
            </Badge>
          </div>
        )}
      </div>

      {product.imageUrls && product.imageUrls.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {product.imageUrls.map((url: string, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-transparent hover:border-border"
              }`}
            >
              <Image
                src={optimizeImageUrl(url, 100)}
                alt={`${product.name} - view ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ProductInfo = ({ product }: { product: Product }) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {product.isVerified && (
            <Badge className="bg-blue-600 hover:bg-blue-700 gap-1">
              <ShieldCheck className="h-3 w-3" /> Verificado
            </Badge>
          )}
          <Badge variant="secondary" className="font-medium">{product.category}</Badge>
          <Badge variant="outline" className="uppercase text-xs tracking-wider">{product.condition}</Badge>
        </div>
        
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">
            {product.price.toFixed(2)} €
          </span>
        </div>
      </div>

      <Separator />

      <div className="prose prose-sm text-muted-foreground">
        <h3 className="text-foreground font-semibold mb-2">Sobre este artigo</h3>
        <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <Card className="bg-muted/30 border-none shadow-none">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Marca</span>
            <p className="font-medium text-foreground">{product.brand || "N/A"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-none shadow-none">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tamanho</span>
            <p className="font-medium text-foreground">{product.sizes?.join(", ") || "N/A"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-none shadow-none">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Material</span>
            <p className="font-medium text-foreground">{product.material || "N/A"}</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30 border-none shadow-none">
          <CardContent className="p-4 space-y-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publicado</span>
            <p className="font-medium text-foreground">
              {product.createdAt?.toDate ? formatDistanceToNow(product.createdAt.toDate(), { addSuffix: true, locale: pt }) : "Recentemente"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const SellerCard = ({ product, isOwner }: { product: Product, isOwner: boolean }) => {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Avatar className="h-12 w-12 border">
          <AvatarImage src={product.userAvatar} />
          <AvatarFallback><User className="h-6 w-6 text-muted-foreground" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <Link to={`/profile/${product.userId}`} className="block font-medium hover:underline truncate">
            {product.userName || "Vendedor"}
          </Link>
          <p className="text-xs text-muted-foreground">Membro da comunidade</p>
        </div>
        {!isOwner && (
          <Button variant="outline" size="sm" asChild>
            <Link to={`/messages?seller=${product.userId}&product=${product.id}`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contactar
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { user, toggleFavorite } = useAuth();
  const { toast } = useToast();
  
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = useMemo(() => products.find(p => p.id === id), [products, id]);

  useEffect(() => {
    if (product?.id) {
      reviewService.getReviews(product.id).then(setReviews);
      if (user) {
        reviewService.getUserReview(product.id, user.uid).then(setUserReview);
      }
    }
  }, [product?.id, user]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  }, [reviews]);

  const ratingDistribution = useMemo(() => {
    const dist: {[key: number]: number} = {1:0, 2:0, 3:0, 4:0, 5:0};
    reviews.forEach(r => {
      const rounded = Math.round(r.rating);
      if (dist[rounded] !== undefined) dist[rounded]++;
    });
    return dist;
  }, [reviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !product || newRating === 0) return;
    
    setIsSubmittingReview(true);
    try {
      await reviewService.addReview(product.id, {
        userId: user.uid,
        userName: user.name || "Utilizador",
        userAvatar: user.photoURL || undefined,
        rating: newRating,
        comment: newComment,
        productId: product.id
      });
      
      toast({ title: "Avaliação enviada!", description: "Obrigado pelo seu feedback." });
      
      const updatedReviews = await reviewService.getReviews(product.id);
      setReviews(updatedReviews);
      setUserReview({
        userId: user.uid,
        userName: user.name || "Utilizador",
        rating: newRating,
        comment: newComment,
        createdAt: undefined,
        productId: product.id
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: (error as Error).message || "Não foi possível enviar a avaliação.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isWishlisted = user?.favorites?.includes(product?.id || "") || false;

  const handleToggleFavorite = async () => {
    if (!product || !user) {
      if (!user) {
        toast({ title: "Faça login", description: "Precisa de estar autenticado.", variant: "destructive" });
        navigate("/login?redirect=/product/" + id);
      }
      return;
    }

    setIsLoadingFav(true);
    try {
      await toggleFavorite(product.id);
      if (!isWishlisted) {
        toast({ 
          title: "Guardado ✨", 
          description: "Adicionado à sua lista de desejos.",
          className: "bg-rose-50 border-rose-200 text-rose-800" 
        });
      }
    } catch {
      toast({ title: "Erro", description: "Não foi possível atualizar os favoritos.", variant: "destructive" });
    } finally {
      setIsLoadingFav(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast({
        title: "Junte-se a nós! 🌿",
        description: "Faça login para comprar esta peça exclusiva.",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
      navigate("/login?redirect=/product/" + id);
      return;
    }
    addToCart({ product, quantity: 1 });
    toast({ title: "Adicionado ao carrinho", description: `${product.name} foi adicionado.` });
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({ title: product.name, text: product.description, url: window.location.href });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado" });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center max-w-md">
        <div className="rounded-full bg-muted p-6 mb-4">
          <AlertCircle className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Artigo não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este artigo pode ter sido removido ou o link está incorreto.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link to="/catalog">Voltar ao Catálogo</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.uid === product.userId;
  const isSold = product.status === "vendido";

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Button variant="ghost" size="sm" className="-ml-2 gap-1 h-8" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-4 w-4" /> Voltar
        </Button>
        <span className="text-muted-foreground/40">/</span>
        <Link to="/catalog" className="hover:text-foreground transition-colors">Catálogo</Link>
        <span className="text-muted-foreground/40">/</span>
        <Link to={`/catalog?category=${product.category}`} className="hover:text-foreground transition-colors font-medium text-foreground">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left Column: Gallery */}
        <ProductGallery product={product} />

        {/* Right Column: Info & Actions */}
        <div className="space-y-8">
          <ProductInfo product={product} />

          {/* Trust Badges */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Proteção ao Comprador</p>
                <p className="text-xs text-muted-foreground mt-1">Reembolso total se o artigo não corresponder à descrição.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border p-4 bg-card/50">
              <Lock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Pagamento Seguro</p>
                <p className="text-xs text-muted-foreground mt-1">Transações encriptadas e seguras.</p>
              </div>
            </div>
          </div>

          {/* Seller Info */}
          <SellerCard product={product} isOwner={isOwner} />

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row pt-4 border-t">
            {isOwner ? (
              <>
                <Button className="flex-1 h-12 text-base" asChild>
                  <Link to={`/product/${product.id}/edit`}>Editar anúncio</Link>
                </Button>
                <Button variant="outline" className="flex-1 h-12 text-base" asChild>
                  <Link to="/dashboard">Ver dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button className="flex-[2] h-12 text-base shadow-lg shadow-primary/20" onClick={handleAddToCart} disabled={isSold}>
                  {user ? (
                    <>{isSold ? "Indisponível" : <><ShoppingCart className="mr-2 h-5 w-5" /> Adicionar à Sacola</>}</>
                  ) : (
                    <><Lock className="mr-2 h-4 w-4" /> Faça Login para Comprar</>
                  )}
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleToggleFavorite} disabled={isLoadingFav}>
                  <Heart className={`h-5 w-5 transition-all ${isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""}`} />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-20 border-t pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight">Avaliações dos Clientes</h2>
        </div>
        
        <div className="grid gap-12 md:grid-cols-[350px_1fr]">
          <div className="space-y-6">
            <RatingSummary average={averageRating} totalReviews={reviews.length} distribution={ratingDistribution} />
            {!userReview && user && !isOwner && (
              <Card className="bg-secondary/20 border-dashed">
                <CardContent className="p-6 text-center">
                  <h3 className="font-medium mb-2">Já comprou este artigo?</h3>
                  <p className="text-sm text-muted-foreground mb-4">A sua opinião ajuda outros compradores.</p>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            {/* Review Form */}
            {!userReview && user && !isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Escrever uma avaliação</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Classificação</label>
                      <StarRating rating={newRating} onRatingChange={setNewRating} size="lg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">O seu comentário</label>
                      <Textarea 
                        placeholder="Partilhe a sua experiência..." 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)} 
                        className="min-h-[100px]" 
                        required 
                      />
                    </div>
                    <Button type="submit" disabled={isSubmittingReview || newRating === 0}>
                      {isSubmittingReview ? "A enviar..." : "Publicar Avaliação"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {userReview && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-primary">A sua avaliação</h3>
                      <StarRating rating={userReview.rating} readonly size="sm" />
                    </div>
                    <p className="text-foreground">{userReview.comment}</p>
                  </CardContent>
                </Card>
              )}

              {reviews.filter(r => r.userId !== user?.uid).map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.userAvatar} />
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'Recentemente'}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{review.comment}</p>
                </div>
              ))}

              {reviews.length === 0 && !userReview && (
                <div className="text-center py-12 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Ainda não existem avaliações.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
