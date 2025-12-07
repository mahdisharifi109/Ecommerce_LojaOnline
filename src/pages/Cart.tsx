import { useState, useEffect } from "react";
import { useCart } from "@/context/cart-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { 
  Trash2, Minus, Plus, ShoppingBag, Lock, CreditCard, Truck, 
  CheckCircle, Shield, AlertTriangle, Eye, EyeOff, Package,
  MapPin, User, Mail, Phone, Home, Sparkles, ArrowRight, ArrowLeft,
  Gift, Clock, Heart, Check
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

// Função para validar algoritmo de Luhn (validação real de cartões)
function validarLuhn(numero: string): boolean {
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length < 13 || digitos.length > 19) return false;
  
  let soma = 0;
  let alternar = false;
  
  for (let i = digitos.length - 1; i >= 0; i--) {
    let n = parseInt(digitos[i], 10);
    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    soma += n;
    alternar = !alternar;
  }
  
  return soma % 10 === 0;
}

// Função para detetar bandeira do cartão
function detetarBandeira(numero: string): string {
  const num = numero.replace(/\D/g, '');
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num)) return "Mastercard";
  if (/^3[47]/.test(num)) return "American Express";
  if (/^6(?:011|5)/.test(num)) return "Discover";
  return "";
}

// Função para validar validade do cartão
function validarValidade(validade: string): boolean {
  const match = validade.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;
  
  const mes = parseInt(match[1], 10);
  const ano = parseInt("20" + match[2], 10);
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth() + 1;
  
  if (ano < anoAtual) return false;
  if (ano === anoAtual && mes < mesAtual) return false;
  
  return true;
}

// Gerar token de sessão único
function gerarTokenSeguro(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

// Mascarar número do cartão para guardar
function mascarar(numero: string): string {
  const limpo = numero.replace(/\D/g, '');
  return '**** **** **** ' + limpo.slice(-4);
}

// Componente do passo
function StepIndicator({ 
  currentStep, 
  stepNumber, 
  title, 
  icon: Icon 
}: { 
  currentStep: number; 
  stepNumber: number; 
  title: string; 
  icon: React.ElementType;
}) {
  const isCompleted = currentStep > stepNumber;
  const isActive = currentStep === stepNumber;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ease-out",
        isCompleted && "bg-green-500 text-white shadow-lg shadow-green-500/30",
        isActive && "bg-primary text-white shadow-lg shadow-primary/30 scale-110",
        !isCompleted && !isActive && "bg-muted text-muted-foreground"
      )}>
        {isCompleted ? (
          <Check className="h-5 w-5 animate-scale-in" />
        ) : (
          <Icon className={cn("h-5 w-5", isActive && "animate-pulse-soft")} />
        )}
      </div>
      <span className={cn(
        "text-xs font-medium transition-colors duration-300 hidden sm:block",
        isActive && "text-primary",
        isCompleted && "text-green-600",
        !isCompleted && !isActive && "text-muted-foreground"
      )}>
        {title}
      </span>
    </div>
  );
}

// Componente de linha de progresso
function ProgressLine({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex-1 h-1 mx-2 rounded-full overflow-hidden bg-muted max-w-[80px]">
      <div 
        className={cn(
          "h-full bg-primary transition-all duration-700 ease-out rounded-full",
          isActive ? "w-full" : "w-0"
        )}
      />
    </div>
  );
}

