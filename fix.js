const fs = require('fs');
let code = fs.readFileSync('src/particle.ts', 'utf8');
code = code.replace(/this\.vx = \(Math\.random\(\) - 0\.5\) \* 6;\n\s+this\.vy = \(Math\.random\(\) - 0\.5\) \* 6;/, 'this.vx = (Math.random() - 0.5) * 6;\n    this.vy = (Math.random() - 0.5) * 6;');

// Actually, looking at the logic:
// we should just reset this.vx and this.vy instead of multiplying them.
