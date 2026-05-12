import { Particle } from './src/particle.js';
const particlePool: Particle[] = [];
const particles: Particle[] = [];

function clearScreen() {
    particles.forEach(p => particlePool.push(p));
    particles.length = 0;
}

let p1 = new Particle(); p1.active = true;
particles.push(p1);

// loop frame 1
for (let i = particles.length - 1; i >= 0; i--) {
    if (particles[i].active) {
        particles[i].active = false; // simulated update
    } else {
        particlePool.push(particles[i]);
        particles.splice(i, 1);
    }
}

// suppose clearScreen is called here
clearScreen();

console.log("Pool size:", particlePool.length);
console.log("Is duplicate in pool?", particlePool.length > new Set(particlePool).size);
