import { useState } from "react";
import Image from '@/components/ui/image';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProducts } from "@/context/product-context";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { sellFormSchema, type SellFormValues } from "@/lib/schemas";
import { SelectOrInput } from "./ui/select-or-input";
import { fileToDataUri } from "@/lib/imageUtils"; // Importar a função
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

const PREDEFINED_BRANDS = ["Nike", "Adidas", "Zara", "H&M", "Apple", "Samsung", "Fnac"];
const PREDEFINED_MATERIALS = ["Algodão", "Poliéster", "Lã", "Seda", "Plástico", "Metal"];

export function SellForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { addProduct } = useProducts();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const { control, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "", description: "", price: undefined, quantity: 1, category: "", condition: "", brand: "", material: "", sizes: "", images: [],
    },
  });

  const imagePreviews = watch("images");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
        const newFiles = Array.from(files);
        setValue("images", [...(watch("images") || []), ...newFiles], { shouldValidate: true });
    }
  };
  
  const removeImage = (index: number) => {
    const currentImages = watch("images");
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: SellFormValues) => {
    if (authLoading || !user) {
        toast({ variant: "destructive", title: "Erro de Autenticação", description: "Por favor, aguarde ou faça login novamente." });
        return;
    }
    setIsSubmitting(true);
    try {
        // 1) Validação rápida no cliente (tipo e tamanho) – regras também validam no servidor
        const files = (data.images || []).filter((f): f is File => typeof f !== 'string');
        for (const f of files) {
          if (!f.type.startsWith('image/')) {
            toast({ variant: "destructive", title: "Ficheiro inválido", description: `Apenas imagens são permitidas. (${f.name})` });
            return;
          }
          if (f.size > 5 * 1024 * 1024) {
            toast({ variant: "destructive", title: "Imagem muito grande", description: `${f.name} excede 5MB.` });
            return;
          }
        }

        // 2) Upload para Firebase Storage (com compressão simples via canvas)
        async function compressToBlob(file: File): Promise<Blob> {
          const img = document.createElement('img');
          const tmpUrl = URL.createObjectURL(file);
          await new Promise<void>((resolve) => { img.onload = () => resolve(); img.src = tmpUrl; });
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 1200;
          const scale = Math.min(1, MAX_SIZE / Math.max(img.width, img.height));
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(tmpUrl);
          return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b as Blob), 'image/jpeg', 0.8));
        }

        const uploadPromises = (data.images || []).map(async (image, idx) => {
          if (typeof image === 'string') return image; // já é URL
          const blob = await compressToBlob(image as File);
          const path = `products/${user.uid}/${Date.now()}-${idx}.jpg`;
          const ref = storageRef(storage, path);
          await uploadBytes(ref, blob, { contentType: 'image/jpeg' });
          const url = await getDownloadURL(ref);
          return url;
        });

        const imageUrls = await Promise.all(uploadPromises);
        
        const sizesArray = data.sizes ? data.sizes.split(',').map(s => s.trim().toUpperCase()) : [];

        await addProduct({
          name: data.title, description: data.description, price: data.price, quantity: data.quantity, category: data.category as any,
          condition: data.condition as any, brand: data.brand, material: data.material, sizes: sizesArray, imageUrls: imageUrls,
          imageHint: data.title.split(" ").slice(0, 2).join(" "), userEmail: user.email!, userName: user.name, userId: user.uid,
        });

        toast({ title: "Anúncio Publicado!", description: "O seu produto foi listado com sucesso!" });
        reset();
        navigate('/');
    } catch (error) {
        toast({ variant: "destructive", title: "Erro ao Publicar", description: "Ocorreu um erro. Verifique as permissões da base de dados e tente novamente." })
    } finally {
        setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
        <Card><CardHeader><CardTitle>Venda o seu artigo</CardTitle><CardDescription>A verificar a sua sessão...</CardDescription></CardHeader><CardContent><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></CardContent></Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 pt-32 pb-24">
      <div className="text-center mb-16">
        <h1 className="font-serif text-5xl mb-4 text-primary">Novo Anúncio</h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Dê uma nova vida às suas peças. Preencha os detalhes abaixo para encontrar o próximo dono perfeito.
        </p>
      </div>
      
      <Card className="border-none shadow-xl shadow-black/5 bg-white/50 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
            
            {/* Section: Images */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="image-upload" className="text-xl font-serif font-medium">Fotografias</Label>
                <span className="text-sm text-muted-foreground">Adicione até 5 fotos</span>
              </div>
              
               <div className="relative flex flex-col justify-center items-center w-full h-80 border-2 border-dashed border-muted-foreground/20 rounded-2xl cursor-pointer hover:bg-secondary/30 hover:border-primary/50 transition-all duration-300 group bg-secondary/10">
                  <Input id="image-upload" type="file" multiple className="absolute w-full h-full opacity-0 cursor-pointer z-10" onChange={handleImageChange} accept="image/*" />
                  <div className="text-center text-muted-foreground group-hover:text-primary transition-colors p-6">
                      <div className="bg-background rounded-full p-4 inline-flex mb-4 shadow-sm group-hover:shadow-md transition-all">
                        <UploadCloud className="h-8 w-8" />
                      </div>
                      <p className="text-lg font-medium mb-2">Arraste e solte suas fotos aqui</p>
                      <p className="text-sm opacity-70 max-w-xs mx-auto">Formatos suportados: JPG, PNG. Máximo 5MB por foto.</p>
                  </div>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {imagePreviews.map((image, index) => (
                    <div key={index} className="relative group aspect-[3/4] rounded-xl overflow-hidden shadow-sm">
                       <Image 
                         src={typeof image === 'string' ? image : URL.createObjectURL(image as File)} 
                         alt={`Pré-visualização ${index + 1}`} 
                         fill 
                         loading="lazy"
                         sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                         className="object-cover transition-transform duration-500 group-hover:scale-110" 
                       />
                       <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                       <button type="button" onClick={() => removeImage(index)} className="absolute top-2 right-2 bg-white/90 text-destructive rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110 shadow-sm">
                          <X className="h-4 w-4" />
                       </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && <p className="text-sm font-medium text-destructive flex items-center gap-2"><X className="h-4 w-4"/> {errors.images.message?.toString()}</p>}
            </div>

            <div className="h-px bg-border/50" />

            {/* Section: Basic Info */}
            <div className="space-y-8">
                 <div className="space-y-4">
                    <Label htmlFor="title" className="text-base font-medium text-foreground/80">O que está a vender?</Label>
                    <Controller name="title" control={control} render={({ field }) => (
                      <Input 
                        id="title" 
                        className="h-14 px-4 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all text-lg placeholder:text-muted-foreground/50" 
                        placeholder="Ex: Casaco de Lã Vintage Bege" 
                        {...field} 
                      />
                    )} />
                    {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
                 </div>

                 <div className="space-y-4">
                    <Label htmlFor="description" className="text-base font-medium text-foreground/80">Descrição detalhada</Label>
                    <Controller name="description" control={control} render={({ field }) => (
                      <Textarea 
                        id="description" 
                        className="min-h-[160px] p-4 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all resize-y text-base placeholder:text-muted-foreground/50 leading-relaxed" 
                        placeholder="Conte a história desta peça. Mencione o estado, medidas exatas, material e qualquer defeito visível..." 
                        {...field} 
                      />
                    )} />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                 </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Section: Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-8">
                    <div className="space-y-4">
                        <Label htmlFor="brand" className="text-base font-medium text-foreground/80">Marca</Label>
                        <Controller name="brand" control={control} render={({ field }) => <SelectOrInput id="brand" options={PREDEFINED_BRANDS} placeholder="Selecione ou digite" {...field} />} />
                        {errors.brand && <p className="text-sm text-destructive">{errors.brand.message}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="material" className="text-base font-medium text-foreground/80">Material Principal</Label>
                        <Controller name="material" control={control} render={({ field }) => <SelectOrInput id="material" options={PREDEFINED_MATERIALS} placeholder="Selecione ou digite" {...field} />} />
                        {errors.material && <p className="text-sm text-destructive">{errors.material.message}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="sizes" className="text-base font-medium text-foreground/80">Tamanho</Label>
                        <Controller name="sizes" control={control} render={({ field }) => (
                          <Input 
                            id="sizes" 
                            className="h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all" 
                            placeholder="Ex: M, 38, 40" 
                            {...field} 
                            value={field.value ?? ''} 
                          />
                        )} />
                        {errors.sizes && <p className="text-sm text-destructive">{errors.sizes.message}</p>}
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-4">
                        <Label className="text-base font-medium text-foreground/80">Categoria</Label>
                         <Controller name="category" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Roupa">Roupa</SelectItem>
                                    <SelectItem value="Calçado">Calçado</SelectItem>
                                    <SelectItem value="Livros">Livros</SelectItem>
                                    <SelectItem value="Eletrónica">Eletrónica</SelectItem>
                                    <SelectItem value="Móveis">Móveis</SelectItem>
                                    <SelectItem value="Decoração">Decoração</SelectItem>
                                    <SelectItem value="Esportes">Esportes</SelectItem>
                                    <SelectItem value="Jogos">Jogos</SelectItem>
                                    <SelectItem value="Arte">Arte</SelectItem>
                                    <SelectItem value="Outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                         )}/>
                        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-4">
                        <Label className="text-base font-medium text-foreground/80">Condição</Label>
                         <Controller name="condition" control={control} render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger className="h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all"><SelectValue placeholder="Selecione" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Novo">Novo com etiqueta</SelectItem>
                                    <SelectItem value="Muito bom">Excelente estado</SelectItem>
                                    <SelectItem value="Bom">Bom estado</SelectItem>
                                </SelectContent>
                            </Select>
                         )}/>
                        {errors.condition && <p className="text-sm text-destructive">{errors.condition.message}</p>}
                    </div>
                     <div className="space-y-4">
                        <Label htmlFor="quantity" className="text-base font-medium text-foreground/80">Quantidade</Label>
                        <Controller name="quantity" control={control} render={({ field }) => (
                          <Input 
                            id="quantity" 
                            type="number" 
                            step="1" 
                            className="h-12 rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all" 
                            placeholder="1" 
                            {...field} 
                            value={field.value ?? ''} 
                          />
                        )} />
                        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity.message}</p>}
                    </div>
                </div>
            </div>

            <div className="h-px bg-border/50" />

            {/* Section: Price */}
            <div className="space-y-6">
                <Label htmlFor="price" className="text-xl font-serif font-medium">Defina o preço</Label>
                <div className="relative max-w-xs">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">€</span>
                    <Controller name="price" control={control} render={({ field }) => (
                      <Input 
                        id="price" 
                        type="number" 
                        step="0.01" 
                        className="h-16 pl-10 text-2xl font-medium rounded-xl bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/30" 
                        placeholder="0.00" 
                        {...field} 
                        value={field.value ?? ''} 
                      />
                    )} />
                </div>
                {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
                <p className="text-sm text-muted-foreground">O preço inclui taxas de proteção ao vendedor.</p>
            </div>

            <div className="pt-8">
                 <Button type="submit" className="w-full h-14 text-lg font-medium rounded-xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]" size="lg" disabled={isSubmitting || authLoading}>
                    {(isSubmitting || authLoading) && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Publicar Anúncio
                 </Button>
            </div>
        </form>
      </CardContent>
    </Card>
    </div>
  );
}