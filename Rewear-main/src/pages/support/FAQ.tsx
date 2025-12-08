import { MetaHead } from "@/components/seo/meta-head";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, ShoppingBag, Tag, Truck } from "lucide-react";

export default function FAQ() {
  return (
    <>
      <MetaHead 
        title="Ajuda & FAQ | Rewear" 
        description="Encontre respostas rápidas para as suas dúvidas."
      />
      
      {/* Hero Search */}
      <div className="bg-muted/30 py-16 border-b">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <div className="inline-flex p-3 bg-background rounded-full mb-6 shadow-sm text-primary">
            <HelpCircle className="h-8 w-8" />
          </div>
          <h1 className="font-heading text-4xl md:text-5xl mb-6">Como podemos ajudar?</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input 
              placeholder="Pesquise por 'envios', 'pagamentos', 'devoluções'..." 
              className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-transparent focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-3xl">
        
        {/* Section: Comprar */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl">Comprar</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="buy-1" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">É seguro comprar na Rewear?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Absolutamente. O seu pagamento fica retido connosco até receber o artigo e confirmar que está tudo bem. 
                Se o artigo nunca chegar ou for diferente da descrição, devolvemos o seu dinheiro.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="buy-2" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">Como sei se a peça é autêntica?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                A nossa comunidade é vigilante e a nossa equipa revê anúncios suspeitos. Para peças de luxo, 
                oferecemos um serviço de autenticação opcional por especialistas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Section: Vender */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl">Vender</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="sell-1" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">Quanto custa vender?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Publicar é grátis! Apenas cobramos uma taxa de 15% quando (e se) vender a sua peça. 
                Sem custos escondidos.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="sell-2" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">Como recebo o meu dinheiro?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Assim que o comprador confirmar a receção (ou 3 dias após a entrega), o saldo fica disponível na sua carteira Rewear. 
                Pode transferir para a sua conta bancária a qualquer momento.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Section: Envios */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="h-6 w-6 text-primary" />
            <h2 className="font-heading text-2xl">Envios</h2>
          </div>
          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="ship-1" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">Quem paga os portes?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Normalmente, os portes são pagos pelo comprador no momento do checkout. O vendedor recebe uma etiqueta pré-paga para imprimir.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="ship-2" className="border rounded-xl px-4">
              <AccordionTrigger className="hover:no-underline py-4 text-lg">Enviam para as ilhas?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4">
                Sim! A Rewear funciona em todo o território nacional, incluindo Açores e Madeira.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="text-center bg-primary/5 p-8 rounded-2xl">
          <p className="font-medium mb-2">Ainda com dúvidas?</p>
          <p className="text-muted-foreground mb-4">A nossa equipa de suporte é rápida e simpática.</p>
          <a href="/contact" className="text-primary font-bold hover:underline">Falar com Suporte &rarr;</a>
        </div>

      </div>
    </>
  );
}
