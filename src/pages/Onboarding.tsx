import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, Bike } from 'lucide-react';
import { ParticlesBackground } from '@/components/shared/ParticlesBackground';
import logoParadaVip from '@/assets/logo-parada-vip.png';
import bgAcai from '@/assets/bg-acai.png';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-dark overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={bgAcai}
          alt=""
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/90 to-brand-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--brand-purple)/0.15),transparent_60%)]" />
      </div>

      <ParticlesBackground />

      <div className="relative z-10 flex flex-1 flex-col p-6">
        {/* Logo + Title */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mt-6 mb-6 flex flex-col items-center"
        >
          <img
            src={logoParadaVip}
            alt="Parada do Açaí VIP"
            className="h-28 w-auto mb-4 drop-shadow-2xl"
          />
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">
            Escolha seu perfil
          </h1>
          <p className="text-muted-foreground mt-2">Como você quer ganhar com a Parada do Açaí?</p>
        </motion.div>

        {/* Role cards */}
        <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
          <motion.button
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/register?role=influencer')}
            className="flex-1 rounded-3xl bg-gradient-to-br from-brand-purple to-brand-purple-light p-6 text-left flex flex-col justify-between shadow-xl glow-purple transition-all"
          >
            <Megaphone className="h-10 w-10 text-primary-foreground/80" />
            <div className="mt-auto">
              <span className="text-3xl mb-2 block">📢</span>
              <h2 className="font-heading text-2xl font-bold text-primary-foreground">Sou Influenciador</h2>
              <p className="text-primary-foreground/70 text-sm mt-1">Ganhe indicando amigos para a Parada do Açaí</p>
            </div>
          </motion.button>

          <motion.button
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/auth/register?role=driver')}
            className="flex-1 rounded-3xl bg-gradient-to-br from-brand-green to-emerald-700 p-6 text-left flex flex-col justify-between shadow-xl glow-green transition-all"
          >
            <Bike className="h-10 w-10 text-primary-foreground/80" />
            <div className="mt-auto">
              <span className="text-3xl mb-2 block">🛵</span>
              <h2 className="font-heading text-2xl font-bold text-primary-foreground">Sou Entregador</h2>
              <p className="text-primary-foreground/70 text-sm mt-1">Aceite corridas próximas e ganhe por entrega</p>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-6 pb-8"
        >
          <button
            onClick={() => navigate('/auth/login')}
            className="text-brand-purple-light text-sm font-medium hover:underline"
          >
            Já tem conta? Entrar
          </button>
        </motion.div>
      </div>
    </div>
  );
}
