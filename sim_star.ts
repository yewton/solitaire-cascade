import { Particle } from './src/particle.js';

let p = new Particle();

// First initialization as star
p.init(0, 0, 0, '#fff', false, false, 'star');
console.log("After 1st init (star): vx =", p.vx, "vy =", p.vy);

// Deactivate, put in pool
p.active = false;

// Second initialization from pool as star
p.init(0, 0, 0, '#fff', false, false, 'star');
console.log("After 2nd init (star): vx =", p.vx, "vy =", p.vy);

// Third
p.active = false;
p.init(0, 0, 0, '#fff', false, false, 'star');
console.log("After 3rd init (star): vx =", p.vx, "vy =", p.vy);

// What if we init as water?
p.active = false;
p.init(0, 0, 0, '#fff', false, false, 'water');
console.log("After 4th init (water): vx =", p.vx, "vy =", p.vy);
