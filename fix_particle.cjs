const fs = require('fs');

let content = fs.readFileSync('src/particle.ts', 'utf8');

content = content.replace('this.vx = (Math.random() - 0.5) * 6;', 'let initVx = (Math.random() - 0.5) * 6;');
content = content.replace('this.vy = (Math.random() - 0.5) * 6;', 'let initVy = (Math.random() - 0.5) * 6;');

content = content.replace('this.vx *= 0.5;', 'initVx *= 0.5;');
content = content.replace('this.vy  = -Math.random() * 5 - 2;', 'initVy  = -Math.random() * 5 - 2;');

content = content.replace('this.vx *= 0.5;', 'initVx *= 0.5;');
content = content.replace('this.vy  = Math.random() * 2 - 4;', 'initVy  = Math.random() * 2 - 4;');

content = content.replace('this.vx *= 0.3;', 'initVx *= 0.3;');
content = content.replace('this.vy  = Math.random() * 1 + 0.5;', 'initVy  = Math.random() * 1 + 0.5;');

content = content.replace('this.vx *= 1.5; this.vy *= 1.5;', 'initVx *= 1.5; initVy *= 1.5;');

content = content.replace('if (!isNeon) this.color = \'#FFD700\';\n    }', 'if (!isNeon) this.color = \'#FFD700\';\n    }\n\n    this.vx = initVx;\n    this.vy = initVy;');

fs.writeFileSync('src/particle.ts', content);
