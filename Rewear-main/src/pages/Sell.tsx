import { SellForm } from "@/components/sell-form";

export default function Sell() {
  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Vender Artigo</h1>
        <p className="text-muted-foreground mt-2">Preencha os detalhes do seu artigo para o colocar à venda.</p>
      </div>
      <SellForm />
    </div>
  );
}
