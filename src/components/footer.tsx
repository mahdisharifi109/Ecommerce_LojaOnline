import { Link } from "react-router-dom";

const footerLinks = {
  explorar: [
    { label: "Catálogo", href: "/catalog" },
    { label: "Roupa", href: "/catalog?category=Roupa" },
    { label: "Calçado", href: "/catalog?category=Calçado" },
    { label: "Acessórios", href: "/catalog?category=Acessórios" },
  ],
  vender: [
    { label: "Publicar anúncio", href: "/sell" },
    { label: "Painel de vendedor", href: "/dashboard" },
  ],
  informacao: [
    { label: "Sobre", href: "/about" },
    { label: "FAQ", href: "/faq" },
    { label: "Privacidade", href: "/privacy" },
    { label: "Termos", href: "/terms" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-block">
              <span className="font-heading text-3xl font-medium tracking-tight text-foreground">Rewear.</span>
            </Link>
            <p className="max-w-sm text-base leading-relaxed text-muted-foreground font-body">
              Curadoria de moda circular para quem acredita que o estilo não precisa custar o planeta. 
              Cada peça conta uma história.
            </p>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {/* Explorar */}
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground mb-6">
                Coleções
              </h3>
              <ul className="space-y-4">
                {footerLinks.explorar.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Vender */}
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground mb-6">
                Circular
              </h3>
              <ul className="space-y-4">
                {footerLinks.vender.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Informação */}
            <div>
              <h3 className="font-heading text-lg font-medium text-foreground mb-6">
                Consciência
              </h3>
              <ul className="space-y-4">
                {footerLinks.informacao.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 font-body"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-body uppercase tracking-wider">
          <p>&copy; {currentYear} Rewear. Todos os direitos reservados.</p>
          <p className="flex items-center gap-2">
            Feito com amor e consciência <span className="text-primary">🌿</span>
          </p>
        </div>
      </div>
    </footer>
  );
}