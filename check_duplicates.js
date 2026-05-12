const fs = require('fs');
const code = fs.readFileSync('src/game.ts', 'utf-8');

// I'm going to add a check in game.ts to crash or alert if there's a duplicate.
