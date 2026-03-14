import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Copy, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/shared/BottomNav';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

import story1 from '@/assets/stories/story-1.png';
import story2 from '@/assets/stories/story-2.png';
import story3 from '@/assets/stories/story-3.png';
import story4 from '@/assets/stories/story-4.png';

interface StoryTemplate {
  id: string;
  name: string;
  image: string;
  /** Y position (0-1 ratio) where the link text should be rendered on the canvas */
  linkY: number;
}

const TEMPLATES: StoryTemplate[] = [
  { id: 'delivery', name: 'Delivery Liberado', image: story1, linkY: 0.88 },
  { id: 'energia', name: 'Energia', image: story2, linkY: 0.88 },
  { id: 'amor', name: 'Amor', image: story3, linkY: 0.88 },
  { id: 'irresistivel', name: 'Irresistível', image: story4, linkY: 0.88 },
];

export default function StoryCreator() {
  const profile = useAuthStore((s) => s.profile);
  const referralCode = profile?.referral_code ?? '';
  const shareLink = `https://app.paradadoacai.online/r/${referralCode}`;
  const [selected, setSelected] = useState(TEMPLATES[0]);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (action: 'share' | 'download') => {
    setExporting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selected.image;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      // Draw template image filling the canvas
      ctx.drawImage(img, 0, 0, 1080, 1920);

      // Draw referral link over the image
      const linkY = selected.linkY * 1920;
      
      // Link background pill
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, 140, linkY - 40, 800, 80, 40);
      
      // Link text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔗 ' + shareLink.replace('https://', ''), 540, linkY + 10, 720);

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png')
      );
      const file = new File([blob], 'story-parada-vip.png', { type: 'image/png' });

      if (action === 'share' && navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'Parada do Açaí Caucaia',
          text: `Peça pelo meu link! ${shareLink}`,
          files: [file],
        });
        toast.success('Story compartilhado! 🎉');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'story-parada-vip.png';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Imagem baixada! Poste nos seus stories 📱');
      }
    } catch (err) {
      console.error('Export error:', err);
      toast.error('Erro ao exportar');
    } finally {
      setExporting(false);
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
              onClick={() => setSelected(t)}
              className={`flex-shrink-0 w-20 h-28 rounded-2xl overflow-hidden transition-all ${
                selected.id === t.id
                  ? 'ring-2 ring-brand-purple-light scale-110'
                  : 'opacity-60'
              }`}
            >
              <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>

        {/* Preview */}
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-3xl aspect-[9/16] overflow-hidden mb-6"
        >
          <img
            src={selected.image}
            alt={selected.name}
            className="w-full h-full object-cover"
          />
          {/* Link overlay */}
          <div
            className="absolute left-4 right-4 flex justify-center"
            style={{ bottom: `${(1 - selected.linkY) * 100 + 2}%` }}
          >
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Link copiado! 📋');
              }}
              className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 hover:bg-black/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-mono truncate max-w-[200px]">
                  🔗 {shareLink.replace('https://', '')}
                </span>
                <Copy className="h-3.5 w-3.5 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
            </button>
          </div>
        </motion.div>

        {/* Copiar Link */}
        <div className="bg-muted/10 border border-primary-foreground/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Seu link de indicação</p>
              <p className="text-sm font-mono text-primary-foreground truncate">{shareLink}</p>
            </div>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success('Link copiado! 📋');
              }}
              size="sm"
              className="shrink-0 bg-gradient-to-r from-brand-purple to-brand-purple-light text-primary-foreground font-heading font-bold rounded-xl"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <Link className="h-3 w-3" />
            Cole na bio ou use o sticker de link nos stories
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleExport('share')}
            disabled={exporting}
            className="h-14 rounded-2xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-primary-foreground font-heading font-bold"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Postar Story
          </Button>
          <Button
            onClick={() => handleExport('download')}
            disabled={exporting}
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
