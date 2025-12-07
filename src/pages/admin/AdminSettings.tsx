import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, Globe, ShieldAlert, Loader2 } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Rewear",
    maintenanceMode: false,
    allowRegistrations: true,
    supportEmail: "support@rewear.com"
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, "settings", "general");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings({ ...settings, ...docSnap.data() });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await setDoc(doc(db, "settings", "general"), settings);
      toast({ title: "Configurações salvas" });
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">Gerencie as configurações globais do sistema.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geral
            </CardTitle>
            <CardDescription>Informações básicas do site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Nome do Site</Label>
              <Input 
                id="siteName" 
                value={settings.siteName} 
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">Email de Suporte</Label>
              <Input 
                id="supportEmail" 
                value={settings.supportEmail} 
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>Controles sensíveis que afetam o acesso ao site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Manutenção</Label>
                <p className="text-sm text-muted-foreground">Desativa o acesso público ao site.</p>
              </div>
              <Switch 
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Permitir Registros</Label>
                <p className="text-sm text-muted-foreground">Novos usuários podem criar contas.</p>
              </div>
              <Switch 
                checked={settings.allowRegistrations}
                onCheckedChange={(checked) => setSettings({...settings, allowRegistrations: checked})}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
}
