const LEVELS = [
  { level: 1, name: 'Bronze', xpMax: 500 },
  { level: 2, name: 'Prata', xpMax: 2000 },
  { level: 3, name: 'Ouro', xpMax: 5000 },
  { level: 4, name: 'Diamante', xpMax: 10000 },
];

export function getLevelInfo(level: number) {
  const info = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  return { levelName: info.name, xpMax: info.xpMax };
}
