import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoParadaVip from '@/assets/logo-parada-vip.png';
import imgInfluencer from '@/assets/img-influencer.png';
import imgDriver from '@/assets/img-driver.png';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gradient-to-b from-background via-accent/60 to-background">
      {/* Subtle decorative radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(263_70%_90%/0.4),transparent_60%)]" />

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 py-8">
        {/* Logo */}
        <motion.img
          src={logoParadaVip}
          alt="Parada do Açaí Caucaia"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="h-24 w-auto mb-6 drop-shadow-lg"
        />

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Escolha seu perfil
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Como você quer ganhar com a Parada do Açaí?
          </p>
        </motion.div>

        {/* Image buttons */}
        <div className="flex gap-4 w-full max-w-sm justify-center">
          <motion.button
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth/register?role=influencer')}
            className="flex-1 flex flex-col items-center gap-3"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-border bg-card">
              <img
                src={imgDriver}
                alt="Influenciador"
                className="w-full aspect-square object-cover"
              />
            </div>
            <span className="font-heading font-semibold text-sm text-foreground">
              Sou Influenciador
            </span>
          </motion.button>

          <motion.button
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth/register?role=driver')}
            className="flex-1 flex flex-col items-center gap-3"
          >
            <div className="rounded-2xl overflow-hidden shadow-lg ring-1 ring-border bg-card">
              <img
                src={imgInfluencer}
                alt="Entregador"
                className="w-full aspect-square object-cover"
              />
            </div>
            <span className="font-heading font-semibold text-sm text-foreground">
              Sou Entregador
            </span>
          </motion.button>
        </div>

        {/* Login link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-auto pt-8 pb-6"
        >
          <button
            onClick={() => navigate('/auth/login')}
            className="text-primary text-sm font-medium hover:underline"
          >
            Já tem conta? Entrar
          </button>
        </motion.div>
      </div>
    </div>
  );
}
