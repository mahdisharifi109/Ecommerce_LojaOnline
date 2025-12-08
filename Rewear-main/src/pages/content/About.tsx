import { MetaHead } from "@/components/seo/meta-head";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Sparkles, Users } from "lucide-react";

export default function About() {
  return (
    <>
      <MetaHead 
        title="Nossa História | Rewear" 
        description="Conheça a história da Rewear e a nossa missão de transformar a moda através da circularidade."
      />
      
      {/* Hero Section - Scrapbook Style */}
      <div className="container mx-auto px-4 py-16 md:py-24 overflow-hidden">
        <div className="max-w-5xl mx-auto">
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
            <div className="space-y-6 relative z-10">
              <span className="font-handwriting text-2xl text-primary -rotate-2 inline-block">
                Olá, somos a Rewear! 👋
              </span>
              <h1 className="font-heading text-5xl md:text-6xl font-medium leading-tight">
                Não é apenas roupa. <br/>
                É <span className="italic text-primary bg-primary/10 px-2">memória</span>.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed font-light">
                Acreditamos que cada peça tem uma alma. Um casaco não é apenas tecido; 
                é o abraço num dia frio, a testemunha de um primeiro encontro, o companheiro de viagem.
                Nós existimos para que essas histórias continuem.
              </p>
            </div>
            
            {/* Photo Collage Effect */}
            <div className="relative h-[400px] w-full hidden md:block">
              <div className="absolute top-0 right-10 w-64 h-80 bg-gray-200 rotate-3 shadow-xl border-8 border-white z-10 overflow-hidden rounded-sm">
                 <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1000&auto=format&fit=crop" alt="Equipa a trabalhar" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-yellow-100/80 rotate-1 shadow-sm"></div>
              </div>
              <div className="absolute bottom-10 left-10 w-56 h-64 bg-gray-300 -rotate-6 shadow-lg border-8 border-white z-0 overflow-hidden rounded-sm">
                 <img src="https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?q=80&w=1000&auto=format&fit=crop" alt="Tecidos vintage" className="w-full h-full object-cover" />
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-8 bg-blue-100/80 -rotate-2 shadow-sm"></div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            <ValueCard 
              icon={<Heart className="h-6 w-6 text-rose-500" />}
              title="Amor ao Detalhe"
              text="Curadoria feita à mão. Se não usaríamos, não vendemos."
              rotate="rotate-1"
            />
            <ValueCard 
              icon={<Users className="h-6 w-6 text-blue-500" />}
              title="Comunidade Real"
              text="Pessoas reais, armários reais. Sem bots, sem fast fashion."
              rotate="-rotate-1"
            />
            <ValueCard 
              icon={<Sparkles className="h-6 w-6 text-amber-500" />}
              title="Luxo Acessível"
              text="A qualidade deve ser para todos, não apenas para alguns."
              rotate="rotate-2"
            />
          </div>

          {/* Manifesto */}
          <div className="bg-[#FDFCF8] dark:bg-card p-12 md:p-20 text-center relative rounded-3xl border border-border/50 shadow-sm">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl shadow-lg">
              ✨
            </div>
            <h2 className="font-heading text-3xl md:text-4xl mb-6">O nosso compromisso</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              "Prometemos nunca vender algo que não amamos. Prometemos ser transparentes sobre cada defeito, 
              cada marca de uso, porque são elas que tornam a peça única. E prometemos plantar o futuro, 
              uma encomenda de cada vez."
            </p>
            <div className="font-handwriting text-xl text-primary">
              - A Equipa Rewear
            </div>
          </div>

          <div className="text-center pt-16">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <Link to="/catalog">Explorar o Arquivo</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

function ValueCard({ icon, title, text, rotate }: any) {
  return (
    <div className={`bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-border/40 hover:shadow-md transition-all hover:-translate-y-1 ${rotate}`}>
      <div className="mb-4 p-3 bg-muted/30 rounded-full w-fit">{icon}</div>
      <h3 className="font-heading text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
