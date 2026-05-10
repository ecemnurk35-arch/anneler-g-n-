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
    // Koyu, derin arka plan
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   '#0a0010');
    g.addColorStop(0.5, '#0d0018');
    g.addColorStop(1,   '#050008');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

// ----------- ZEMİN OTU / YAPRAKLARI -----------
class Grass {
    constructor(x) {
        this.x = x;
        this.baseY = H;
        this.height = Math.random() * 80 + 60;
        this.lean = (Math.random() - 0.5) * 0.6;
        this.width = Math.random() * 5 + 3;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.01 + 0.005;
        this.color = Math.random() < 0.5
            ? { r: 180, g: 0,  b: 80  }
            : { r: 80,  g: 0,  b: 160 };
    }
    draw(t) {
        const sway = Math.sin(t * this.speed + this.phase) * 8;
        const tipX = this.x + sway + this.lean * this.height;
        const tipY = this.baseY - this.height;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, this.baseY);
        ctx.quadraticCurveTo(
            this.x + sway * 0.5 + this.lean * this.height * 0.5,
            this.baseY - this.height * 0.5,
            tipX, tipY
        );

        const { r, g, b } = this.color;
        const grad = ctx.createLinearGradient(this.x, this.baseY, tipX, tipY);
        grad.addColorStop(0,   `rgba(${r},${g},${b},0.9)`);
        grad.addColorStop(0.6, `rgba(${r},${g},${b},0.7)`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0.2)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Parlak kenar
        ctx.globalAlpha = 0.4;
        ctx.strokeStyle = `rgba(255,${g+100},${b+100},0.5)`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
    }
}

// ----------- ÇİÇEKLER (Uzun saplı, parlak kenarlı) -----------
const FLOWER_COLORS = [
    { petal: '#cc0055', glow: '#ff3399', center: '#ff99cc' },
    { petal: '#8800cc', glow: '#cc44ff', center: '#ffccff' },
    { petal: '#dd0044', glow: '#ff2277', center: '#ffaacc' },
    { petal: '#6600bb', glow: '#aa33ff', center: '#ddaaff' },
    { petal: '#ff0066', glow: '#ff66aa', center: '#ffe0f0' },
];

class TallFlower {
    constructor(x, isClick = false) {
        this.x = x;
        this.baseY = H;
        this.isClick = isClick;
        this.stemHeight = isClick
            ? Math.random() * 60 + 120
            : Math.random() * 80 + 80;
        this.petalSize = isClick
            ? Math.random() * 12 + 18
            : Math.random() * 10 + 12;
        this.col = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
        this.petals = Math.floor(Math.random() * 2) + 5;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.008 + 0.004;
        this.lean = (Math.random() - 0.5) * 0.3;
        this.life = 0;
        this.maxLife = isClick ? 600 : 900 + Math.random() * 300;
        this.size = 0;
        this.growSpeed = isClick ? 2 : 0.8;
        this.glowPulse = 0;
    }

    draw(t) {
        if (this.size < 1) this.size += this.growSpeed / this.stemHeight;
        this.life++;
        this.glowPulse = (Math.sin(t * 0.03 + this.phase) + 1) / 2;

        const fade = this.life > this.maxLife - 80
            ? Math.max(0, 1 - (this.life - (this.maxLife - 80)) / 80)
            : 1;

        const sway = Math.sin(t * this.speed + this.phase) * 6;
        const stemSize = this.size;
        const tipX = this.x + sway + this.lean * this.stemHeight;
        const tipY = this.baseY - this.stemHeight * stemSize;
        const midX = this.x + sway * 0.5 + this.lean * this.stemHeight * 0.5;
        const midY = this.baseY - this.stemHeight * stemSize * 0.5;

        ctx.save();
        ctx.globalAlpha = fade;

        // Sap
        const stemGrad = ctx.createLinearGradient(this.x, this.baseY, tipX, tipY);
        stemGrad.addColorStop(0, this.col.petal + 'cc');
        stemGrad.addColorStop(1, this.col.petal + '44');
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.baseY);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        // Sap parlak kenar
        ctx.globalAlpha = fade * 0.5;
        ctx.strokeStyle = this.col.glow;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.globalAlpha = fade;

