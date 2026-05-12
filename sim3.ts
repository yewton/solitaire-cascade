import { Particle } from './src/particle.js';
const p1 = new Particle();
p1.init(0,0,0,'#fff',false,false,'star');
console.log(p1.vx, p1.vy);

// wait, star vx,vy *= 1.5
p1.active = false;
p1.init(0,0,0,'#fff',false,false,'star');
console.log(p1.vx, p1.vy);
