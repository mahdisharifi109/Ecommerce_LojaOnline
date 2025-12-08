import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation, Link } from "react-router-dom";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowRight, Check, Mail, Lock, User } from "lucide-react";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Set initial state based on URL path
  useEffect(() => {
    if (location.pathname === "/register") {
      setIsLogin(false);
    } else {
      setIsLogin(true);
    }
  }, [location.pathname]);

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    // Update URL without reloading
    const newPath = !isLogin ? "/login" : "/register";
    window.history.pushState(null, "", newPath);
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate(redirectTo);
    } catch (err) {
      console.error("Google login error:", err);
      setError("Erro ao conectar com Google.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!auth) {
      setError("Erro interno: Autenticação não configurada.");
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // LOGIN LOGIC
        await signInWithEmailAndPassword(auth, email, password);
        navigate(redirectTo);
      } else {
        // REGISTER LOGIC
        if (password !== confirmPassword) {
          throw new Error("passwords-dont-match");
        }
        if (password.length < 6) {
          throw new Error("weak-password");
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: name });

        await setDoc(doc(db, "users", user.uid), {
          username: name,
          email: email,
          favorites: [],
          preferredBrands: [],
          preferredSizes: [],
          walletBalance: 0,
          wallet: { available: 0, pending: 0 },
          createdAt: serverTimestamp(),
        });

        navigate("/dashboard");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.message === "passwords-dont-match") {
        setError("As palavras-passe não coincidem.");
      } else if (err.message === "weak-password") {
        setError("A palavra-passe deve ter pelo menos 6 caracteres.");
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError("Credenciais inválidas.");
      } else if (err.code === 'auth/email-already-in-use') {
        setError("Este email já está a ser utilizado.");
      } else {
        setError("Ocorreu um erro. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F9F8F4]">
      {/* Left Side - Editorial Image */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop" 
          alt="Fashion Editorial" 
          className="absolute inset-0 w-full h-full object-cover opacity-90"
        />
        <div className="relative z-20 flex flex-col justify-center px-16 text-white h-full max-w-2xl">
          <h2 className="font-serif text-6xl leading-tight mb-6">
            Reinvente seu estilo. <br/>
            <span className="italic text-emerald-200">Salve o planeta.</span>
          </h2>
          <p className="text-lg font-light opacity-90 max-w-md leading-relaxed">
            Junte-se à comunidade que está redefinindo o luxo através da circularidade. Compre, venda e inspire-se.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-16 relative">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="font-serif text-4xl text-foreground">
              {isLogin ? "Bem-vindo de volta" : "Criar conta"}
            </h1>
            <p className="text-muted-foreground">
              {isLogin ? "Continue sua jornada sustentável" : "Comece a circular a moda hoje"}
            </p>
          </div>

          {/* Social Login */}
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" onClick={handleGoogleLogin} className="h-12 rounded-xl border-border/60 hover:bg-secondary/50 hover:border-primary/30 transition-all">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.17c-.22-.66-.35-1.36-.35-2.17s.13-1.51.35-2.17V7.69H2.18C.43 11.17.43 12.83.43 12.83c0 1.67.75 3.24 2.18 4.84l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12 rounded-xl border-border/60 hover:bg-secondary/50 hover:border-primary/30 transition-all">
              <svg className="mr-2 h-4 w-4 text-foreground" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.21-.93 3.69-.93 2.4.17 3.37 1.18 3.37 1.18-2.68 1.55-2.24 5.22.23 6.38-.18.58-.4 1.16-.67 1.74-.5.98-1.09 1.97-1.7 2.86zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Apple
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/40" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F9F8F4] px-2 text-muted-foreground">Ou continue com email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-800 rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="pl-10 h-12 bg-white border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 h-12 bg-white border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">Palavra-passe</Label>
                {isLogin && (
                  <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    Esqueceu?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 h-12 bg-white border-border/40 focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground/80">Confirmar Palavra-passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!isLogin}
                    className={`pl-10 h-12 bg-white border-border/40 focus:ring-4 focus:ring-primary/5 rounded-xl transition-all ${
                      confirmPassword && password === confirmPassword 
                        ? "border-emerald-500/50 focus:border-emerald-500" 
                        : "focus:border-primary/50"
                    }`}
                  />
                  {confirmPassword && password === confirmPassword && (
                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-in zoom-in" />
                  )}
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all mt-4"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  {isLogin ? "Entrar" : "Criar Conta"} <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Toggle */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">
              {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
              <button 
                onClick={toggleMode}
                className="font-medium text-primary hover:underline underline-offset-4 transition-all"
              >
                {isLogin ? "Registe-se agora" : "Entre aqui"}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
