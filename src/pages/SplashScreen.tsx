import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ParticlesBackground } from '@/components/shared/ParticlesBackground';
import { useAuthStore } from '@/stores/authStore';

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
    <div className="fixed inset-0 flex items-center justify-center bg-brand-dark overflow-hidden">
      <ParticlesBackground />
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="z-10 flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute -inset-4 rounded-full bg-brand-purple/20 animate-pulse-ring" />
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-purple-light flex items-center justify-center shadow-xl glow-purple">
            <span className="text-4xl">🍇</span>
          </div>
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-heading text-3xl font-bold text-primary-foreground"
        >
          Parada VIP
        </motion.h1>
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
