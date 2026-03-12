import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Megaphone, Bike } from 'lucide-react';
import { ParticlesBackground } from '@/components/shared/ParticlesBackground';

export default function Onboarding() {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col bg-brand-dark overflow-hidden">
      <ParticlesBackground />
      <div className="relative z-10 flex flex-1 flex-col p-6">
        <div className="text-center mt-8 mb-8">
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">
            Escolha seu perfil
          </h1>
          <p className="text-muted-foreground mt-2">Como você quer ganhar com a Parada do Açaí?</p>
        </div>

        <div className="flex-1 flex flex-col gap-4 max-w-md mx-auto w-full">
          <motion.button
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

        <div className="text-center mt-6 pb-8">
          <button
            onClick={() => navigate('/auth/login')}
            className="text-brand-purple-light text-sm font-medium hover:underline"
          >
            Já tem conta? Entrar
          </button>
        </div>
      </div>
    </div>
  );
}