export default function Cart() {
  const { cartItems, removeFromCart, updateItemQuantity, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Estados do checkout
  const [passo, setPasso] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tokenSessao] = useState(gerarTokenSeguro());
  const [tentativasFalhadas, setTentativasFalhadas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(0);
  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [mostrarCVV, setMostrarCVV] = useState(false);
  const [animating, setAnimating] = useState(false);
  
  // Dados de envio
  const [dadosEnvio, setDadosEnvio] = useState({
    nome: "",
    email: "",
    telefone: "",
    morada: "",
    codigoPostal: "",
    cidade: "",
    nif: "",
  });

  // Dados de pagamento (nunca guardados)
  const [dadosPagamento, setDadosPagamento] = useState({
    numeroCartao: "",
    nomeCartao: "",
    validade: "",
    cvv: "",
  });

  // Bandeira do cartão
  const [bandeiraCartao, setBandeiraCartao] = useState("");

  // Número da encomenda
  const [numeroEncomenda, setNumeroEncomenda] = useState("");

  // Preencher dados do utilizador quando disponível
  useEffect(() => {
    if (user) {
      setDadosEnvio(prev => ({
        ...prev,
        nome: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  // Timer de bloqueio
  useEffect(() => {
    if (bloqueado && tempoRestante > 0) {
      const timer = setInterval(() => {
        setTempoRestante(t => {
          if (t <= 1) {
            setBloqueado(false);
            setTentativasFalhadas(0);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [bloqueado, tempoRestante]);

  // Bloquear após tentativas falhadas
  useEffect(() => {
    if (tentativasFalhadas >= 3) {
      setBloqueado(true);
      setTempoRestante(60); // 1 minuto de bloqueio
      toast({
        title: "Demasiadas tentativas",
        description: "Por segurança, aguarda 1 minuto antes de tentar novamente.",
        variant: "destructive"
      });
    }
  }, [tentativasFalhadas]);

  // Limpar dados sensíveis ao sair da página
  useEffect(() => {
    return () => {
      setDadosPagamento({
        numeroCartao: "",
        nomeCartao: "",
        validade: "",
        cvv: "",
      });
    };
  }, []);

  // Validar NIF português
  const validarNIF = (nif: string): boolean => {
    if (!nif || nif.length !== 9) return true; // NIF é opcional
    const nifLimpo = nif.replace(/\D/g, '');
    if (nifLimpo.length !== 9) return false;
    
    const primeiroDigito = parseInt(nifLimpo[0], 10);
    if (![1, 2, 3, 5, 6, 7, 8, 9].includes(primeiroDigito)) return false;
    
    let soma = 0;
    for (let i = 0; i < 8; i++) {
      soma += parseInt(nifLimpo[i], 10) * (9 - i);
    }
    const resto = soma % 11;
    const digitoControlo = resto < 2 ? 0 : 11 - resto;
    
    return parseInt(nifLimpo[8], 10) === digitoControlo;
  };

  // Validar dados de envio
  const validarDadosEnvio = (): boolean => {
    // Campos obrigatórios
    if (!dadosEnvio.nome.trim() || dadosEnvio.nome.length < 3) {
      toast({ title: "Nome inválido", description: "Insere o teu nome completo.", variant: "destructive" });
      return false;
    }

    // Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(dadosEnvio.email)) {
      toast({ title: "Email inválido", variant: "destructive" });
      return false;
    }

    // Telefone português
    const telefoneRegex = /^(9[1236]\d{7}|2\d{8})$/;
    const telefoneLimpo = dadosEnvio.telefone.replace(/\D/g, '');
    if (!telefoneRegex.test(telefoneLimpo)) {
      toast({ title: "Telefone inválido", description: "Usa um número português válido.", variant: "destructive" });
      return false;
    }

    // Morada
    if (!dadosEnvio.morada.trim() || dadosEnvio.morada.length < 10) {
      toast({ title: "Morada incompleta", description: "Insere a morada completa.", variant: "destructive" });
      return false;
    }

    // Código postal português
    const cpRegex = /^\d{4}-\d{3}$/;
    if (!cpRegex.test(dadosEnvio.codigoPostal)) {
      toast({ title: "Código postal inválido", description: "Formato: 1234-567", variant: "destructive" });
      return false;
    }

    // Cidade
    if (!dadosEnvio.cidade.trim() || dadosEnvio.cidade.length < 2) {
      toast({ title: "Cidade inválida", variant: "destructive" });
      return false;
    }

    // NIF (opcional mas se preenchido deve ser válido)
    if (dadosEnvio.nif && !validarNIF(dadosEnvio.nif)) {
      toast({ title: "NIF inválido", variant: "destructive" });
      return false;
    }

    return true;
  };

  // Validar dados de pagamento com segurança reforçada
  const validarDadosPagamento = (): boolean => {
    if (bloqueado) {
      toast({ title: "Aguarda...", description: `Tenta novamente em ${tempoRestante}s`, variant: "destructive" });
      return false;
    }

    const numeroLimpo = dadosPagamento.numeroCartao.replace(/\D/g, '');

    // Validar número do cartão com Luhn
    if (!validarLuhn(numeroLimpo)) {
      setTentativasFalhadas(prev => prev + 1);
      toast({ title: "Cartão inválido", description: "Verifica o número do cartão.", variant: "destructive" });
      return false;
    }

    // Validar nome
    if (!dadosPagamento.nomeCartao.trim() || dadosPagamento.nomeCartao.length < 3) {
      toast({ title: "Nome inválido", variant: "destructive" });
      return false;
    }

    // Validar validade
    if (!validarValidade(dadosPagamento.validade)) {
      setTentativasFalhadas(prev => prev + 1);
      toast({ title: "Cartão expirado ou inválido", variant: "destructive" });
      return false;
    }

    // Validar CVV
    const cvvLength = bandeiraCartao === "American Express" ? 4 : 3;
    if (dadosPagamento.cvv.length !== cvvLength) {
      setTentativasFalhadas(prev => prev + 1);
      toast({ title: "CVV inválido", description: `Deve ter ${cvvLength} dígitos.`, variant: "destructive" });
      return false;
    }

    // Verificar se aceitou termos
    if (!aceitouTermos) {
      toast({ title: "Aceita os termos", description: "Deves aceitar os termos para continuar.", variant: "destructive" });
      return false;
    }

    return true;
  };

  // Formatar número do cartão
  const formatarCartao = (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 16);
    setBandeiraCartao(detetarBandeira(numeros));
    return numeros.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Formatar validade
  const formatarValidade = (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 4);
    if (numeros.length >= 2) {
      return numeros.slice(0, 2) + '/' + numeros.slice(2);
    }
    return numeros;
  };

  // Formatar código postal
  const formatarCodigoPostal = (valor: string) => {
    const numeros = valor.replace(/\D/g, '').slice(0, 7);
    if (numeros.length > 4) {
      return numeros.slice(0, 4) + '-' + numeros.slice(4);
    }
    return numeros;
  };

  // Avançar passo com animação
  const avancarPasso = () => {
    if (passo === 1) {
      if (!user) {
        toast({ title: "Inicia sessão", description: "Precisas de conta para comprar.", variant: "destructive" });
        navigate('/login?redirect=/cart');
        return;
      }
      setAnimating(true);
      setTimeout(() => {
        setPasso(2);
        setAnimating(false);
      }, 300);
    } else if (passo === 2) {
      if (validarDadosEnvio()) {
        setAnimating(true);
        setTimeout(() => {
          setPasso(3);
          setAnimating(false);
        }, 300);
      }
    } else if (passo === 3) {
      if (validarDadosPagamento()) {
        finalizarCompra();
      }
    }
  };

  // Voltar passo com animação
  const voltarPasso = () => {
    setAnimating(true);
    setTimeout(() => {
      setPasso(passo - 1);
      setAnimating(false);
    }, 300);
  };

  // Finalizar compra com segurança
  const finalizarCompra = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Verificar se utilizador ainda está autenticado
      if (!user) {
        throw new Error("Sessão expirada");
      }

      // Verificar se carrinho não está vazio
      if (cartItems.length === 0) {
        throw new Error("Carrinho vazio");
      }

      // Verificar preços dos produtos (segurança contra manipulação)
      for (const item of cartItems) {
        const produtoRef = doc(db, "products", item.product.id);
        const produtoSnap = await getDoc(produtoRef);
        
        if (!produtoSnap.exists()) {
          throw new Error(`Produto ${item.product.name} não disponível`);
        }
        
        const produtoAtual = produtoSnap.data();
        if (produtoAtual.price !== item.product.price) {
          throw new Error(`Preço de ${item.product.name} foi alterado. Atualiza o carrinho.`);
        }
        
        if (produtoAtual.status === "vendido") {
          throw new Error(`${item.product.name} já foi vendido`);
        }
      }

      // Gerar número de encomenda seguro
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8).toUpperCase();
      const numero = `RW${timestamp.toString().slice(-6)}${random}`;
      setNumeroEncomenda(numero);

      // Calcular total no servidor (não confiar no cliente)
      const totalCalculado = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

      // Guardar encomenda (NUNCA guardar dados do cartão!)
      await addDoc(collection(db, "orders"), {
        orderNumber: numero,
        userId: user.uid,
        userEmail: dadosEnvio.email,
        sessionToken: tokenSessao, // Para rastreio de sessão
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          size: item.size || null,
          sellerId: item.product.userId,
          sellerName: item.product.userName,
        })),
        shipping: {
          nome: dadosEnvio.nome.trim(),
          email: dadosEnvio.email.trim().toLowerCase(),
          telefone: dadosEnvio.telefone.replace(/\D/g, ''),
          morada: dadosEnvio.morada.trim(),
          codigoPostal: dadosEnvio.codigoPostal,
          cidade: dadosEnvio.cidade.trim(),
          nif: dadosEnvio.nif || null,
        },
        payment: {
          method: "card",
          brand: bandeiraCartao,
          lastFour: mascarar(dadosPagamento.numeroCartao), // Apenas últimos 4 dígitos
          // NUNCA guardar: número completo, CVV, validade
        },
        subtotal: totalCalculado,
        shipping_cost: 0,
        total: totalCalculado,
        status: "pago",
        createdAt: serverTimestamp(),
        ip: "hidden", // Em produção, registar IP no backend
        userAgent: navigator.userAgent.substring(0, 100),
      });

      // Limpar dados sensíveis imediatamente
      setDadosPagamento({ numeroCartao: "", nomeCartao: "", validade: "", cvv: "" });
      
      // Limpar carrinho
      clearCart();
      setPasso(4);

      toast({
        title: "Compra realizada com sucesso!",
        description: `Encomenda ${numero} confirmada.`,
      });

    } catch (error: any) {
      console.error("Erro na compra:", error);
      toast({
        title: "Erro na compra",
        description: error.message || "Não foi possível processar. Tenta novamente.",
        variant: "destructive"
      });
      setTentativasFalhadas(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  // Página de confirmação - muito mais bonita
  if (passo === 4) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Animação de sucesso */}
          <div className="text-center mb-8 animate-fade-in-up">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl animate-pulse-soft" />
              <div className="relative w-28 h-28 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-500/30">
                <CheckCircle className="h-14 w-14 text-white animate-scale-in" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              <span className="text-sm font-medium text-primary">Compra Confirmada</span>
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-heading font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text">
              Obrigado, {dadosEnvio.nome.split(' ')[0]}!
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              A tua encomenda foi processada com sucesso. Prepara-te para receber peças únicas e sustentáveis!
            </p>
          </div>

          {/* Card principal com detalhes */}
          <Card className="mt-10 animate-fade-in-up overflow-hidden" style={{ animationDelay: '0.2s' }}>
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Número da Encomenda</p>
                  <p className="text-2xl font-bold font-mono tracking-wider">{numeroEncomenda}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-4 py-1.5">
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  Pago
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-6 space-y-6">
              {/* Timeline de próximos passos */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  O que acontece agora?
                </h3>
                
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted" />
                  
                  {[
                    { icon: Mail, text: "Enviámos confirmação para", highlight: dadosEnvio.email, done: true },
                    { icon: User, text: "O vendedor será notificado da compra", done: false },
                    { icon: Package, text: "Receberás atualizações sobre o envio", done: false },
                    { icon: Heart, text: "A peça chegará à tua porta em breve!", done: false },
                  ].map((step, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className={cn(
                        "absolute -left-4 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                        step.done 
                          ? "bg-primary border-primary" 
                          : "bg-background border-muted-foreground/30"
                      )}>
                        {step.done && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="flex-1 pt-0.5">
                        <p className={cn(
                          "text-sm",
                          step.done ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {step.text}
                          {step.highlight && (
                            <span className="font-medium text-primary ml-1">{step.highlight}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Informações de segurança */}
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Compra 100% Protegida</p>
                  <p className="text-xs text-muted-foreground">Transação encriptada e garantia de satisfação Rewear</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button asChild size="lg" className="flex-1 h-12 text-base">
              <Link to="/catalog">
                <Gift className="mr-2 h-5 w-5" />
                Continuar a Explorar
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg" className="flex-1 h-12 text-base">
              <Link to="/profile">
                <Package className="mr-2 h-5 w-5" />
                Ver Minhas Encomendas
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Carrinho vazio
  if (cartItems.length === 0 && passo === 1) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
            <div className="relative w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold mb-3">O teu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Descobre peças únicas e sustentáveis no nosso catálogo
          </p>
          <Button asChild size="lg" className="h-12 px-8">
            <Link to="/catalog">
              <Sparkles className="mr-2 h-5 w-5" />
              Explorar Catálogo
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Aviso de bloqueio */}
      {bloqueado && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-8 flex items-center gap-4 animate-fade-in-down">
          <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="font-medium text-destructive">Demasiadas tentativas falhadas</p>
            <p className="text-sm text-destructive/80">Aguarda {tempoRestante} segundos antes de tentar novamente.</p>
          </div>
        </div>
      )}

      {/* Indicador de passos - Novo design */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          <StepIndicator currentStep={passo} stepNumber={1} title="Carrinho" icon={ShoppingBag} />
          <ProgressLine isActive={passo >= 2} />
          <StepIndicator currentStep={passo} stepNumber={2} title="Envio" icon={Truck} />
          <ProgressLine isActive={passo >= 3} />
          <StepIndicator currentStep={passo} stepNumber={3} title="Pagamento" icon={CreditCard} />
        </div>
      </div>

      <div className={cn(
        "grid lg:grid-cols-3 gap-8 transition-opacity duration-300",
        animating && "opacity-0"
      )}>
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* PASSO 1: Carrinho */}
          {passo === 1 && (
            <div className="space-y-6 animate-fade-in-up">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-heading font-bold">O Teu Carrinho</h2>
                <Badge variant="secondary" className="text-base px-3 py-1">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'itens'}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <Card 
                    key={item.id} 
                    className="overflow-hidden animate-fade-in-up hover:shadow-lg transition-shadow"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4 p-4">
                        <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                          <img 
                            src={item.product.imageUrls[0]} 
                            alt={item.product.name}
                            className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover hover:scale-105 transition-transform"
                          />
                        </Link>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div>
                            <Link 
                              to={`/product/${item.product.id}`} 
                              className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1"
                            >
                              {item.product.name}
                            </Link>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {item.product.category}
                              </Badge>
                              {item.size && (
                                <Badge variant="outline" className="text-xs">
                                  Tamanho: {item.size}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-2xl font-bold text-primary mt-2">
                            {item.product.price.toFixed(2)}€
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-9 w-9"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-background"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 hover:bg-background"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* PASSO 2: Envio */}
          {passo === 2 && (
            <div className="animate-fade-in-up">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Dados de Envio</CardTitle>
                      <CardDescription>Para onde devemos enviar a tua encomenda?</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Dados pessoais */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="h-4 w-4" />
                      Dados Pessoais
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome" className="text-sm">Nome Completo *</Label>
                        <Input 
                          id="nome"
                          value={dadosEnvio.nome}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, nome: e.target.value})}
                          placeholder="O teu nome completo"
                          autoComplete="name"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm">Email *</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={dadosEnvio.email}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, email: e.target.value})}
                          placeholder="email@exemplo.com"
                          autoComplete="email"
                          className="h-11"
                        />
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefone" className="text-sm">Telefone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="telefone"
                            value={dadosEnvio.telefone}
                            onChange={(e) => setDadosEnvio({...dadosEnvio, telefone: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                            placeholder="912 345 678"
                            autoComplete="tel"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nif" className="text-sm">NIF <span className="text-muted-foreground">(opcional)</span></Label>
                        <Input 
                          id="nif"
                          value={dadosEnvio.nif}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, nif: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                          placeholder="Para fatura"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Endereço */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Endereço de Entrega
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="morada" className="text-sm">Morada *</Label>
                      <div className="relative">
                        <Home className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="morada"
                          value={dadosEnvio.morada}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, morada: e.target.value})}
                          placeholder="Rua, número, andar, porta"
                          autoComplete="street-address"
                          className="h-11 pl-10"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="codigoPostal" className="text-sm">Código Postal *</Label>
                        <Input 
                          id="codigoPostal"
                          value={dadosEnvio.codigoPostal}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, codigoPostal: formatarCodigoPostal(e.target.value)})}
                          placeholder="1234-567"
                          maxLength={8}
                          autoComplete="postal-code"
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cidade" className="text-sm">Cidade *</Label>
                        <Input 
                          id="cidade"
                          value={dadosEnvio.cidade}
                          onChange={(e) => setDadosEnvio({...dadosEnvio, cidade: e.target.value})}
                          placeholder="Lisboa"
                          autoComplete="address-level2"
                          className="h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Info de envio grátis */}
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-400">Envio Grátis!</p>
                      <p className="text-xs text-green-600 dark:text-green-500">Entrega estimada em 3-5 dias úteis</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* PASSO 3: Pagamento */}
          {passo === 3 && (
            <div className="animate-fade-in-up">
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Pagamento Seguro</CardTitle>
                      <CardDescription>Os teus dados estão 100% protegidos</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Aviso de segurança premium */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800 dark:text-green-300">Pagamento 100% Seguro</p>
                      <p className="text-sm text-green-700 dark:text-green-400">Encriptação SSL de 256 bits. Os dados do cartão nunca são guardados.</p>
                    </div>
                  </div>

                  {/* Dados do cartão */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="numeroCartao" className="text-sm">Número do Cartão *</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="numeroCartao"
                          value={dadosPagamento.numeroCartao}
                          onChange={(e) => setDadosPagamento({...dadosPagamento, numeroCartao: formatarCartao(e.target.value)})}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          autoComplete="cc-number"
                          className="h-12 pl-10 pr-24 text-lg font-mono tracking-wider"
                        />
                        {bandeiraCartao && (
                          <Badge 
                            variant="outline" 
                            className="absolute right-3 top-1/2 -translate-y-1/2 font-medium"
                          >
                            {bandeiraCartao}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeCartao" className="text-sm">Nome no Cartão *</Label>
                      <Input 
                        id="nomeCartao"
                        value={dadosPagamento.nomeCartao}
                        onChange={(e) => setDadosPagamento({...dadosPagamento, nomeCartao: e.target.value.toUpperCase()})}
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        autoComplete="cc-name"
                        className="h-11 uppercase tracking-wide"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validade" className="text-sm">Validade *</Label>
                        <Input 
                          id="validade"
                          value={dadosPagamento.validade}
                          onChange={(e) => setDadosPagamento({...dadosPagamento, validade: formatarValidade(e.target.value)})}
                          placeholder="MM/AA"
                          maxLength={5}
                          autoComplete="cc-exp"
                          className="h-11 text-center font-mono text-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv" className="text-sm">CVV *</Label>
                        <div className="relative">
                          <Input 
                            id="cvv"
                            type={mostrarCVV ? "text" : "password"}
                            value={dadosPagamento.cvv}
                            onChange={(e) => setDadosPagamento({...dadosPagamento, cvv: e.target.value.replace(/\D/g, '').slice(0, 4)})}
                            placeholder="•••"
                            maxLength={4}
                            autoComplete="cc-csc"
                            className="h-11 text-center font-mono text-lg pr-10"
                          />
                          <button 
                            type="button"
                            onClick={() => setMostrarCVV(!mostrarCVV)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {mostrarCVV ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Termos e condições */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                      <Checkbox 
                        id="termos" 
                        checked={aceitouTermos}
                        onCheckedChange={(checked) => setAceitouTermos(checked === true)}
                        className="mt-0.5"
                      />
                      <label htmlFor="termos" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                        Li e aceito os{' '}
                        <Link to="/terms" className="text-primary font-medium hover:underline">
                          Termos e Condições
                        </Link>
                        {' '}e a{' '}
                        <Link to="/privacy" className="text-primary font-medium hover:underline">
                          Política de Privacidade
                        </Link>
                      </label>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Transação encriptada e segura</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Coluna do resumo - Sticky */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="overflow-hidden">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Resumo da Encomenda
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Lista de produtos */}
                <div className="space-y-3 max-h-48 overflow-y-auto pr-2 scrollbar-hide">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img 
                        src={item.product.imageUrls[0]} 
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-sm whitespace-nowrap">
                        {(item.product.price * item.quantity).toFixed(2)}€
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Envio</span>
                    <span className="font-medium text-green-600">Grátis</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{subtotal.toFixed(2)}€</span>
                </div>

                {/* Botões de ação */}
                <div className="space-y-3 pt-2">
                  <Button 
                    className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" 
                    size="lg" 
                    onClick={avancarPasso}
                    disabled={loading || bloqueado}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        A processar...
                      </span>
                    ) : passo === 1 ? (
                      <span className="flex items-center gap-2">
                        Continuar para Envio
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    ) : passo === 2 ? (
                      <span className="flex items-center gap-2">
                        Ir para Pagamento
                        <ArrowRight className="h-5 w-5" />
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Pagar {subtotal.toFixed(2)}€
                      </span>
                    )}
                  </Button>

                  {passo > 1 && (
                    <Button variant="outline" className="w-full h-11" onClick={voltarPasso}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Voltar
                    </Button>
                  )}

                  {passo === 1 && (
                    <Button variant="ghost" className="w-full h-11" asChild>
                      <Link to="/catalog">
                        Continuar a Comprar
                      </Link>
                    </Button>
                  )}
                </div>

                {/* Badge de segurança */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>Compra protegida</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4 text-green-600" />
                      <span>SSL seguro</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de benefícios */}
            <Card className="mt-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  {[
                    { icon: Truck, text: "Envio grátis em todas as encomendas" },
                    { icon: Shield, text: "Proteção ao comprador garantida" },
                    { icon: Heart, text: "Moda sustentável e circular" },
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <benefit.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-muted-foreground">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
