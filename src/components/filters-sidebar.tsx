import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCallback, useState, useEffect, useMemo } from 'react';
import { RotateCcw, Search, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

// Listas de opções expandidas
const categories = [
  "Mulher", "Homem", "Criança", "Unisexo",
  "Vestidos", "Tops & T-shirts", "Camisas & Blusas", "Casacos & Blusões", 
  "Calças & Jeans", "Saias", "Calções", "Malhas & Cardigans", 
  "Blazers & Fatos", "Macacões", "Roupa Desportiva", "Lingerie & Pijamas",
  "Sapatos", "Malas", "Acessórios", "Jóias", "Outros"
];

const brands = [
  "Zara", "H&M", "Nike", "Adidas", "Levi's", "Mango", "Pull&Bear", 
  "Stradivarius", "Bershka", "Massimo Dutti", "Bimba y Lola", 
  "Ralph Lauren", "Tommy Hilfiger", "Calvin Klein", "Gucci", 
  "Louis Vuitton", "Prada", "Chanel", "Dior", "Vintage", 
  "Shein", "Primark", "Asos", "New Balance", "Converse", "Vans",
  "Dr. Martens", "Michael Kors", "Pandora", "Swarovski", "Outras"
];

const materials = [
  { name: "Algodão", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=200&auto=format&fit=crop" },
  { name: "Linho", image: "https://images.unsplash.com/photo-1523676060187-f55189a71f5e?q=80&w=200&auto=format&fit=crop" },
  { name: "Lã", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=200&auto=format&fit=crop" },
  { name: "Seda", image: "https://images.unsplash.com/photo-1575909812264-3d862964595e?q=80&w=200&auto=format&fit=crop" },
  { name: "Caxemira", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=200&auto=format&fit=crop" },
  { name: "Pele", image: "https://images.unsplash.com/photo-1550223640-23097fc71cb2?q=80&w=200&auto=format&fit=crop" },
  { name: "Pele Sintética", image: "https://images.unsplash.com/photo-1550223640-23097fc71cb2?q=80&w=200&auto=format&fit=crop" },
  { name: "Denim", image: "https://images.unsplash.com/photo-1542272617-08f08630329e?q=80&w=200&auto=format&fit=crop" },
  { name: "Veludo", image: "https://images.unsplash.com/photo-1545959796-d428833167a0?q=80&w=200&auto=format&fit=crop" },
  { name: "Poliéster", image: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=200&auto=format&fit=crop" },
  { name: "Viscose", image: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=200&auto=format&fit=crop" },
  { name: "Nylon", image: "https://images.unsplash.com/photo-1504198458649-3128b932f49e?q=80&w=200&auto=format&fit=crop" },
  { name: "Reciclado", image: "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?q=80&w=200&auto=format&fit=crop" },
  { name: "Orgânico", image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=200&auto=format&fit=crop" }
];

const styles = [
  "Casual", "Chic", "Vintage", "Boho", "Streetwear", "Minimalista", 
  "Clássico", "Desportivo", "Festa", "Trabalho", "Y2K", "Grunge", "Preppy"
];

const conditions = ["Novo com etiqueta", "Novo sem etiqueta", "Muito bom", "Bom", "Satisfatório"];
const sizes = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Único"];

const colors = [
  { name: "Preto", hex: "#000000", border: false },
  { name: "Branco", hex: "#FFFFFF", border: true },
  { name: "Cinzento", hex: "#808080", border: false },
  { name: "Bege", hex: "#F5F5DC", border: true },
  { name: "Castanho", hex: "#8B4513", border: false },
  { name: "Vermelho", hex: "#FF0000", border: false },
  { name: "Rosa", hex: "#FFC0CB", border: false },
  { name: "Laranja", hex: "#FFA500", border: false },
  { name: "Amarelo", hex: "#FFFF00", border: true },
  { name: "Verde", hex: "#008000", border: false },
  { name: "Azul", hex: "#0000FF", border: false },
  { name: "Roxo", hex: "#800080", border: false },
  { name: "Dourado", hex: "#FFD700", border: false },
  { name: "Prateado", hex: "#C0C0C0", border: false },
  { name: "Multicolor", hex: "linear-gradient(135deg, #ff0000, #00ff00, #0000ff)", border: false, isGradient: true },
];

export function FiltersSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();

  // Estados para controlar os valores dos filtros
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]); 
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  
  const [brandSearch, setBrandSearch] = useState("");

  // Efeito para carregar os filtros a partir da URL
  useEffect(() => {
    const conditionsFromUrl = searchParams.get('conditions')?.split(',') || [];
    const brandsFromUrl = searchParams.get('brands')?.split(',') || [];
    const sizesFromUrl = searchParams.get('sizes')?.split(',') || [];
    const categoriesFromUrl = searchParams.get('categories')?.split(',') || [];
    const materialsFromUrl = searchParams.get('materials')?.split(',') || [];
    const stylesFromUrl = searchParams.get('styles')?.split(',') || [];
    const colorsFromUrl = searchParams.get('colors')?.split(',') || [];
    
    setSelectedConditions(conditionsFromUrl.filter(Boolean));
    setSelectedBrands(brandsFromUrl.filter(Boolean));
    setSelectedSizes(sizesFromUrl.filter(Boolean));
    setSelectedCategories(categoriesFromUrl.filter(Boolean));
    setSelectedMaterials(materialsFromUrl.filter(Boolean));
    setSelectedStyles(stylesFromUrl.filter(Boolean));
    setSelectedColors(colorsFromUrl.filter(Boolean));

    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice && maxPrice) {
      setPriceRange([Number(minPrice), Number(maxPrice)]);
    } else {
      setPriceRange([0, 1000]);
    }
  }, [searchParams]);

  // Função para criar a URL com os novos filtros
  const createQueryString = useCallback(
    (paramsToUpdate: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [name, value] of Object.entries(paramsToUpdate)) {
        if (value && value.length > 0) {
          params.set(name, value);
        } else {
          params.delete(name);
        }
      }
      return params.toString();
    },
    [searchParams]
  );

  // Função genérica para lidar com a mudança nos checkboxes
  const handleCheckboxChange = (
    value: string, 
    checked: boolean, 
    currentValues: string[], 
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    paramName: string
  ) => {
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(v => v !== value);
    setter(newValues);
    navigate(pathname + '?' + createQueryString({ [paramName]: newValues.join(',') }));
  };


  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
  };
  
  const applyPriceFilter = () => {
      navigate(pathname + '?' + createQueryString({ 
          minPrice: String(priceRange[0]), 
          // Se o máximo for 1000 (o valor do slider), enviamos 'Infinity' para o filtro
          maxPrice: String(priceRange[1] === 1000 ? Infinity : priceRange[1]) 
      }));
  };

  const clearFilters = () => {
    navigate(pathname);
  }

  // Filtrar marcas baseado na pesquisa
  const filteredBrands = useMemo(() => {
    if (!brandSearch) return brands;
    return brands.filter(brand => 
      brand.toLowerCase().includes(brandSearch.toLowerCase())
    );
  }, [brandSearch]);

  // Verifica se há filtros ativos
  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    selectedBrands.length > 0 ||
    selectedSizes.length > 0 ||
    selectedConditions.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedStyles.length > 0 ||
    selectedColors.length > 0 ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000;

  return (
    <div className="space-y-8 pr-4 pb-4 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between pb-6 border-b border-border/20 sticky top-0 bg-background/95 backdrop-blur-sm z-10 pt-2">
        <h2 className="font-serif text-3xl text-foreground">
          Filtros
        </h2>
        {hasActiveFilters && (
          <Button 
            onClick={clearFilters} 
            variant="ghost" 
            size="sm" 
            className="h-auto px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors gap-1.5 rounded-full"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Limpar tudo
          </Button>
        )}
      </div>

      <Accordion type="multiple" defaultValue={["price", "category", "size", "color"]} className="w-full space-y-4">
        
        {/* Filtro de Preço */}
        <AccordionItem value="price" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Preço</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4 px-1">
              <Slider
                value={priceRange}
                onValueChange={handlePriceChange}
                max={1000}
                step={10}
                className="py-2"
              />
              <div className="flex items-center justify-between gap-4">
                <div className="px-4 py-2 rounded-xl bg-secondary/30 border border-transparent text-sm font-medium min-w-[80px] text-center">
                  {priceRange[0]} €
                </div>
                <span className="text-muted-foreground/50 font-light">até</span>
                <div className="px-4 py-2 rounded-xl bg-secondary/30 border border-transparent text-sm font-medium min-w-[80px] text-center">
                  {priceRange[1] === 1000 ? '1000+' : priceRange[1]} €
                </div>
              </div>
              <Button 
                onClick={applyPriceFilter} 
                size="sm" 
                className="w-full h-10 rounded-xl shadow-none bg-primary/90 hover:bg-primary transition-all mt-2 font-medium"
              >
                Aplicar Preço
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Categoria */}
        <AccordionItem value="category" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Categoria</span>
          </AccordionTrigger>
          <AccordionContent>
            <ScrollArea className="h-[300px] pr-2 -mr-2">
              <div className="space-y-1 pt-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center gap-3 group/item hover:bg-secondary/30 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => handleCheckboxChange(cat, !selectedCategories.includes(cat), selectedCategories, setSelectedCategories, 'categories')}>
                    <Checkbox
                      id={`category-${cat}`}
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={(checked) => handleCheckboxChange(cat, !!checked, selectedCategories, setSelectedCategories, 'categories')}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30 rounded-md h-5 w-5"
                    />
                    <Label 
                      htmlFor={`category-${cat}`} 
                      className="cursor-pointer text-base font-normal text-muted-foreground group-hover/item:text-foreground transition-colors w-full"
                    >
                      {cat}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Tamanho */}
        <AccordionItem value="size" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Tamanho</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-4">
              {sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleCheckboxChange(size, !selectedSizes.includes(size), selectedSizes, setSelectedSizes, 'sizes')}
                  className={`
                    h-11 min-w-[44px] px-3 rounded-xl flex items-center justify-center text-sm font-medium transition-all duration-200 border
                    ${selectedSizes.includes(size)
                      ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105'
                      : 'bg-secondary/20 border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }
                  `}
                >
                  {size}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Cor (Visual Swatches) */}
        <AccordionItem value="color" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Cor</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-3 pt-4">
              {colors.map(color => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => handleCheckboxChange(color.name, !isSelected, selectedColors, setSelectedColors, 'colors')}
                    className={cn(
                      "w-9 h-9 rounded-full relative transition-all duration-300 hover:scale-110 focus:outline-none shadow-sm",
                      isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:shadow-md",
                      color.border ? "border border-border/50" : ""
                    )}
                    style={{ background: color.isGradient ? color.hex : color.hex }}
                    title={color.name}
                  >
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                        <Check className={cn("h-4 w-4", color.name === "Branco" || color.name === "Bege" || color.name === "Amarelo" ? "text-black/70" : "text-white")} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Marca */}
        <AccordionItem value="brand" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Marca</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input 
                  placeholder="Pesquisar marca..." 
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="h-11 pl-10 bg-secondary/20 border-transparent focus:bg-background focus:border-primary/20 focus:ring-4 focus:ring-primary/5 rounded-xl text-sm transition-all"
                />
              </div>
              <ScrollArea className="h-[200px] pr-2 -mr-2">
                <div className="space-y-1">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map(brand => (
                      <div key={brand} className="flex items-center gap-3 group/item hover:bg-secondary/30 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => handleCheckboxChange(brand, !selectedBrands.includes(brand), selectedBrands, setSelectedBrands, 'brands')}>
                        <Checkbox
                          id={`brand-${brand}`}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => handleCheckboxChange(brand, !!checked, selectedBrands, setSelectedBrands, 'brands')}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30 rounded-md h-5 w-5"
                        />
                        <Label 
                          htmlFor={`brand-${brand}`} 
                          className="cursor-pointer text-base font-normal text-muted-foreground group-hover/item:text-foreground transition-colors w-full"
                        >
                          {brand}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center italic">Nenhuma marca encontrada</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Condição */}
        <AccordionItem value="condition" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Condição</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1 pt-2">
              {conditions.map(condition => (
                <div key={condition} className="flex items-center gap-3 group/item hover:bg-secondary/30 p-2 rounded-lg transition-colors cursor-pointer" onClick={() => handleCheckboxChange(condition, !selectedConditions.includes(condition), selectedConditions, setSelectedConditions, 'conditions')}>
                  <Checkbox
                    id={`condition-${condition}`}
                    checked={selectedConditions.includes(condition)}
                    onCheckedChange={(checked) => handleCheckboxChange(condition, !!checked, selectedConditions, setSelectedConditions, 'conditions')}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary border-muted-foreground/30 rounded-md h-5 w-5"
                  />
                  <Label 
                    htmlFor={`condition-${condition}`} 
                    className="cursor-pointer text-base font-normal text-muted-foreground group-hover/item:text-foreground transition-colors w-full"
                  >
                    {condition}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Material (Visual Textures) */}
        <AccordionItem value="material" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Material</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid grid-cols-3 gap-3 pt-4">
              {materials.map(material => {
                const isSelected = selectedMaterials.includes(material.name);
                return (
                  <button
                    key={material.name}
                    type="button"
                    onClick={() => handleCheckboxChange(material.name, !isSelected, selectedMaterials, setSelectedMaterials, 'materials')}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden group transition-all duration-300 border-2",
                      isSelected ? "ring-2 ring-primary ring-offset-2 border-primary scale-105" : "border-transparent hover:border-primary/30 hover:shadow-md"
                    )}
                    title={material.name}
                  >
                    <img 
                      src={material.image} 
                      alt={material.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={cn(
                      "absolute inset-0 bg-black/20 transition-colors duration-300",
                      isSelected ? "bg-black/50" : "group-hover:bg-black/10"
                    )} />
                    
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center animate-in zoom-in duration-200">
                        <Check className="h-5 w-5 text-white drop-shadow-md" />
                      </div>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
                        <span className="text-[10px] text-white font-medium truncate block text-center px-1 pb-0.5">{material.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>

        <div className="h-px bg-border/30 w-full" />

        {/* Filtro de Estilo */}
        <AccordionItem value="style" className="border-none">
          <AccordionTrigger className="hover:no-underline py-2 group">
            <span className="font-serif text-xl text-foreground/80 group-hover:text-primary transition-colors">Estilo</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-wrap gap-2 pt-4">
              {styles.map(style => (
                <button
                  key={style}
                  type="button"
                  onClick={() => handleCheckboxChange(style, !selectedStyles.includes(style), selectedStyles, setSelectedStyles, 'styles')}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border
                    ${selectedStyles.includes(style)
                      ? 'bg-secondary text-secondary-foreground border-secondary-foreground/20 shadow-sm'
                      : 'bg-background border-border/40 text-muted-foreground hover:bg-secondary/30 hover:text-foreground hover:border-foreground/10'
                    }
                  `}
                >
                  {style}
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  );
}