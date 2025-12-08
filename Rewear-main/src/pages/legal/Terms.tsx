import { MetaHead } from "@/components/seo/meta-head";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Scale, FileText, CreditCard, AlertTriangle, Truck, HeartHandshake } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Terms() {
  return (
    <>
      <MetaHead 
        title="Termos de Uso | Rewear" 
        description="As regras da casa, explicadas de forma simples e justa."
      />
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-100 px-4 py-1 text-sm rounded-full">
            Regras da Casa 🏠
          </Badge>
          <h1 className="font-heading text-4xl md:text-5xl font-medium">
            Termos e <span className="italic text-primary">Condições</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Porque boas cercas fazem bons vizinhos. Aqui está como garantimos que a Rewear 
            é um lugar seguro e feliz para todos.
          </p>
        </div>

        <div className="grid gap-6">
          <Accordion type="single" collapsible className="w-full space-y-4">
            
            {/* Item 1 */}
            <AccordionItem value="item-1" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-blue-50 rounded-full text-blue-600">
                    <HeartHandshake className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">O Básico</h3>
                    <p className="text-sm text-muted-foreground font-normal">Respeito e bom senso acima de tudo.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  Ao usar a Rewear, você concorda em ser um humano decente. Isso significa:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Não vender artigos falsificados (temos tolerância zero).</li>
                  <li>Ser honesto sobre o estado das peças (se tem um furo, diga que tem um furo).</li>
                  <li>Tratar os outros membros da comunidade com gentileza.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            {/* Item 2 */}
            <AccordionItem value="item-2" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-green-50 rounded-full text-green-600">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Pagamentos & Vendas</h3>
                    <p className="text-sm text-muted-foreground font-normal">Como o dinheiro circula.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  Para proteger todos, o dinheiro não vai diretamente para o vendedor.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>O comprador paga e a Rewear guarda o dinheiro.</li>
                  <li>O vendedor envia a peça.</li>
                  <li>O comprador recebe e confirma que está tudo ok.</li>
                  <li>Só então libertamos o dinheiro para o vendedor.</li>
                </ul>
                <p className="mt-4 text-sm bg-muted/50 p-3 rounded-lg inline-block">
                  💸 <strong>Taxa de Serviço:</strong> Cobramos uma pequena comissão de 15% para manter as luzes acesas e a plataforma segura.
                </p>
              </AccordionContent>
            </AccordionItem>

            {/* Item 3 */}
            <AccordionItem value="item-3" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-purple-50 rounded-full text-purple-600">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Envios</h3>
                    <p className="text-sm text-muted-foreground font-normal">Do ponto A para o ponto B.</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p>
                  Os vendedores têm <strong>3 dias úteis</strong> para enviar a peça após a venda. 
                  Se não o fizerem, a compra é cancelada e o comprador é reembolsado automaticamente.
                  Utilizamos parceiros de confiança para garantir que a sua preciosidade não se perde no caminho.
                </p>
              </AccordionContent>
            </AccordionItem>

             {/* Item 4 */}
             <AccordionItem value="item-4" className="border rounded-2xl px-6 bg-card/50">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="p-2 bg-red-50 rounded-full text-red-600">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">Devoluções</h3>
                    <p className="text-sm text-muted-foreground font-normal">E se algo correr mal?</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-[4.5rem]">
                <p className="mb-4">
                  Aceitamos devoluções se:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>O artigo for diferente da descrição.</li>
                  <li>O artigo for contrafeito.</li>
                  <li>O artigo chegar danificado.</li>
                </ul>
                <p className="mt-4">
                  Não aceitamos devoluções por "mudança de ideias" ou "não serviu", a menos que o vendedor individual concorde.
                </p>
              </AccordionContent>
            </AccordionItem>

          </Accordion>
        </div>

        <div className="mt-16 text-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Dúvidas sobre as regras? <a href="/contact" className="text-primary underline">Fale connosco</a>. <br/>
            Estamos aqui para ajudar, não para complicar.
          </p>
        </div>
      </div>
    </>
  );
}
