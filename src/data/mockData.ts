import type { Mission } from '@/components/shared/MissionCard';

export const mockInfluencer = {
  name: 'Carlos Silva',
  level: 2,
  levelName: 'Prata',
  xp: 1250,
  xpMax: 2000,
  balance: 234.5,
  totalEarned: 890.0,
  referralCode: 'CARLOS7',
  totalReferrals: 47,
  referralsThisWeek: 5,
  referralsToday: 3,
};

export const mockMissions: Mission[] = [
  {
    id: '1',
    title: 'Compartilhe seu link hoje',
    description: 'Envie seu link para pelo menos 1 pessoa',
    icon: '🔗',
    progress: 1,
    target: 1,
    rewardLabel: 'R$ 5,00',
    completed: true,
    claimed: false,
  },
  {
    id: '2',
    title: 'Faça 3 indicações esta semana',
    description: 'Indicações que resultem em compra',
    icon: '🎯',
    progress: 2,
    target: 3,
    rewardLabel: 'R$ 15,00',
    completed: false,
    claimed: false,
  },
  {
    id: '3',
    title: 'Indique um novo entregador',
    description: 'Traga um entregador para a plataforma',
    icon: '🛵',
    progress: 0,
    target: 1,
    rewardLabel: '🎁 Prêmio',
    completed: false,
    claimed: false,
  },
];

export const mockPrizes = [
  {
    id: '1',
    name: 'Excursão Jericoacoara',
    emoji: '🏖️',
    progress: 78,
    target: 100,
    category: 'excursions',
  },
  {
    id: '2',
    name: 'Cupom R$ 50 iFood',
    emoji: '🍔',
    progress: 15,
    target: 20,
    category: 'coupons',
  },
  {
    id: '3',
    name: 'Cashback R$ 100',
    emoji: '💰',
    progress: 40,
    target: 50,
    category: 'cashback',
  },
  {
    id: '4',
    name: 'Passeio de Buggy',
    emoji: '🚗',
    progress: 10,
    target: 80,
    category: 'excursions',
  },
];

export const mockDriver = {
  name: 'João Mota',
  isOnline: true,
  earningsToday: 87.0,
  deliveriesToday: 9,
  totalDistance: 32.5,
  avgPerDelivery: 9.67,
};

export const mockDeliveryOffer = {
  id: 'del-1',
  pickupAddress: 'Parada do Açaí — Av. Principal, 1500',
  deliveryAddress: 'Rua das Flores, 123 — Bairro Novo',
  distanceKm: 2.5,
  fare: 8.0,
};

export const mockActiveDelivery = {
  id: 'del-2',
  pickupAddress: 'Parada do Açaí — Av. Principal, 1500',
  deliveryAddress: 'Rua XV de Novembro, 456',
  distanceKm: 3.2,
  fare: 9.5,
  status: 'accepted' as const,
};

export const mockDeliveryHistory = [
  { id: '1', address: 'Rua das Flores, 123', fare: 8.0, time: '14:30', status: 'delivered' },
  { id: '2', address: 'Av. Brasil, 456', fare: 12.0, time: '13:15', status: 'delivered' },
  { id: '3', address: 'Rua XV de Novembro, 789', fare: 9.5, time: '12:00', status: 'delivered' },
  { id: '4', address: 'Rua Boa Vista, 321', fare: 7.0, time: '11:20', status: 'delivered' },
  { id: '5', address: 'Av. Paulista, 100', fare: 15.0, time: '10:45', status: 'delivered' },
  { id: '6', address: 'Rua Augusta, 50', fare: 6.5, time: '10:00', status: 'cancelled' },
  { id: '7', address: 'Rua Consolação, 200', fare: 11.0, time: '09:30', status: 'delivered' },
  { id: '8', address: 'Rua Oscar Freire, 88', fare: 8.5, time: '09:00', status: 'delivered' },
  { id: '9', address: 'Av. Faria Lima, 300', fare: 9.5, time: '08:15', status: 'delivered' },
];

export const mockWeeklyEarnings = [
  { day: 'Seg', value: 45 },
  { day: 'Ter', value: 78 },
  { day: 'Qua', value: 62 },
  { day: 'Qui', value: 91 },
  { day: 'Sex', value: 55 },
  { day: 'Sáb', value: 110 },
  { day: 'Dom', value: 87 },
];
