import { Particle } from './src/particle.js';
const particlePool: Particle[] = [];
const particles: Particle[] = [];

// Let's write a mock card and mock loop
for(let i=0; i<100; i++) {
    // spawn particle
    let p = particlePool.length > 0 ? particlePool.pop()! : new Particle();
    p.init(0,0,0,'#fff',false,false,'normal');
    particles.push(p);
}

// update loop
for(let frame=0; frame<500; frame++) {
    // update particles
    for (let i = particles.length - 1; i >= 0; i--) {
        if (particles[i].active) {
            particles[i].life -= 0.05; // mock decay
            if (particles[i].life <= 0) particles[i].active = false;
        } else {
            particlePool.push(particles[i]);
            particles.splice(i, 1);
        }
    }
    // random spawn
    if (Math.random() < 0.5) {
        let p = particlePool.length > 0 ? particlePool.pop()! : new Particle();
        p.init(0,0,0,'#fff',false,false,'normal');
        particles.push(p);
    }
}

console.log("particles:", particles.length, "pool:", particlePool.length);
let all = [...particles, ...particlePool];
let unique = new Set(all);
console.log("Total unique:", unique.size, "Total array:", all.length);
