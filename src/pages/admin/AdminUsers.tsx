import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Ban, 
  MoreHorizontal, 
  Mail,
  Calendar,
  Loader2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface UserData {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role?: string;
  createdAt?: any;
  isActive?: boolean;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), limit(50));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserData));
      data.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Erro ao carregar usuários", description: "Verifique as permissões ou o console.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async (userId: string) => {
    if (!confirm("Tem certeza que deseja promover este usuário a Administrador?")) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: "admin" });
      setUsers(users.map(u => u.id === userId ? { ...u, role: "admin" } : u));
      toast({ title: "Usuário Promovido" });
    } catch (error) {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const handleDemote = async (userId: string) => {
    if (!confirm("Remover privilégios de admin?")) return;
    try {
      await updateDoc(doc(db, "users", userId), { role: "user" });
      setUsers(users.map(u => u.id === userId ? { ...u, role: "user" } : u));
      toast({ title: "Privilégios Removidos" });
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
          <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">Controle de acesso e permissões.</p>
        </div>
        <Badge variant="outline" className="text-muted-foreground">
          {users.length} Usuários Listados
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Base de Usuários</CardTitle>
          <CardDescription>Lista de todos os usuários registrados na plataforma.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Usuário</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Função</th>
                  <th className="px-6 py-3 font-medium">Entrou em</th>
                  <th className="px-6 py-3 text-right font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted overflow-hidden flex items-center justify-center border">
                          {user.photoURL ? (
                            <img src={user.photoURL} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="font-medium">{user.name || "Sem nome"}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <Badge variant="destructive" className="gap-1">
                          <Shield className="h-3 w-3" /> Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Usuário
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {user.createdAt?.toDate ? formatDistanceToNow(user.createdAt.toDate(), { addSuffix: true, locale: pt }) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => navigator.clipboard.writeText(user.id)}
                            className="cursor-pointer"
                          >
                            Copiar ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.role !== 'admin' ? (
                            <DropdownMenuItem 
                              onClick={() => handlePromote(user.id)}
                              className="text-green-600 cursor-pointer"
                            >
                              <Shield className="mr-2 h-4 w-4" /> Promover a Admin
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleDemote(user.id)}
                              className="text-yellow-600 cursor-pointer"
                            >
                              <Ban className="mr-2 h-4 w-4" /> Remover Admin
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-red-600 cursor-pointer">
                            <Ban className="mr-2 h-4 w-4" /> Banir Usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
