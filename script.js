const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

function drawBg() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0,   '#fde8f0');
    g.addColorStop(0.4, '#f5e6fa');
    g.addColorStop(0.8, '#e8f0ff');
    g.addColorStop(1,   '#fde8f0');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

// ----------- ÇİÇEKLER -----------
const PALETTES = [
    { outer: '#ff7eb9', inner: '#ffb6d9', center: '#fff176' },
    { outer: '#ce93d8', inner: '#f3e5f5', center: '#ffe082' },
    { outer: '#ff8a65', inner: '#ffccbc', center: '#fff59d' },
    { outer: '#80cbc4', inner: '#e0f2f1', center: '#ffcc80' },
    { outer: '#f48fb1', inner: '#fce4ec', center: '#fff9c4' },
    { outer: '#b39ddb', inner: '#ede7f6', center: '#f0f4c3' },
];

class Flower {
    constructor(x, y, isClick = false) {
        this.x = x; this.y = y;
        this.isClick = isClick;
        this.size = 0;
        this.maxSize = isClick ? (Math.random() * 22 + 38) : (Math.random() * 20 + 18);
        this.pal = PALETTES[Math.floor(Math.random() * PALETTES.length)];
        this.petals = Math.floor(Math.random() * 3) + 5;
        this.rot = Math.random() * Math.PI * 2;
        this.speed = isClick ? 1.4 : 0.5;
        this.life = 0;
        this.fade = 1;
        this.maxLife = 400 + Math.random() * 200;
        this.glow = 0;
    }

    draw() {
        if (this.size < this.maxSize) this.size += this.speed;
        this.life++;
        if (this.life > this.maxLife - 60)
            this.fade = Math.max(0, 1 - (this.life - (this.maxLife - 60)) / 60);
        this.glow = (Math.sin(this.life * 0.05) + 1) / 2;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot + this.life * 0.003);
        ctx.globalAlpha = this.fade;

        const s = this.size;

        // Dış glow
        const glowR = ctx.createRadialGradient(0, 0, s * 0.6, 0, 0, s * 1.4);
        glowR.addColorStop(0, `rgba(255,200,220,${0.18 * this.glow})`);
        glowR.addColorStop(1, 'rgba(255,200,220,0)');
        ctx.fillStyle = glowR;
        ctx.beginPath(); ctx.arc(0, 0, s * 1.4, 0, Math.PI * 2); ctx.fill();

        // Dış yapraklar
        this.drawPetalLayer(s, this.pal.outer, 1);
        // İç yapraklar
        this.drawPetalLayer(s * 0.6, this.pal.inner, 0.85);

        // Merkez
        const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.28);
        cg.addColorStop(0, '#fff');
        cg.addColorStop(0.5, this.pal.center);
        cg.addColorStop(1, '#f9a825');
        ctx.beginPath(); ctx.arc(0, 0, s * 0.28, 0, Math.PI * 2);
        ctx.fillStyle = cg; ctx.fill();
        ctx.strokeStyle = 'rgba(180,120,0,0.3)'; ctx.lineWidth = 0.8; ctx.stroke();

        // Parlaklık noktası
        ctx.beginPath(); ctx.arc(-s * 0.06, -s * 0.07, s * 0.07, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fill();

        ctx.restore();
    }

    drawPetalLayer(size, color, alpha) {
        ctx.save();
        const n = this.petals;
        for (let i = 0; i < n; i++) {
            ctx.rotate(Math.PI * 2 / n);
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo( size * 0.55, -size * 0.25,  size * 0.55,  size * 0.25, 0, 0);
            ctx.bezierCurveTo( size * 0.95, -size * 0.55,  size * 0.95,  size * 0.55, 0, size * 0.98);
            ctx.closePath();
            const pg = ctx.createLinearGradient(0, -size * 0.1, 0, size);
            pg.addColorStop(0,   'rgba(255,255,255,0.9)');
            pg.addColorStop(0.3, color + 'ee');
            pg.addColorStop(1,   color + 'bb');
            ctx.fillStyle = pg;
            ctx.globalAlpha = this.fade * alpha;
            ctx.fill();
            ctx.restore();
        }
        ctx.restore();
    }

    get dead() { return this.life > this.maxLife; }
}

// ----------- IŞILTILAR -----------
class Sparkle {
    constructor(x, y) {
        this.x = x ?? Math.random() * W;
        this.y = y ?? Math.random() * H;
        this.size = Math.random() * 4 + 2;
        this.alpha = Math.random();
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.04 + 0.02;
        this.color = ['#ffb6c1','#e6b0ff','#b0d4ff','#fffacd','#b0f0e0'][Math.floor(Math.random() * 5)];
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.3 - 0.2;
        this.life = 0;
        this.maxLife = 80 + Math.random() * 100;
    }

    draw() {
        this.phase += this.speed;
        this.x += this.vx;
        this.y += this.vy;
        this.life++;
        const a = Math.sin(this.phase) * (1 - this.life / this.maxLife);
        if (a < 0) return;
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = a * 0.9;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? s : s * 0.4;
            const ang = i * Math.PI / 4 + this.phase * 0.3;
            i === 0
                ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
                : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath(); ctx.fill();
        ctx.restore();
    }

    get dead() { return this.life > this.maxLife; }
}

// ----------- KELEBEKLER -----------
class Butterfly {
    constructor() { this.reset(); }

