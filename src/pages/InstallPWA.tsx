import { useState, useEffect } from 'react';
import { Download, Share, Plus, CheckCircle2, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import logoParadaVip from '@/assets/logo-parada-vip.png';

type Platform = 'android' | 'ios' | 'desktop';

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setIsInstalled(true));

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return { canInstall: !!deferredPrompt, isInstalled, install };
}

export default function InstallPWA() {
  const platform = detectPlatform();
  const { canInstall, isInstalled, install } = useInstallPrompt();

  if (isInstalled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-4"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">App já instalado!</h1>
          <p className="text-muted-foreground">Abra o Parada VIP pela tela inicial do seu celular.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-sm w-full space-y-8 text-center"
      >
        <div className="space-y-2">
          <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden shadow-lg mb-4">
            <img src="/pwa-icon-512.png" alt="Parada VIP" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Instalar Parada VIP</h1>
          <p className="text-muted-foreground text-sm">
            Instale o app no seu celular para uma experiência completa, sem precisar da App Store.
          </p>
        </div>

        {/* Android — botão direto */}
        {platform === 'android' && canInstall && (
          <Button onClick={install} size="lg" className="w-full gap-2">
            <Download className="w-5 h-5" />
            Instalar agora
          </Button>
        )}

        {/* Android sem prompt (navegador não suporta) */}
        {platform === 'android' && !canInstall && (
          <div className="space-y-4 text-left">
            <h2 className="font-semibold text-foreground">Como instalar:</h2>
            <div className="space-y-3">
              <Step n={1} icon={<Smartphone className="w-4 h-4" />}>
                Abra este link no <strong>Google Chrome</strong>
              </Step>
              <Step n={2} icon={<Download className="w-4 h-4" />}>
                Toque no menu <strong>⋮</strong> (3 pontinhos)
              </Step>
              <Step n={3} icon={<Plus className="w-4 h-4" />}>
                Selecione <strong>"Adicionar à tela inicial"</strong>
              </Step>
            </div>
          </div>
        )}

        {/* iOS */}
        {platform === 'ios' && (
          <div className="space-y-4 text-left">
            <h2 className="font-semibold text-foreground">Como instalar no iPhone:</h2>
            <div className="space-y-3">
              <Step n={1} icon={<Smartphone className="w-4 h-4" />}>
                Abra este link no <strong>Safari</strong>
              </Step>
              <Step n={2} icon={<Share className="w-4 h-4" />}>
                Toque no botão <strong>Compartilhar</strong> (ícone ↑)
              </Step>
              <Step n={3} icon={<Plus className="w-4 h-4" />}>
                Role e toque em <strong>"Adicionar à Tela de Início"</strong>
              </Step>
            </div>
          </div>
        )}

        {/* Desktop */}
        {platform === 'desktop' && canInstall && (
          <Button onClick={install} size="lg" className="w-full gap-2">
            <Download className="w-5 h-5" />
            Instalar no computador
          </Button>
        )}

        {platform === 'desktop' && !canInstall && (
          <p className="text-muted-foreground text-sm">
            Acesse este link pelo celular para instalar o app.
          </p>
        )}
      </motion.div>
    </div>
  );
}

function Step({ n, icon, children }: { n: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
        {n}
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground pt-0.5">
        {icon}
        <span>{children}</span>
      </div>
    </div>
  );
}
