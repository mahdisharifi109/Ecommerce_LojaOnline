import { MetaHead } from "@/components/seo/meta-head";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const articles = [
  {
    id: 1,
    title: "Como cuidar das suas peças de seda vintage",
    excerpt: "A seda é um material nobre mas delicado. Aprenda os segredos para manter as suas peças impecáveis por décadas.",
    category: "Guia de Cuidados",
    date: "7 Dez 2025",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000&auto=format&fit=crop",
    slug: "cuidar-seda-vintage"
  },
  {
    id: 2,
    title: "O impacto real da Fast Fashion",
    excerpt: "Números que assustam e como a moda circular está a mudar o paradigma do consumo global.",
    category: "Sustentabilidade",
    date: "5 Dez 2025",
    image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop",
    slug: "impacto-fast-fashion"
  },
  {
    id: 3,
    title: "Tendências de Inverno: O regresso dos anos 90",
    excerpt: "Minimalismo, cortes retos e tons neutros. Veja como incorporar o estilo dos anos 90 no seu guarda-roupa atual.",
    category: "Estilo",
    date: "1 Dez 2025",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000&auto=format&fit=crop",
    slug: "tendencias-inverno-90s"
  }
];

export default function Journal() {
  return (
    <>
      <MetaHead 
        title="Journal | Rewear" 
        description="Histórias sobre moda sustentável, guias de cuidados e inspiração de estilo."
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16 space-y-4">
          <h1 className="font-heading text-4xl md:text-6xl font-medium">
            The <span className="italic text-primary">Journal</span>.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorações sobre estilo, sustentabilidade e a arte de viver com menos, mas melhor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Link 
              key={article.id} 
              to={`/journal/${article.slug}`}
              className="group cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted mb-4">
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground uppercase tracking-wider">
                  <span>{article.category}</span>
                  <span>{article.date}</span>
                </div>
                <h2 className="font-heading text-xl font-medium group-hover:text-primary transition-colors">
                  {article.title}
                </h2>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
