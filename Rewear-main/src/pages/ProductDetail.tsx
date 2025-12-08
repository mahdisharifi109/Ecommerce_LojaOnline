import { useParams, Link, useNavigate } from "react-router-dom";
import { useProducts } from "@/context/product-context";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "@/components/ui/image";
import { 
  ShoppingCart, 
  Heart, 
  Share2, 
  ChevronLeft, 
  User,
  ShieldCheck,
  MessageCircle,
  Lock
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { optimizeImageUrl } from "@/hooks/use-image-optimization";
import { StarRating, RatingSummary } from "@/components/ui/star-rating";
import { reviewService, Review } from "@/lib/reviewService";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { user, toggleFavorite } = useAuth();
  const { toast } = useToast();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoadingFav, setIsLoadingFav] = useState(false);
  
  // Review State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const product = useMemo(() => 
    products.find(p => p.id === id), 
    [products, id]
  );

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
      
      toast({
        title: "Avaliação enviada!",
        description: "Obrigado pelo seu feedback.",
      });
      
      // Refresh reviews
      const updatedReviews = await reviewService.getReviews(product.id);
      setReviews(updatedReviews);
      setUserReview({
        userId: user.uid,
        userName: user.name || "Utilizador",
        rating: newRating,
        comment: newComment,
        createdAt: {} as any,
        productId: product.id
      });
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error);
      toast({
        title: "Erro",
        description: `Não foi possível enviar a avaliação: ${error.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const isWishlisted = user?.favorites?.includes(product?.id || "") || false;

  const handleToggleFavorite = async () => {
    if (!product) return;
    
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
      
      if (!isWishlisted) {
        toast({
          title: "Guardado ✨",
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

  const handleAddToCart = () => {
    if (!product) return;
    if (!user) {
      toast({
        title: "Junte-se a nós! 🌿",
        description: "Para levar essa peça exclusiva para casa, junte-se à nossa comunidade sustentável.",
        className: "bg-primary/10 border-primary/20 text-primary",
      });
      navigate("/login?redirect=/product/" + id);
      return;
    }
    addToCart({ product, quantity: 1 });
    toast({
      title: "Adicionado ao carrinho",
      description: `${product.name} foi adicionado.`,
    });
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
      } catch {
        // Utilizador cancelou ou erro
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Link copiado" });
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat("pt-PT", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Loading state
  if (loading) {
    return (
      <div className="container px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (!product) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Artigo não encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          Este artigo pode ter sido removido ou o link está incorreto.
        </p>
        <Button asChild className="mt-6">
          <Link to="/catalog">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.uid === product.userId;
  const isSold = product.status === "vendido";

  return (
    <div className="container px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 gap-1"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar
        </Button>
        <span>/</span>
        <Link to="/catalog" className="hover:text-foreground">
          Catálogo
        </Link>
        <span>/</span>
        <Link
          to={`/catalog?category=${product.category}`}
          className="hover:text-foreground"
        >
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galeria de Imagens */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted/30">
            <Image
              src={optimizeImageUrl(product.imageUrls?.[selectedImageIndex] || "", 800)}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <Badge variant="destructive" className="text-lg font-bold">
                  VENDIDO
                </Badge>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    index === selectedImageIndex
                      ? "border-primary"
                      : "border-transparent hover:border-border"
                  }`}
                >
                  <Image
                    src={optimizeImageUrl(url, 100)}
                    alt={`${product.name} - imagem ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {product.isVerified && (
                <Badge className="bg-blue-500 hover:bg-blue-600">
                  <ShieldCheck className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
              <Badge variant="secondary">{product.category}</Badge>
              <Badge variant="outline">{product.condition}</Badge>
            </div>
            <h1 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-bold text-primary">
              {product.price.toFixed(2)} €
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <h2 className="font-semibold">Descrição</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {product.description}
            </p>
          </div>

          {/* Detalhes */}
          <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card/50 p-4">
            {product.brand && (
              <div>
                <span className="text-sm text-muted-foreground">Marca</span>
                <p className="font-medium">{product.brand}</p>
              </div>
            )}
            {product.material && (
              <div>
                <span className="text-sm text-muted-foreground">Material</span>
                <p className="font-medium">{product.material}</p>
              </div>
            )}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-sm text-muted-foreground">Tamanhos</span>
                <p className="font-medium">{product.sizes.join(", ")}</p>
              </div>
            )}
            {product.createdAt && (
              <div>
                <span className="text-sm text-muted-foreground">Publicado</span>
                <p className="font-medium">{formatDate(product.createdAt)}</p>
              </div>
            )}
          </div>

          {/* Sustainability Impact - REMOVED */}
          
          {/* Trust Badges */}
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3 rounded-md border p-3">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Proteção ao Comprador</p>
                <p className="text-xs text-muted-foreground">Reembolso total se o artigo não corresponder à descrição.</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Pagamento Seguro</p>
                <p className="text-xs text-muted-foreground">Os seus dados estão protegidos com encriptação SSL.</p>
              </div>
            </div>
          </div>

          {/* Vendedor */}
          <div className="flex items-center gap-4 rounded-lg border bg-card/50 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <Link to={`/profile/${product.userId}`} className="hover:underline">
                <p className="font-medium">{product.userName || "Utilizador"}</p>
              </Link>
              <p className="text-sm text-muted-foreground">Vendedor</p>
            </div>
            {!isOwner && (
              <Button variant="outline" size="sm" asChild>
                <Link to={`/messages?seller=${product.userId}&product=${product.id}`}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Mensagem
                </Link>
              </Button>
            )}
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3 sm:flex-row">
            {isOwner ? (
              <>
                <Button className="flex-1" asChild>
                  <Link to={`/product/${product.id}/edit`}>Editar anúncio</Link>
                </Button>
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard">Ver dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={isSold}
                >
                  {user ? (
                    <>
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      {isSold ? "Indisponível" : "Adicionar à Sacola"}
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Faça Login para Comprar
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  disabled={isLoadingFav}
                  aria-label={isWishlisted ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Heart
                    className={`h-4 w-4 transition-all ${isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Partilhar"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16 border-t pt-10">
        <h2 className="text-2xl font-bold mb-8">Avaliações dos Clientes</h2>
        
        <div className="grid gap-10 md:grid-cols-[300px_1fr]">
          {/* Summary */}
          <div>
            <RatingSummary 
              average={averageRating} 
              totalReviews={reviews.length} 
              distribution={ratingDistribution} 
            />
            
            {!userReview && user && !isOwner && (
              <div className="mt-6 p-4 bg-secondary/30 rounded-lg border border-border/50">
                <h3 className="font-medium mb-2">Já comprou este artigo?</h3>
                <p className="text-sm text-muted-foreground mb-4">Partilhe a sua opinião com outros compradores.</p>
              </div>
            )}
          </div>

          {/* Reviews List & Form */}
          <div className="space-y-8">
            {/* Review Form */}
            {!userReview && user && !isOwner && (
              <form onSubmit={handleSubmitReview} className="bg-card border rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-lg mb-4">Escrever uma avaliação</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Classificação</label>
                    <StarRating 
                      rating={newRating} 
                      onRatingChange={setNewRating} 
                      size="lg" 
                    />
                    {newRating === 0 && <p className="text-xs text-red-500 mt-1">Selecione uma classificação</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">O seu comentário</label>
                    <Textarea 
                      placeholder="O que achou deste artigo? O tamanho serviu bem? O estado estava conforme descrito?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSubmittingReview || newRating === 0}>
                    {isSubmittingReview ? "A enviar..." : "Publicar Avaliação"}
                  </Button>
                </div>
              </form>
            )}

            {/* Feedback for non-eligible users */}
            {!user && (
              <div className="bg-secondary/20 p-6 rounded-xl text-center border border-dashed">
                <p className="text-muted-foreground mb-2">Quer deixar a sua opinião?</p>
                <Button variant="outline" asChild>
                  <Link to={`/login?redirect=/product/${id}`}>Faça login para avaliar</Link>
                </Button>
              </div>
            )}
            
            {isOwner && (
              <div className="bg-secondary/20 p-4 rounded-xl text-center border border-dashed">
                <p className="text-sm text-muted-foreground">Como vendedor, não pode avaliar o seu próprio artigo.</p>
              </div>
            )}

            {/* User's Review (if exists) */}
            {userReview && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-primary">A sua avaliação</h3>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={userReview.rating} readonly size="sm" />
                  <span className="text-sm font-medium">{userReview.rating.toFixed(1)}</span>
                </div>
                <p className="text-foreground">{userReview.comment}</p>
              </div>
            )}

            {/* Other Reviews */}
            <div className="space-y-6">
              {reviews.filter(r => r.userId !== user?.uid).map((review) => (
                <div key={review.id} className="border-b pb-6 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="h-full w-full object-cover" />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: pt }) : 'Recentemente'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <StarRating rating={review.rating} readonly size="sm" />
                  </div>
                  
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))}

              {reviews.length === 0 && !userReview && (
                <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p>Ainda não existem avaliações para este artigo.</p>
                  <p className="text-sm">Seja o primeiro a avaliar!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