        if (stemSize >= 1) {
            // Çiçek başı - sadece sap tam büyüyünce
            ctx.translate(tipX, tipY);

            const ps = this.petalSize;
            const n  = this.petals;

            // Dış glow halkası
            const glowSize = ps * (1.8 + this.glowPulse * 0.4);
            const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            glowGrad.addColorStop(0,   this.col.glow + '55');
            glowGrad.addColorStop(0.5, this.col.glow + '22');
            glowGrad.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = glowGrad;
            ctx.beginPath(); ctx.arc(0, 0, glowSize, 0, Math.PI * 2); ctx.fill();

            // Yapraklar
            for (let i = 0; i < n; i++) {
                const ang = (Math.PI * 2 / n) * i + t * 0.001;
                ctx.save();
                ctx.rotate(ang);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                     ps * 0.5, -ps * 0.3,
                     ps * 0.5,  ps * 0.3,
                     0, 0
                );
                ctx.bezierCurveTo(
                     ps * 0.9, -ps * 0.5,
                     ps * 0.9,  ps * 0.5,
                     0, ps
                );
                ctx.closePath();

                // Yaprak gradient (koyu içten parlağa)
                const pg = ctx.createLinearGradient(0, 0, 0, ps);
                pg.addColorStop(0,   this.col.center);
                pg.addColorStop(0.4, this.col.petal);
                pg.addColorStop(1,   this.col.petal + '88');
                ctx.fillStyle = pg;
                ctx.fill();

                // Parlak kenar
                ctx.strokeStyle = this.col.glow;
                ctx.lineWidth = 0.8;
                ctx.globalAlpha = fade * (0.6 + this.glowPulse * 0.4);
                ctx.stroke();
                ctx.restore();
            }

            // Merkez
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, ps * 0.35);
            cg.addColorStop(0, '#fff');
            cg.addColorStop(0.5, this.col.center);
            cg.addColorStop(1, this.col.petal);
            ctx.globalAlpha = fade;
            ctx.beginPath(); ctx.arc(0, 0, ps * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = cg; ctx.fill();
            ctx.strokeStyle = this.col.glow;
            ctx.lineWidth = 1;
            ctx.globalAlpha = fade * 0.8;
            ctx.stroke();
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
        this.size  = Math.random() * 3 + 1.5;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.05 + 0.02;
        this.color = ['#ff66aa','#cc44ff','#ff99cc','#ddaaff','#ff3388'][Math.floor(Math.random() * 5)];
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5 - 0.3;
        this.life = 0;
        this.maxLife = 80 + Math.random() * 100;
    }
    draw() {
        this.phase += this.speed;
        this.x += this.vx; this.y += this.vy;
        this.life++;
        const a = Math.sin(this.phase) * (1 - this.life / this.maxLife);
        if (a <= 0) return;
        const s = this.size;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = a;

        // Çapraz yıldız
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? s : s * 0.35;
            const ang = i * Math.PI / 4 + this.phase * 0.2;
            i === 0
                ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
                : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath(); ctx.fill();

        // Merkez parlama
        ctx.beginPath(); ctx.arc(0, 0, s * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();

        ctx.restore();
    }
    get dead() { return this.life > this.maxLife; }
}

// ----------- STATE -----------
let flowers  = [];
let sparkles = [];
let grasses  = [];
let t = 0;

// Zemin otlarını oluştur
for (let i = 0; i < 60; i++) {
    grasses.push(new Grass(Math.random() * W));
}

function noOverlap(x) {
    for (let f of flowers) {
        if (Math.abs(f.x - x) < 40) return false;
    }
    return true;
}

function burst(cx, cy) {
    for (let i = 0; i < 3; i++) {
        let x = cx + (Math.random() - 0.5) * 120;
        if (noOverlap(x)) flowers.push(new TallFlower(x, true));
    }
    for (let i = 0; i < 10; i++) {
        sparkles.push(new Sparkle(
            cx + (Math.random() - 0.5) * 100,
            cy + (Math.random() - 0.5) * 100
        ));
    }
}

canvas.addEventListener('mousedown', e => {
    const r = canvas.getBoundingClientRect();
    burst(e.clientX - r.left, e.clientY - r.top);
});
canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    burst(touch.clientX - r.left, touch.clientY - r.top);
}, { passive: false });

function animate() {
    t++;
    ctx.clearRect(0, 0, W, H);
    drawBg();

    // Zemin otları (arka planda)
    grasses.forEach(g => g.draw(t));

    // Otomatik çiçek
    if (flowers.length < 25 && Math.random() < 0.04) {
        let x = Math.random() * W;
        if (noOverlap(x)) flowers.push(new TallFlower(x, false));
    }

    flowers = flowers.filter(f => !f.dead);
    flowers.forEach(f => f.draw(t));

    // Işıltılar
    if (Math.random() < 0.08) sparkles.push(new Sparkle());
    sparkles = sparkles.filter(s => !s.dead);
    sparkles.forEach(s => s.draw());

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    resize();
    grasses = [];
    for (let i = 0; i < 60; i++) {
        grasses.push(new Grass(Math.random() * W));
    }
});
