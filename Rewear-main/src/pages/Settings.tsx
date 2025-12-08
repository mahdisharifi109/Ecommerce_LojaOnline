import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, CreditCard, Bell, Shield, Save, Check, Camera, Loader2, Trash2, Plus, Pencil, X, Mail, Smartphone, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteUser, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useNavigate } from "react-router-dom";
import { Address } from "@/lib/types";

// Componente auxiliar para inputs flutuantes
const FloatingInput = ({ label, ...props }: any) => (
  <div className="relative">
    <Label className="absolute -top-2 left-2 bg-background px-1 text-xs text-muted-foreground">
      {label}
    </Label>
    {props.as === "textarea" ? (
      <Textarea className="min-h-[100px] resize-none" {...props} />
    ) : (
      <Input {...props} />
    )}
  </div>
);

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    phone: "",
    instagram: "",
    website: ""
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({});

  // Notification State
  const [notifPrefs, setNotifPrefs] = useState({
    email_marketing: false,
    email_orders: true,
    email_messages: true,
    push_messages: true,
    push_sales: true
  });

  // Carregar dados do utilizador
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "",
        location: user.location || "",
        phone: user.phone || "",
        instagram: "", 
        website: ""    
      });
      setPhotoPreview(user.photoURL || null);
      setAddresses(user.addresses || []);
      if (user.notificationPreferences) {
        setNotifPrefs(user.notificationPreferences);
      }
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      
      // Criar preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({ notificationPreferences: notifPrefs });
      toast({
        title: "Preferências guardadas",
        description: "As tuas preferências de notificação foram atualizadas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar as preferências.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth || !auth.currentUser) return;
    
    setIsDeleting(true);
    try {
      await deleteUser(auth.currentUser);
      toast({
        title: "Conta eliminada",
        description: "A tua conta foi eliminada permanentemente.",
      });
      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      if (error.code === 'auth/requires-recent-login') {
         toast({
          title: "Reautenticação necessária",
          description: "Por favor, faz login novamente para confirmar a eliminação da conta.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao eliminar a conta.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        phone: formData.phone,
        // Adicionar outros campos conforme necessário
      }, photoFile || undefined);

      toast({
        title: "Alterações guardadas ✨",
        description: "O teu perfil foi atualizado com sucesso.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-800",
      });
      
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao guardar",
        description: "Não foi possível atualizar o perfil. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Password Reset
  const handlePasswordReset = async () => {
    if (!user?.email || !auth) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      toast({
        title: "Email enviado",
        description: `Enviámos um link de redefinição para ${user.email}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email. Tenta novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Address Management
  const handleAddressSubmit = async () => {
    if (!user) return;
    
    const newAddress: Address = {
      id: editingAddress ? editingAddress.id : crypto.randomUUID(),
      name: addressForm.name || "Casa",
      fullName: addressForm.fullName || "",
      street: addressForm.street || "",
      city: addressForm.city || "",
      zipCode: addressForm.zipCode || "",
      country: addressForm.country || "Portugal",
      isDefault: addressForm.isDefault || false,
    };

    let updatedAddresses = [...addresses];
    
    if (editingAddress) {
      updatedAddresses = updatedAddresses.map(addr => addr.id === newAddress.id ? newAddress : addr);
    } else {
      updatedAddresses.push(newAddress);
    }

    if (newAddress.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => 
        addr.id === newAddress.id ? addr : { ...addr, isDefault: false }
      );
    }

    try {
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      setIsAddressDialogOpen(false);
      setEditingAddress(null);
      setAddressForm({});
      toast({
        title: "Endereço guardado",
        description: "A tua lista de endereços foi atualizada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível guardar o endereço.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const updatedAddresses = addresses.filter(addr => addr.id !== id);
    try {
      await updateProfile({ addresses: updatedAddresses });
      setAddresses(updatedAddresses);
      toast({
        title: "Endereço removido",
        description: "O endereço foi removido com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o endereço.",
        variant: "destructive",
      });
    }
  };

  const openAddressDialog = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setAddressForm(address);
    } else {
      setEditingAddress(null);
      setAddressForm({ country: "Portugal" });
    }
    setIsAddressDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-medium">Definições</h1>
        <p className="text-muted-foreground">Gere a tua conta e preferências</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-8 w-full justify-start border-b bg-transparent p-0">
          <TabsTrigger 
            value="profile" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Perfil
          </TabsTrigger>
          <TabsTrigger 
            value="addresses" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Endereços
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Preferências
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="rounded-none border-b-2 border-transparent px-4 py-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 mt-0">
          <div className="grid gap-8 md:grid-cols-[240px_1fr]">
            {/* Foto de Perfil */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-background shadow-xl">
                  <AvatarImage src={photoPreview || ""} className="object-cover" />
                  <AvatarFallback className="text-4xl">{formData.name?.substring(0, 2).toUpperCase() || "US"}</AvatarFallback>
                </Avatar>
                <div 
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Alterar Foto
              </Button>
            </div>

            {/* Formulário */}
            <div className="space-y-6 max-w-2xl">
              <div className="grid gap-6 sm:grid-cols-2">
                <FloatingInput 
                  label="Nome Completo" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FloatingInput 
                  label="Email" 
                  name="email"
                  value={formData.email}
                  disabled
                  className="bg-muted/50"
                />
                <FloatingInput 
                  label="Localização" 
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ex: Lisboa, Portugal" 
                />
                <FloatingInput 
                  label="Telemóvel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <FloatingInput 
                label="Bio" 
                name="bio"
                as="textarea"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Conta um pouco sobre ti..." 
              />

              <div className="grid gap-6 sm:grid-cols-2">
                <FloatingInput 
                  label="Instagram" 
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@username" 
                />
                <FloatingInput 
                  label="Website" 
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://" 
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="min-w-[140px]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      A guardar...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Guardar Alterações
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium">Os teus endereços</h3>
              <p className="text-sm text-muted-foreground">Gere os teus endereços de envio e faturação.</p>
            </div>
            <Button onClick={() => openAddressDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Endereço
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10 border-dashed">
              <MapPin className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Sem endereços guardados</h3>
              <p className="text-muted-foreground max-w-sm mt-2">
                Adiciona um endereço para agilizar o checkout das tuas compras.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {addresses.map((addr) => (
                <div key={addr.id} className="relative rounded-lg border p-4 hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{addr.name}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          Padrão
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddressDialog(addr)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteAddress(addr.id)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">{addr.fullName}</p>
                    <p>{addr.street}</p>
                    <p>{addr.zipCode} {addr.city}</p>
                    <p>{addr.country}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingAddress ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
                <DialogDescription>
                  Preenche os dados do endereço para envio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addr-name">Nome do Local</Label>
                    <Input 
                      id="addr-name" 
                      placeholder="Ex: Casa, Trabalho" 
                      value={addressForm.name || ""}
                      onChange={e => setAddressForm({...addressForm, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr-fullname">Nome Completo</Label>
                    <Input 
                      id="addr-fullname" 
                      placeholder="Quem recebe?" 
                      value={addressForm.fullName || ""}
                      onChange={e => setAddressForm({...addressForm, fullName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addr-street">Morada</Label>
                  <Input 
                    id="addr-street" 
                    placeholder="Rua, Número, Andar..." 
                    value={addressForm.street || ""}
                    onChange={e => setAddressForm({...addressForm, street: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="addr-zip">Código Postal</Label>
                    <Input 
                      id="addr-zip" 
                      placeholder="0000-000" 
                      value={addressForm.zipCode || ""}
                      onChange={e => setAddressForm({...addressForm, zipCode: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="addr-city">Cidade</Label>
                    <Input 
                      id="addr-city" 
                      placeholder="Cidade" 
                      value={addressForm.city || ""}
                      onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="addr-default" 
                    checked={addressForm.isDefault || false}
                    onCheckedChange={checked => setAddressForm({...addressForm, isDefault: checked})}
                  />
                  <Label htmlFor="addr-default">Definir como endereço padrão</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddressDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleAddressSubmit}>Guardar Endereço</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid gap-6 max-w-2xl">
            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4">
                <Mail className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Notificações por Email</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Marketing e Novidades</Label>
                  <p className="text-sm text-muted-foreground">Recebe novidades sobre promoções e novos produtos.</p>
                </div>
                <Switch 
                  checked={notifPrefs.email_marketing}
                  onCheckedChange={c => setNotifPrefs(p => ({...p, email_marketing: c}))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Atualizações de Pedidos</Label>
                  <p className="text-sm text-muted-foreground">Emails importantes sobre o estado das tuas compras.</p>
                </div>
                <Switch 
                  checked={notifPrefs.email_orders}
                  onCheckedChange={c => setNotifPrefs(p => ({...p, email_orders: c}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mensagens</Label>
                  <p className="text-sm text-muted-foreground">Quando recebes uma nova mensagem de um vendedor/comprador.</p>
                </div>
                <Switch 
                  checked={notifPrefs.email_messages}
                  onCheckedChange={c => setNotifPrefs(p => ({...p, email_messages: c}))}
                />
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-4">
              <div className="flex items-center gap-2 border-b pb-2 mb-4">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Notificações Push</h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Mensagens Instantâneas</Label>
                  <p className="text-sm text-muted-foreground">Notificações no navegador quando recebes mensagens.</p>
                </div>
                <Switch 
                  checked={notifPrefs.push_messages}
                  onCheckedChange={c => setNotifPrefs(p => ({...p, push_messages: c}))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Vendas e Ofertas</Label>
                  <p className="text-sm text-muted-foreground">Quando alguém compra um artigo teu ou faz uma oferta.</p>
                </div>
                <Switch 
                  checked={notifPrefs.push_sales}
                  onCheckedChange={c => setNotifPrefs(p => ({...p, push_sales: c}))}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSaveNotifications} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Preferências
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6 max-w-2xl">
            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="h-5 w-5 text-primary" />
                <h3 className="font-medium">Segurança da Conta</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Alterar Palavra-passe</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Enviaremos um email para o teu endereço ({user.email}) com um link seguro para redefinires a tua palavra-passe.
                  </p>
                  <Button variant="outline" onClick={handlePasswordReset}>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Email de Redefinição
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <h3 className="font-medium text-destructive mb-2">Zona de Perigo</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Eliminar a tua conta é uma ação irreversível. Todos os teus dados serão perdidos.
              </p>
              <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tens a certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isto irá eliminar permanentemente a tua conta
                      e remover os teus dados dos nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sim, eliminar conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
