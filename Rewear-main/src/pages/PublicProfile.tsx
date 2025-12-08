import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Loader2, MessageCircle, Package, ShoppingBag } from "lucide-react";
import firestoreService from "@/lib/firestore-service";
import { where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    async function fetchUser() {
      if (!id) return;
      try {
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data());
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  useEffect(() => {
    async function fetchProducts() {
      if (!id) return;
      setLoadingProducts(true);
      try {
        const statusFilter = activeTab === 'available' ? 'disponível' : 'vendido';
        
        const { products: fetchedProducts } = await firestoreService.Products.list({
          filters: [
            where("userId", "==", id),
            where("status", "==", statusFilter)
          ]
        });
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoadingProducts(false);
      }
    }
    fetchProducts();
  }, [id, activeTab]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Utilizador não encontrado</h1>
        <Button asChild className="mt-6">
          <Link to="/catalog">Ver catálogo</Link>
        </Button>
      </div>
    );
  }

  const memberSince = profileUser.createdAt 
    ? format(profileUser.createdAt.toDate(), "MMMM 'de' yyyy", { locale: pt })
    : "Membro recente";

  return (
    <div className="bg-background pb-20">
      {/* Cover / Header Background */}
      <div className="h-48 bg-gradient-to-r from-primary/10 to-secondary/30 w-full absolute top-0 left-0 z-0" />
      
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 pt-24 relative z-10">
        <div className="bg-card rounded-3xl shadow-sm border border-border/50 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16 md:-mt-20">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-xl rounded-full overflow-hidden bg-white">
                <AvatarImage src={profileUser.photoURL || ""} className="object-cover" />
                <AvatarFallback className="text-4xl md:text-5xl bg-secondary text-secondary-foreground">
                  {profileUser.username?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2 capitalize font-medium">
                    {profileUser.username || "Utilizador"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                    {profileUser.location && (
                      <div className="flex items-center gap-1.5 text-sm bg-secondary/30 px-3 py-1 rounded-full">
                        <MapPin className="h-3.5 w-3.5" />
                        {profileUser.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm bg-secondary/30 px-3 py-1 rounded-full">
                      <Calendar className="h-3.5 w-3.5" />
                      Membro desde {memberSince}
                    </div>
                  </div>
                  
                  {profileUser.bio && (
                    <p className="text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
                      {profileUser.bio}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {currentUser?.uid !== id && (
                  <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Button asChild className="flex-1 md:flex-none rounded-xl">
                      <Link to={`/messages?seller=${id}`}>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Enviar Mensagem
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="space-y-6">
          <Tabs defaultValue="available" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-secondary/30 p-1 rounded-xl h-auto">
                <TabsTrigger value="available" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  À venda
                </TabsTrigger>
                <TabsTrigger value="sold" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Vendidos
                </TabsTrigger>
              </TabsList>
              
              <div className="text-sm text-muted-foreground hidden sm:block">
                {products.length} {products.length === 1 ? 'artigo' : 'artigos'}
              </div>
            </div>

            <TabsContent value="available" className="mt-0">
              {loadingProducts ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-border">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Sem artigos à venda</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Este utilizador não tem artigos disponíveis no momento.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sold" className="mt-0">
              {loadingProducts ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-secondary/10 rounded-3xl border border-dashed border-border">
                  <div className="bg-background p-4 rounded-full shadow-sm mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Sem vendas recentes</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Este utilizador ainda não vendeu artigos.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}