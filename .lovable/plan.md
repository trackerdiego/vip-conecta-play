

# Parada VIP — Plano de Implementação (Fase 1)

## Visão Geral
PWA completa com dois módulos (Influenciador dark mode + Entregador light mode), autenticação Supabase, e design system premium. Texto 100% em pt-BR.

---

## 1. Design System & Infraestrutura Base
- Configurar paleta de cores customizada (CSS variables: brand-purple, brand-green, brand-orange, brand-dark, glassmorphism)
- Importar fontes Space Grotesk (headings) e DM Sans (corpo) do Google Fonts
- Instalar dependências: framer-motion, zustand, react-leaflet, leaflet, vite-plugin-pwa
- Configurar PWA manifest com tema roxo e ícones
- Criar componentes reutilizáveis base: `CurrencyDisplay`, `LevelBadge`, `MissionCard`, `DriverStatusPill`, `DeliveryOfferSheet`, `EarningsChart`, `ReferralLinkSheet`

## 2. Supabase — Banco de Dados Completo
- Criar todas as tabelas: profiles, wallets, transactions, deliveries, missions, user_missions, driver_locations, withdrawal_requests
- Configurar RLS com função `has_role` security definer (roles separadas conforme regra de segurança)
- Trigger para criar profile + wallet automaticamente no signup
- Habilitar Realtime na tabela deliveries

## 3. Autenticação
- Tela de Login com email/senha + Google OAuth
- Tela de Cadastro com seleção de papel (Influenciador/Entregador), campo de código de indicação
- Recuperação de senha com página /reset-password
- Proteção de rotas por role (influencer vs driver)

## 4. Onboarding & Splash
- Splash screen com logo animado (scale + fade), gradiente roxo, redirecionamento automático
- Tela de seleção de perfil com dois cards grandes animados (Influenciador roxo / Entregador verde)

## 5. Módulo Influenciador (Dark Mode Premium)
- **Dashboard**: Header glassmorphism com avatar e nível, card de saldo com glow roxo e partículas CSS, stats de nível e indicações, botão "Compartilhar meu Link" com Web Share API, seção de missões diárias com progress bars, card de próximo prêmio
- **Missões**: Lista completa com filtros por tipo, progress tracking, botão resgatar com animação
- **Prêmios**: Grid de prêmios com progresso, seção de cupons, filtros por categoria
- **Saque**: Formulário com validação (mín R$20), seletor de tipo PIX, histórico de saques
- **Bottom nav**: glassmorphism dark com 4 tabs (Início, Indicações, Prêmios, Perfil)

## 6. Módulo Entregador (Light Mode Limpo)
- **Mapa Principal**: Leaflet fullscreen com tile OpenStreetMap, marcador de posição do entregador, pill de status Online/Offline flutuante, mini card de ganhos do dia
- **Card de Nova Corrida**: Bottom sheet animado (Framer Motion) com countdown 30s (arco circular), detalhes da corrida, botões Aceitar/Recusar com Vibration API
- **Corrida Ativa**: Bottom sheet com fases (A caminho da coleta → Em rota de entrega), confirmação modal, animação de celebração ao concluir
- **Histórico**: Lista filtrada por período com totais
- **Ganhos**: Saldo, gráfico de barras 7 dias (Recharts), estatísticas, botão saque PIX
- **Bottom nav**: light com 4 tabs (Mapa, Corridas, Ganhos, Perfil)

## 7. Funcionalidades Técnicas
- Supabase Realtime para novas corridas (filtro por distância < 5km)
- Geolocalização contínua com watchPosition (atualiza driver_locations a cada 10s)
- Web Share API para link de indicação
- Estados de UI: skeleton loaders, empty states com ilustração, error states com retry, toast notifications

## 8. Dados Mock
- Influenciador "Carlos Silva" com saldo R$234,50, 47 indicações, nível Prata, 3 missões ativas
- Entregador "João Mota" online, ganhos R$87,00/9 corridas, corrida mock de exemplo