    reset() {
        this.x = Math.random() < 0.5 ? -60 : W + 60;
        this.y = Math.random() * H * 0.7 + 50;
        this.dir = this.x < 0 ? 1 : -1;
        this.speed = Math.random() * 0.7 + 0.5;
        this.waveAmp = Math.random() * 40 + 20;
        this.waveFreq = Math.random() * 0.02 + 0.01;
        this.t = Math.random() * 100;
        this.size = Math.random() * 12 + 12;
        this.wingPhase = 0;
        this.color  = ['#f48fb1','#ce93d8','#ff8a65','#80cbc4','#ffb74d'][Math.floor(Math.random() * 5)];
        this.color2 = ['#fff176','#e1f5fe','#f8bbd9','#e8f5e9','#fce4ec'][Math.floor(Math.random() * 5)];
        this.baseY = this.y;
    }

    draw() {
        this.t += 1;
        this.x += this.speed * this.dir;
        this.y = this.baseY + Math.sin(this.t * this.waveFreq * Math.PI * 2) * this.waveAmp;
        this.wingPhase += 0.12;

        const wOpen = Math.abs(Math.sin(this.wingPhase));
        ctx.save();
        ctx.translate(this.x, this.y);
        if (this.dir < 0) ctx.scale(-1, 1);
        ctx.globalAlpha = 0.88;

        const s = this.size;

        // Üst kanat
        ctx.save();
        ctx.scale(1 - wOpen * 0.6, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s*1.2, -s*1.4, -s*2.2, -s*0.2, -s*1.1,  s*0.5);
        ctx.bezierCurveTo(-s*0.7,  s*0.7,  -s*0.2,  s*0.3,      0,      0);
        ctx.fillStyle = this.color; ctx.globalAlpha = 0.85; ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-s*0.7, -s*0.3, s*0.3, s*0.2, Math.PI*0.3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        ctx.restore();

        // Alt kanat
        ctx.save();
        ctx.scale(1 - wOpen * 0.5, 1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-s*1.0,  s*0.8, -s*1.8, s*1.8, -s*0.8, s*1.5);
        ctx.bezierCurveTo(-s*0.3,  s*1.2,      0,  s*0.6,      0,     0);
        ctx.fillStyle = this.color2; ctx.globalAlpha = 0.75; ctx.fill();
        ctx.restore();

        // Gövde
        ctx.beginPath();
        ctx.ellipse(0, 0, s*0.12, s*0.55, 0, 0, Math.PI*2);
        ctx.fillStyle = '#5d4037'; ctx.globalAlpha = 0.8; ctx.fill();

        // Antenler
        ctx.strokeStyle = '#795548'; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.6;
        ctx.beginPath(); ctx.moveTo(0, -s*0.4); ctx.quadraticCurveTo(-s*0.5, -s*1.3, -s*0.4, -s*1.6); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -s*0.4); ctx.quadraticCurveTo(-s*0.2, -s*1.2, -s*0.1, -s*1.5); ctx.stroke();
        ctx.beginPath(); ctx.arc(-s*0.4, -s*1.6, s*0.07, 0, Math.PI*2); ctx.fillStyle = '#5d4037'; ctx.globalAlpha = 0.8; ctx.fill();
        ctx.beginPath(); ctx.arc(-s*0.1, -s*1.5, s*0.07, 0, Math.PI*2); ctx.fill();

        ctx.restore();

        if ((this.dir > 0 && this.x > W + 100) || (this.dir < 0 && this.x < -100)) this.reset();
    }
}

// ----------- POLENLER -----------
class Pollen {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 2.5 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * 0.6 + 0.2;
        this.alpha = Math.random() * 0.5 + 0.2;
        this.color = ['rgba(255,240,180,','rgba(255,210,230,','rgba(220,200,255,'][Math.floor(Math.random() * 3)];
    }
    draw() {
        this.x += this.vx; this.y += this.vy;
        if (this.y > H + 5) this.reset();
        ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')'; ctx.fill();
    }
}

// ----------- STATE -----------
let flowers = [];
let sparkles = [];
let butterflies = [new Butterfly(), new Butterfly(), new Butterfly()];
let pollens = Array.from({ length: 35 }, () => new Pollen());

function noOverlap(x, y, size) {
    for (let f of flowers) {
        if (Math.hypot(f.x - x, f.y - y) < (f.maxSize + size) * 0.65) return false;
    }
    return true;
}

function safeSpot(tx, ty, isClick) {
    const est = isClick ? 50 : 28;
    for (let t = 0; t < 12; t++) {
        let x = isClick ? tx + (Math.random() * 90 - 45) : Math.random() * W;
        let y = isClick ? ty + (Math.random() * 90 - 45) : Math.random() * H;
        if (noOverlap(x, y, est)) return { x, y };
    }
    return null;
}

function burst(cx, cy) {
    for (let i = 0; i < 4; i++) {
        const s = safeSpot(cx, cy, true);
        if (s) flowers.push(new Flower(s.x, s.y, true));
    }
    for (let i = 0; i < 8; i++) {
        sparkles.push(new Sparkle(cx + (Math.random() - 0.5) * 80, cy + (Math.random() - 0.5) * 80));
    }
}

canvas.addEventListener('mousedown', e => {
    const r = canvas.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top);
});
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const t = e.touches[0];
    burst(t.clientX - r.left, t.clientY - r.top);
}, { passive: false });

function animate() {
    ctx.clearRect(0, 0, W, H);
    drawBg();

    pollens.forEach(p => p.draw());

    if (flowers.length < 70 && Math.random() < 0.05) {
        const s = safeSpot(0, 0, false);
        if (s) flowers.push(new Flower(s.x, s.y, false));
    }

    flowers = flowers.filter(f => !f.dead);
    flowers.forEach(f => f.draw());

    if (Math.random() < 0.12) sparkles.push(new Sparkle());
    sparkles = sparkles.filter(s => !s.dead);
    sparkles.forEach(s => s.draw());

    butterflies.forEach(b => b.draw());

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', resize);