import React, { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Package
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function Checkout() {
  const { cartItems, subtotal, total, clearCart, isVerificationEnabled, verificationFee } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    address: '',
    city: '',
    zipCode: '',
    country: 'Portugal',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.address || !formData.city || !formData.zipCode) {
      toast({
        title: "Campos em falta",
        description: "Por favor preencha todos os campos de envio.",
        variant: "destructive"
      });
      return;
    }
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      toast({
        title: "Dados de pagamento inválidos",
        description: "Por favor verifique os dados do seu cartão.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create Order in Firestore
      if (user) {
        await addDoc(collection(db, 'orders'), {
          userId: user.uid,
          items: cartItems,
          subtotal,
          total,
          shippingAddress: {
            fullName: formData.fullName,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode,
            country: formData.country
          },
          status: 'processing',
          createdAt: serverTimestamp(),
          paymentMethod: 'credit_card', // Mocked
          isVerificationEnabled
        });
      }

      clearCart();
      setStep('confirmation');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao processar o seu pedido. Por favor tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cartItems.length === 0 && step !== 'confirmation') {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold">O seu carrinho está vazio</h1>
        <p className="mb-8 text-muted-foreground">Adicione alguns produtos antes de finalizar a compra.</p>
        <Button asChild>
          <Link to="/catalog">Ver Catálogo</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="container mx-auto px-4">
        {/* Header / Progress */}
        <div className="mb-12 flex flex-col items-center justify-center space-y-4 md:flex-row md:space-y-0">
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'shipping' || step === 'payment' || step === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
            <span className={`ml-2 text-sm font-medium ${step === 'shipping' ? 'text-foreground' : 'text-muted-foreground'}`}>Envio</span>
          </div>
          <div className="mx-4 h-[2px] w-12 bg-border md:w-24" />
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'payment' || step === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</div>
            <span className={`ml-2 text-sm font-medium ${step === 'payment' ? 'text-foreground' : 'text-muted-foreground'}`}>Pagamento</span>
          </div>
          <div className="mx-4 h-[2px] w-12 bg-border md:w-24" />
          <div className="flex items-center">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${step === 'confirmation' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>3</div>
            <span className={`ml-2 text-sm font-medium ${step === 'confirmation' ? 'text-foreground' : 'text-muted-foreground'}`}>Confirmação</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-7 xl:col-span-8">
            {step === 'shipping' && (
              <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 border-b pb-4">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Morada de Envio</h2>
                </div>
                
                <form id="shipping-form" onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} 
                        placeholder="João Silva"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        placeholder="joao@exemplo.com"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Morada</Label>
                    <Input 
                      id="address" 
                      name="address" 
                      value={formData.address} 
                      onChange={handleInputChange} 
                      placeholder="Rua Principal, nº 123, 1º Esq"
                      required 
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input 
                        id="city" 
                        name="city" 
                        value={formData.city} 
                        onChange={handleInputChange} 
                        placeholder="Lisboa"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">Código Postal</Label>
                      <Input 
                        id="zipCode" 
                        name="zipCode" 
                        value={formData.zipCode} 
                        onChange={handleInputChange} 
                        placeholder="1000-001"
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input 
                        id="country" 
                        name="country" 
                        value={formData.country} 
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-6 rounded-xl border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-semibold">Pagamento Seguro</h2>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Lock className="h-3 w-3" />
                    Encriptação SSL de 256-bits
                  </div>
                </div>

                <form id="payment-form" onSubmit={handlePaymentSubmit} className="space-y-6">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <Label className="text-base">Cartão de Crédito / Débito</Label>
                      <div className="flex gap-2">
                        <div className="h-6 w-10 rounded bg-white shadow-sm"></div>
                        <div className="h-6 w-10 rounded bg-white shadow-sm"></div>
                        <div className="h-6 w-10 rounded bg-white shadow-sm"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <div className="relative">
                          <Input 
                            id="cardNumber" 
                            name="cardNumber" 
                            value={formData.cardNumber} 
                            onChange={handleInputChange} 
                            placeholder="0000 0000 0000 0000"
                            className="pl-10"
                            required 
                          />
                          <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Validade (MM/AA)</Label>
                          <Input 
                            id="expiryDate" 
                            name="expiryDate" 
                            value={formData.expiryDate} 
                            onChange={handleInputChange} 
                            placeholder="MM/AA"
                            required 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input 
                            id="cvv" 
                            name="cvv" 
                            value={formData.cvv} 
                            onChange={handleInputChange} 
                            placeholder="123"
                            type="password"
                            maxLength={3}
                            required 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input 
                          id="cardName" 
                          name="cardName" 
                          value={formData.cardName} 
                          onChange={handleInputChange} 
                          placeholder="Como aparece no cartão"
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
                    <ShieldCheck className="h-5 w-5 flex-shrink-0" />
                    <p>O seu pagamento é processado de forma segura. Não guardamos os dados do seu cartão.</p>
                  </div>
                </form>
              </div>
            )}

            {step === 'confirmation' && (
              <div className="flex flex-col items-center justify-center space-y-6 rounded-xl border bg-card p-12 text-center shadow-sm">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold">Pagamento Confirmado!</h2>
                  <p className="text-muted-foreground">Obrigado pela sua compra. Enviámos um email de confirmação para {formData.email}.</p>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" asChild>
                    <Link to="/profile">Ver as minhas compras</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/catalog">Continuar a comprar</Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            {step !== 'confirmation' && (
              <div className="mt-6 flex justify-between">
                {step === 'payment' ? (
                  <Button variant="outline" onClick={() => setStep('shipping')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                  </Button>
                ) : (
                  <Button variant="ghost" asChild>
                    <Link to="/catalog">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Continuar a comprar
                    </Link>
                  </Button>
                )}

                {step === 'shipping' ? (
                  <Button type="submit" form="shipping-form" className="px-8">
                    Continuar para Pagamento
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button type="submit" form="payment-form" className="px-8" disabled={isLoading}>
                    {isLoading ? (
                      <>A processar...</>
                    ) : (
                      <>
                        Pagar {total.toFixed(2)}€
                        <Lock className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          {step !== 'confirmation' && (
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 rounded-xl border bg-card p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold">Resumo do Pedido</h3>
                
                <div className="mb-6 max-h-[300px] overflow-y-auto pr-2 space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                        <img 
                          src={item.product.imageUrls[0]} 
                          alt={item.product.name} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col justify-center">
                        <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                        <p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p>
                      </div>
                      <div className="flex flex-col justify-center items-end">
                        <span className="text-sm font-medium">{(item.product.price * item.quantity).toFixed(2)}€</span>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  {isVerificationEnabled && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa de Verificação</span>
                      <span>{verificationFee.toFixed(2)}€</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envio</span>
                    <span className="text-green-600 font-medium">Grátis</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Entrega estimada: 2-3 dias úteis</span>
                  </div>
                  <div className="flex items-center gap-3 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Garantia de reembolso de 30 dias</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
