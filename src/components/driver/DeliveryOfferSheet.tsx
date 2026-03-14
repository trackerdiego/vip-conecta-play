import { motion } from 'framer-motion';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Button } from '@/components/ui/button';

interface DeliveryOfferSheetProps {
  offer: any;
  countdown: number;
  onAccept: () => void;
  onReject: () => void;
}

const circumference = 2 * Math.PI * 30;

export function DeliveryOfferSheet({ offer, countdown, onAccept, onReject }: DeliveryOfferSheetProps) {
  const strokeDashoffset = circumference * (1 - countdown / 30);

  return (
    <motion.div
      initial={{ y: 500 }}
      animate={{ y: 0 }}
      exit={{ y: 500 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className="absolute bottom-20 left-0 right-0 z-[1000] px-4"
    >
      <div className="bg-background rounded-3xl shadow-2xl border border-border p-5 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-bold text-lg">🛵 Nova Corrida!</h3>
          <div className="relative h-14 w-14">
            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
              <circle
                cx="32" cy="32" r="30"
                fill="none"
                stroke="hsl(var(--brand-purple))"
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-heading">
              {countdown}s
            </span>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-brand-purple mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Coleta</p>
              <p className="text-sm font-medium">{offer.pickup_address}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-brand-green mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold uppercase text-muted-foreground">Entrega</p>
              <p className="text-sm font-medium">{offer.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3 mb-4">
          <span className="text-sm">📏 {offer.distance_km ?? '?'} km</span>
          <CurrencyDisplay value={Number(offer.fare)} size="md" className="text-brand-green" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" onClick={onReject} className="rounded-xl h-12">
            <X className="h-4 w-4 mr-1" /> Recusar
          </Button>
          <Button onClick={onAccept} className="rounded-xl h-12 bg-brand-green hover:bg-brand-green/90 text-primary-foreground">
            <Check className="h-4 w-4 mr-1" /> Aceitar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
