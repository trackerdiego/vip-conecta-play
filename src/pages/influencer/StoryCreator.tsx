import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Palette, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const TEMPLATES = [
  {
    id: 'acai-promo',
    name: 'Açaí do Dia',
    gradient: 'from-purple-900 via-purple-700 to-pink-600',
    emoji: '🍇',
    headline: 'Peça seu Açaí com desconto!',
    subtext: 'Use meu link e ganhe vantagens exclusivas',
  },
  {
    id: 'combo-deal',
    name: 'Combo Especial',
    gradient: 'from-orange-600 via-red-600 to-purple-800',
    emoji: '🔥',
    headline: 'Combo imperdível hoje!',
    subtext: 'Açaí + Complementos por um preço especial',
  },
  {
    id: 'fresh-vibes',
    name: 'Vibes Frescas',
    gradient: 'from-green-600 via-teal-500 to-cyan-500',
    emoji: '🌿',
    headline: 'Frescor na sua porta!',
    subtext: 'Peça agora pelo meu link exclusivo',
  },
  {
    id: 'night-mode',
    name: 'Noturno',
    gradient: 'from-gray-900 via-purple-900 to-violet-800',
    emoji: '🌙',
    headline: 'Delivery noturno aberto!',
    subtext: 'Seu açaí favorito, a qualquer hora',
  },
];

export default function StoryCreator() {
  const profile = useAuthStore((s) => s.profile);
  const referralCode = profile?.referral_code ?? '';
  const shareLink = `https://paradadoacai.app/r/${referralCode}`;
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!canvasRef.current) return;

    try {
      // Use html2canvas-like approach via canvas API
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      // Draw gradient background
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      const colors = getGradientColors(selectedTemplate.id);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(0.5, colors[1]);
      gradient.addColorStop(1, colors[2]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Draw emoji
      ctx.font = '200px serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedTemplate.emoji, 540, 600);

      // Draw headline
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 72px sans-serif';
      ctx.fillText(selectedTemplate.headline, 540, 900, 900);

      // Draw subtext
      ctx.font = '42px sans-serif';
      ctx.globalAlpha = 0.8;
      ctx.fillText(selectedTemplate.subtext, 540, 980, 900);
      ctx.globalAlpha = 1;

      // Draw referral link box
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      roundRect(ctx, 140, 1200, 800, 120, 30);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('🔗 ' + shareLink.replace('https://', ''), 540, 1275, 750);

      // Draw CTA
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('Arraste pra cima! ☝️', 540, 1500);

      // Draw logo text
      ctx.font = '28px sans-serif';
      ctx.globalAlpha = 0.5;
      ctx.fillText('Parada do Açaí VIP', 540, 1800);
      ctx.globalAlpha = 1;

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const file = new File([blob], 'story-parada-vip.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Parada do Açaí VIP',
          text: `${selectedTemplate.headline} ${shareLink}`,
          files: [file],
        });
        toast.success('Story compartilhado! 🎉');
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story-parada-vip.png';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Imagem baixada! Poste nos seus stories 📱');
      }
    } catch (err) {
      console.error('Share error:', err);
      toast.error('Erro ao compartilhar');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark text-primary-foreground pb-24 dark">
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="font-heading text-2xl font-bold mb-2">🎨 Criar Story</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Escolha um template e compartilhe com seu link embutido
        </p>

        {/* Template Selector */}
        <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide mb-6">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTemplate(t)}
              className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center text-3xl transition-all ${
                selectedTemplate.id === t.id
                  ? 'ring-2 ring-brand-purple-light scale-110'
                  : 'opacity-60'
              }`}
            >
              {t.emoji}
            </button>
          ))}
        </div>

        {/* Preview */}
        <motion.div
          key={selectedTemplate.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          ref={canvasRef}
          className={`relative rounded-3xl bg-gradient-to-br ${selectedTemplate.gradient} aspect-[9/16] p-6 flex flex-col items-center justify-center text-center overflow-hidden mb-6`}
        >
          {/* Decorative circles */}
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute bottom-20 right-5 w-40 h-40 rounded-full bg-white/5 blur-3xl" />

          <span className="text-7xl mb-6">{selectedTemplate.emoji}</span>
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            {selectedTemplate.headline}
          </h2>
          <p className="text-white/70 text-sm mb-8">{selectedTemplate.subtext}</p>

          {/* Link box */}
          <div className="bg-black/30 rounded-2xl px-4 py-3 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-white/80" />
              <span className="text-white text-xs font-mono">
                {shareLink.replace('https://', '')}
              </span>
            </div>
          </div>

          <p className="text-white/50 text-xs mt-8">Parada do Açaí VIP</p>
        </motion.div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleShare}
            className="h-14 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-primary-foreground font-heading font-bold"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Postar Story
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="h-14 rounded-2xl border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 font-heading font-bold"
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar
          </Button>
        </div>
      </div>
      <BottomNav variant="influencer" />
    </div>
  );
}

// Helper functions
function getGradientColors(templateId: string): string[] {
  const map: Record<string, string[]> = {
    'acai-promo': ['#581c87', '#7e22ce', '#db2777'],
    'combo-deal': ['#ea580c', '#dc2626', '#6b21a8'],
    'fresh-vibes': ['#16a34a', '#0d9488', '#06b6d4'],
    'night-mode': ['#111827', '#581c87', '#6d28d9'],
  };
  return map[templateId] || map['acai-promo'];
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}
