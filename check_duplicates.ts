import { readFileSync } from 'fs';

const gameTs = readFileSync('src/game.ts', 'utf8');
console.log(gameTs.includes('particlePool.push(p)'));
