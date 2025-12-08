import { MetaHead } from "@/components/seo/meta-head";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Coffee, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Recebido! ✨",
        description: "Já estamos a ler a sua mensagem. Respondemos em breve!",
        className: "bg-green-50 border-green-200 text-green-800",
      });
    }, 1500);
  };

  return (
    <>
      <MetaHead 
        title="Vamos Conversar | Rewear" 
        description="Entre em contacto com a equipa da Rewear. Estamos aqui para ajudar."
      />
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Hospitality Vibe */}
          <div className="space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-6">
                <Coffee className="h-4 w-4" /> Virtual Coffee Shop
              </div>
              <h1 className="font-heading text-5xl md:text-6xl mb-6 leading-tight">
                Adoramos ouvir <br/>
                <span className="italic text-primary">histórias</span>.
              </h1>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                Seja para resolver um problema, dar uma sugestão ou apenas partilhar o quanto amou a sua nova peça vintage. 
                A nossa equipa (humanos reais!) está pronta para ouvir.
              </p>
            </div>

            <div className="space-y-6">
              <a href="mailto:suporte@rewear.pt" className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group cursor-pointer">
                <div className="p-3 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Email</h3>
                  <p className="text-muted-foreground">suporte@rewear.pt</p>
                </div>
              </a>

              <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                <div className="p-3 bg-green-50 rounded-full text-green-600 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">WhatsApp</h3>
                  <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                    Chamar no Zap (+351 910 000 000)
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group">
                <div className="p-3 bg-purple-50 rounded-full text-purple-600 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">Atelier</h3>
                  <p className="text-muted-foreground">LX Factory, Lisboa (Visitas por marcação)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Friendly Form */}
          <div className="bg-white dark:bg-card p-8 md:p-10 rounded-[2rem] shadow-xl shadow-primary/5 border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-10 -mt-10"></div>
            
            <h3 className="font-heading text-2xl mb-6 relative z-10">Envie uma mensagem 👇</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium ml-1">Como se chama?</label>
                  <Input id="name" placeholder="Seu nome" className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all" required />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium ml-1">Onde respondemos?</label>
                  <Input id="email" type="email" placeholder="seu@email.com" className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all" required />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium ml-1">Assunto</label>
                <Input id="subject" placeholder="No que podemos ajudar hoje?" className="rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium ml-1">Sua mensagem</label>
                <Textarea 
                  id="message" 
                  placeholder="Conte-nos tudo..." 
                  className="min-h-[150px] rounded-xl bg-muted/30 border-transparent focus:bg-background transition-all resize-none"
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full rounded-xl h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "A enviar..." : "Enviar com carinho ✨"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
