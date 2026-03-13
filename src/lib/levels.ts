const LEVELS = [
  { level: 1, name: 'Bronze', xpMax: 500, commissionRate: 1 },
  { level: 2, name: 'Prata', xpMax: 2000, commissionRate: 2 },
  { level: 3, name: 'Ouro', xpMax: 5000, commissionRate: 3.5 },
  { level: 4, name: 'Diamante', xpMax: 10000, commissionRate: 5 },
];

export function getLevelInfo(level: number) {
  const info = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  return { levelName: info.name, xpMax: info.xpMax, commissionRate: info.commissionRate };
}
