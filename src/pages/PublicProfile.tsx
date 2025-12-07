import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Loader2, MessageCircle, Package } from "lucide-react";
import firestoreService from "@/lib/firestore-service";
import { where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/types";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/context/auth-context";

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [userProducts, setUserProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        // Fetch User Data
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setProfileUser(userDoc.data());
        }

        // Fetch User Products
        const { products } = await firestoreService.Products.list({
          filters: [where("userId", "==", id)]
        });
        setUserProducts(products);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

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
    <div className="bg-background pb-10">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="relative z-20 mb-8">
          <div className="flex flex-col md:flex-row items-end md:items-end gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <Avatar className="w-32 h-32 border-4 border-background shadow-xl rounded-full overflow-hidden bg-white">
                <AvatarImage src={profileUser.photoURL || ""} className="object-cover" />
                <AvatarFallback className="text-4xl bg-secondary text-secondary-foreground">
                  {profileUser.username?.substring(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-2 text-center md:text-left">
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-2 capitalize">
                {profileUser.username || "Utilizador"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-muted-foreground mb-4">
                {profileUser.location && (
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="h-4 w-4" />
                    {profileUser.location}
                  </div>
                )}
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="h-4 w-4" />
                  Membro desde {memberSince}
                </div>
              </div>
              
              {profileUser.bio && (
                <p className="text-muted-foreground max-w-2xl mb-4">{profileUser.bio}</p>
              )}
            </div>

            {/* Actions */}
            {currentUser?.uid !== id && (
              <div className="pb-4">
                <Button asChild>
                  <Link to={`/messages?seller=${id}`}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Enviar Mensagem
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b pb-4">
            <Package className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Artigos à venda ({userProducts.length})</h2>
          </div>

          {userProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {userProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Este utilizador ainda não tem artigos à venda.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}