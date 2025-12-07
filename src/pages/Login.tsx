import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Erro interno: Autenticação não configurada.");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate(redirectTo);
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential') {
        setError("Email ou palavra-passe incorretos.");
      } else if (err.code === 'auth/user-not-found') {
        setError("Utilizador não encontrado.");
      } else if (err.code === 'auth/wrong-password') {
        setError("Palavra-passe incorreta.");
      } else {
        setError("Ocorreu um erro ao iniciar sessão. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Aceda à sua conta Rewear
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-sm">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm">Palavra-passe</Label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Esqueceu?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="h-10"
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                A entrar...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link to="/register" className="font-medium text-foreground hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}
