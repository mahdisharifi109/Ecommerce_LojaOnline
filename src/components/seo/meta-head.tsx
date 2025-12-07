import { Helmet } from 'react-helmet-async';

interface MetaHeadProps {
  title?: string;
  description?: string;
  image?: string;
}

export function MetaHead({ 
  title = "Rewear | Moda Circular", 
  description = "Compre e venda moda de segunda mão com curadoria. O luxo da imperfeição.",
  image = "/og-image.jpg"
}: MetaHeadProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
