import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplets, Recycle, MapPin, Calendar, Edit3, Share2, Star, Package, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import firestoreService from "@/lib/firestore-service";
import { where } from "firebase/firestore";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchUserProducts() {
      if (user?.uid) {
        try {
          const { products } = await firestoreService.Products.list({
            filters: [where("userId", "==", user.uid)]
          });
          setUserProducts(products);
        } catch (error) {
          console.error("Error fetching user products:", error);
        } finally {
          setLoadingProducts(false);
        }
      } else {
        setLoadingProducts(false);
      }
    }
    fetchUserProducts();
  }, [user?.uid]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando perfil...</p>
      </div>
    );
  }

  // Calculate stats based on real data
  const savedItemsCount = user.favorites?.length || 0;
  const circularityCount = userProducts.length;
  // Estimate water saved (mock calculation: ~2700L per cotton t-shirt, averaging conservatively at 1000L per item)
  const waterSaved = (circularityCount * 1000); 
  const waterSavedDisplay = waterSaved >= 1000 ? `${(waterSaved / 1000).toFixed(1)}k L` : `${waterSaved} L`;

  // Format member since date
  const memberSince = user.createdAt 
    ? format(user.createdAt.toDate(), "MMMM 'de' yyyy", { locale: pt })
    : "Membro recente";

  return (
    <div className="bg-background pb-10">
      <div className="w-full px-2 pt-8">
        <div className="relative z-20 mb-8">
          <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
            {/* Organic Profile Picture */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-orange-400 rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] blur opacity-70 group-hover:opacity-100 transition duration-500"></div>
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] overflow-hidden bg-white">
                <AvatarImage src={user.photoURL || ""} className="object-cover" />
                <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">
                  {user.name?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              <Link to="/settings">
                <Button size="icon" variant="secondary" className="absolute bottom-2 right-2 rounded-full shadow-lg h-10 w-10">
                  <Edit3 className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-2 text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2 capitalize">
                {user.name || "Utilizador"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                {user.location && (
                  <span className="flex items-center gap-1.5 text-sm">
                    <MapPin className="h-4 w-4" /> {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm capitalize">
                  <Calendar className="h-4 w-4" /> {memberSince}
                </span>
                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200">
                  Eco Warrior
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-xl mx-auto md:mx-0 font-light leading-relaxed">
                {user.bio || "Sem biografia definida. Adicione uma descrição nas configurações para que os compradores o conheçam melhor! 🌿"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pb-4 w-full md:w-auto justify-center md:justify-end">
              <Link to="/settings">
                <Button className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  Editar Perfil
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="closet" className="w-full">
          <TabsList className="w-full justify-start h-auto p-0 bg-transparent border-b border-border/40 rounded-none mb-8 overflow-x-auto flex-nowrap">
            <TabsTrigger 
              value="closet" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Meu Closet
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Favoritos
            </TabsTrigger>
            <TabsTrigger 
              value="impact" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Impacto Detalhado
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none px-6 py-4 text-base font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Avaliações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="closet" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl text-foreground">À Venda ({userProducts.length})</h3>
              <Link to="/sell">
                <Button variant="ghost" className="text-primary hover:bg-primary/5">Adicionar Peça</Button>
              </Link>
            </div>
            
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-3">
                    <div className="h-[300px] w-full bg-secondary/30 animate-pulse rounded-xl" />
                    <div className="h-4 w-2/3 bg-secondary/30 animate-pulse rounded" />
                    <div className="h-4 w-1/3 bg-secondary/30 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            ) : userProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {userProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-medium mb-2">O seu closet está vazio</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  Dê uma nova vida às suas roupas. Comece a vender hoje mesmo e contribua para um futuro mais sustentável.
                </p>
                <Link to="/sell">
                  <Button>Começar a Vender</Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
              <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Star className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="font-serif text-xl text-foreground mb-2">Ainda não tens favoritos</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Explora o catálogo e guarda as peças que amas para as encontrares facilmente mais tarde.
              </p>
              <Button className="mt-6 rounded-xl" variant="outline">Explorar Catálogo</Button>
            </div>
          </TabsContent>

          <TabsContent value="impact">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-none bg-secondary/20 shadow-none">
                <CardContent className="p-8">
                  <h3 className="font-serif text-2xl mb-4">A tua pegada ecológica</h3>
                  <p className="text-muted-foreground mb-6">
                    Ao comprares em segunda mão, evitas a emissão de CO2 e o consumo excessivo de água.
                    O teu impacto equivale a:
                  </p>
                  <ul className="space-y-4">
                    <li className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Leaf className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-lg">120 kg</span>
                        <span className="text-sm text-muted-foreground">de CO2 evitado</span>
                      </div>
                    </li>
                    <li className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-lg">4,500 L</span>
                        <span className="text-sm text-muted-foreground">de água poupada</span>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>
              <div className="relative rounded-3xl overflow-hidden h-full min-h-[300px]">
                <img 
                  src="https://images.unsplash.com/photo-1542601906990-b4d3fb7d5fa5?q=80&w=2070&auto=format&fit=crop" 
                  alt="Nature" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8 text-center">
                  <p className="text-white font-serif text-2xl italic">
                    "A moda mais sustentável é aquela que já existe."
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
