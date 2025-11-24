import { useParams } from "react-router-dom";

export default function ProductDetail() {
  const { id } = useParams();
  return (
    <div className="container py-20 text-center">
      <h1 className="text-2xl font-bold">Detalhes do Produto {id}</h1>
      <p className="text-muted-foreground">Página em construção...</p>
    </div>
  );
}
