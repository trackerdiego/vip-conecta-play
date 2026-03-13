import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import logoParadaVip from '@/assets/logo-parada-vip.png';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { user, role, loading } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || loading) return;
    if (user && role) {
      navigate(role === 'driver' ? '/driver/map' : '/influencer/dashboard', { replace: true });
    } else {
      navigate('/onboarding', { replace: true });
    }
  }, [ready, loading, user, role, navigate]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-background via-accent/60 to-background overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(263_70%_90%/0.4),transparent_60%)]" />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center gap-4"
      >
        <motion.img
          src={logoParadaVip}
          alt="Parada do Açaí VIP"
          className="h-28 w-auto drop-shadow-lg"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground text-sm"
        >
          Ganhe entregando ou indicando!
        </motion.p>
      </motion.div>
    </div>
  );
}
