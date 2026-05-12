const fs = require('fs');
let content = fs.readFileSync('src/particle.ts', 'utf8');
content = content.replace('    this.vx = initVx;\n    this.vy = initVy;\n\n    this.vx = initVx;\n    this.vy = initVy;', '    this.vx = initVx;\n    this.vy = initVy;');
fs.writeFileSync('src/particle.ts', content);
