import { MetaHead } from "@/components/seo/meta-head";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ShieldCheck, Cookie, Lock, Eye, FileText, Server } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Privacy() {
  return (
    <>
      <MetaHead 
        title="Privacidade & Transparência | Rewear" 
        description="A nossa política de privacidade explicada de forma simples e humana."
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-1 text-sm rounded-full">
            TL;DR (Resumo para quem tem pressa)
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-medium">
            Os seus dados são <span className="italic text-primary">seus</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nós apenas os guardamos com carinho para garantir que as suas roupas chegam ao destino certo. 
            Sem letras miúdas, sem "juridiquês".
          </p>
        </div>

        <div className="grid gap-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            
            {/* Item 1 */}
            <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Coleta de Dados</h3>
                    <p className="text-sm text-muted-foreground font-normal">O que guardamos e porquê?</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  Para que a magia aconteça (ou seja, para que você possa comprar e vender), precisamos de algumas informações básicas:
                </p>
                <ul className="list-disc list-inside space-y-2 mb-4">
                  <li><strong>Quem é você:</strong> Nome e Email (para criar sua conta).</li>
                  <li><strong>Onde mora:</strong> Morada (para enviar as encomendas).</li>
                  <li><strong>Pagamentos:</strong> Dados processados de forma segura pela Stripe (nós nunca vemos o número do seu cartão!).</li>
                </ul>
                <p className="text-sm bg-muted/50 p-3 rounded-lg inline-block">
                  🔒 <strong>Promessa Rewear:</strong> Nunca vendemos os seus dados. Jamais.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Item 2 */}
            <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-amber-50 rounded-full text-amber-600">
                    <Cookie className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Cookies & Biscoitos</h3>
                    <p className="text-sm text-muted-foreground font-normal">Para que servem?</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  Infelizmente não são de chocolate. Usamos cookies digitais para:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Manter a sua sessão iniciada (para não ter de fazer login sempre).</li>
                  <li>Lembrar o que colocou no carrinho de compras.</li>
                  <li>Entender como navega no site para o tornarmos melhor.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 3 */}
            <AccordionItem value="item-3" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Segurança</h3>
                    <p className="text-sm text-muted-foreground font-normal">Como protegemos tudo?</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p>
                  Utilizamos encriptação SSL (aquele cadeado na barra de endereço) em todas as páginas. 
                  Os nossos servidores são monitorizados 24/7 e seguimos as melhores práticas de segurança da indústria.
                  Dormimos tranquilos sabendo que os seus dados estão seguros.
                </p>
              </AccordionContent>
            </AccordionItem>

             {/* Item 4 */}
             <AccordionItem value="item-4" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                    <Eye className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Seus Direitos</h3>
                    <p className="text-sm text-muted-foreground font-normal">Quem manda aqui é você.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  A qualquer momento, você pode:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Pedir uma cópia de tudo o que sabemos sobre si.</li>
                  <li>Pedir para esquecermos tudo (apagar a conta).</li>
                  <li>Corrigir qualquer informação errada.</li>
                </ul>
                <p className="mt-4">
                  Basta enviar um email para <a href="mailto:privacidade@rewear.pt" className="text-primary underline">privacidade@rewear.pt</a>.
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        <div className="mt-16 text-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Esta política é válida a partir de Dezembro de 2025. <br/>
            Feita com transparência para humanos reais.
          </p>
        </div>
      </div>
    </>
  );
}
