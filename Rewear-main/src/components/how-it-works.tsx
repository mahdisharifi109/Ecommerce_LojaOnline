import { Camera, MessageCircle, Package } from 'lucide-react';

const steps = [
  {
    icon: Camera,
    title: "Fotografe",
    description: "Tire fotos claras do artigo e escreva uma descrição honesta do estado."
  },
  {
    icon: MessageCircle,
    title: "Negocie",
    description: "Responda às mensagens dos interessados e combine os detalhes da entrega."
  },
  {
    icon: Package,
    title: "Envie",
    description: "Embale o artigo com cuidado e envie-o através do método combinado."
  }
];

export function HowItWorks() {
  return (
    <section className="bg-muted/30 py-16 sm:py-20">
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            Como funciona
          </h2>
          <p className="mt-3 text-muted-foreground">
            Três passos para vender os seus artigos
          </p>
        </div>
        
        <div className="mx-auto mt-12 grid max-w-4xl gap-8 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative text-center">
              {/* Linha conectora (apenas entre cards) */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-8 hidden h-px w-full bg-border sm:block" />
              )}
              
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-7 w-7 text-primary" />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              
              <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}