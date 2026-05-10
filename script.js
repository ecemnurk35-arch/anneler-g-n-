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
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0,   '#0a0010');
    g.addColorStop(0.5, '#0d0018');
    g.addColorStop(1,   '#050008');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
}

// ----------- ZEMİN OTU -----------
class Grass {
    constructor(x) {
        this.x = x;
        this.height = Math.random() * 80 + 50;
        this.lean = (Math.random() - 0.5) * 0.5;
        this.width = Math.random() * 4 + 2;
        this.phase = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 0.01 + 0.005;
        this.color = Math.random() < 0.5
            ? { r: 160, g: 0, b: 70 }
            : { r: 70,  g: 0, b: 140 };
    }
    draw(t) {
        const sway = Math.sin(t * this.speed + this.phase) * 7;
        const tipX = this.x + sway + this.lean * this.height;
        const tipY = H - this.height;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.x, H);
        ctx.quadraticCurveTo(
            this.x + sway * 0.5 + this.lean * this.height * 0.5,
            H - this.height * 0.5,
            tipX, tipY
        );
        const { r, g, b } = this.color;
        const grad = ctx.createLinearGradient(this.x, H, tipX, tipY);
        grad.addColorStop(0, `rgba(${r},${g},${b},0.9)`);
        grad.addColorStop(1, `rgba(${r},${g},${b},0.1)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';
        ctx.stroke();
        // parlak kenar
        ctx.globalAlpha = 0.35;
        ctx.strokeStyle = `rgba(255,${g + 80},${b + 80},0.5)`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
        ctx.restore();
    }
}

// ----------- GERÇEK ÇİÇEK (Referansa uygun: yuvarlak yapraklar, belirgin merkez) -----------
const FLOWER_COLORS = [
    { petal: '#cc0055', glow: '#ff3399', center: '#ffccdd' },
    { petal: '#8800bb', glow: '#bb44ff', center: '#eeccff' },
    { petal: '#dd0044', glow: '#ff2277', center: '#ffaabb' },
    { petal: '#6600aa', glow: '#9933ff', center: '#ddaaff' },
    { petal: '#ee0077', glow: '#ff55bb', center: '#ffd0e8' },
];

class TallFlower {
    constructor(x, isClick = false) {
        this.x = x;
        this.isClick = isClick;
        this.stemHeight = isClick
            ? Math.random() * 70 + 130
            : Math.random() * 90 + 80;
        this.petalSize = isClick
            ? Math.random() * 14 + 20
            : Math.random() * 10 + 13;
        this.col = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
        this.petalCount = Math.floor(Math.random() * 2) + 5; // 5 veya 6
        this.phase = Math.random() * Math.PI * 2;
        this.swaySpeed = Math.random() * 0.008 + 0.004;
        this.lean = (Math.random() - 0.5) * 0.25;
        this.life = 0;
        this.maxLife = isClick ? 500 : 800 + Math.random() * 400;
        this.grown = 0; // 0..1
        this.growSpeed = isClick ? 0.025 : 0.01;
        this.glowPulse = 0;
        this.rotOffset = Math.random() * Math.PI * 2;
    }

    draw(t) {
        this.grown = Math.min(1, this.grown + this.growSpeed);
        this.life++;
        this.glowPulse = (Math.sin(t * 0.04 + this.phase) + 1) / 2;

        const fade = this.life > this.maxLife - 80
            ? Math.max(0, 1 - (this.life - (this.maxLife - 80)) / 80)
            : 1;

        const sway = Math.sin(t * this.swaySpeed + this.phase) * 6;
        const sh = this.stemHeight * this.grown;
        const tipX = this.x + sway + this.lean * sh;
        const tipY = H - sh;
        const midX = this.x + sway * 0.5 + this.lean * sh * 0.5;
        const midY = H - sh * 0.5;

        ctx.save();
        ctx.globalAlpha = fade;

        // --- SAP ---
        const stemGrad = ctx.createLinearGradient(this.x, H, tipX, tipY);
        stemGrad.addColorStop(0, this.col.petal + 'cc');
        stemGrad.addColorStop(1, this.col.petal + '33');
        ctx.strokeStyle = stemGrad;
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, H);
        ctx.quadraticCurveTo(midX, midY, tipX, tipY);
        ctx.stroke();

        // sap glow
        ctx.globalAlpha = fade * 0.4;
        ctx.strokeStyle = this.col.glow;
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.globalAlpha = fade;

        // --- ÇİÇEK BAŞI (sadece büyüyünce) ---
        if (this.grown > 0.85) {
            const flowerAlpha = (this.grown - 0.85) / 0.15;
            ctx.globalAlpha = fade * flowerAlpha;
            ctx.translate(tipX, tipY);

            const ps = this.petalSize;
            const n  = this.petalCount;

            // Dış glow
            const glowR = ps * (1.6 + this.glowPulse * 0.3);
            const glowG = ctx.createRadialGradient(0, 0, 0, 0, 0, glowR);
            glowG.addColorStop(0,   this.col.glow + '44');
            glowG.addColorStop(0.5, this.col.glow + '18');
            glowG.addColorStop(1,   'rgba(0,0,0,0)');
            ctx.fillStyle = glowG;
            ctx.beginPath(); ctx.arc(0, 0, glowR, 0, Math.PI * 2); ctx.fill();

            // YAPRAKLAR — yuvarlak uçlu elips (referanstaki gibi)
            for (let i = 0; i < n; i++) {
                const ang = (Math.PI * 2 / n) * i + this.rotOffset;
                ctx.save();
                ctx.rotate(ang);

               // Damla/yuvarlak yaprak şekli

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    -ps * 0.5,  -ps * 0.3,
                    -ps * 0.5,  -ps * 1.1,
                    0,         -ps * 1.3
                );
                ctx.bezierCurveTo(
                    ps * 0.5,  -ps * 1.1,
                    ps * 0.5,  -ps * 0.3,
                    0,          0
                );
                ctx.closePath();

                // Yaprak gradient: içten dışa
                const pg = ctx.createRadialGradient(0, -ps * 0.4, 0, 0, -ps * 0.65, ps * 0.7);
                pg.addColorStop(0,   this.col.center);
                pg.addColorStop(0.5, this.col.petal);
                pg.addColorStop(1,   this.col.petal + '99');
                ctx.fillStyle = pg;
                ctx.fill();

                // Parlak kenar çizgisi
                ctx.strokeStyle = this.col.glow;
                ctx.lineWidth = 0.9;
                ctx.globalAlpha = fade * flowerAlpha * (0.5 + this.glowPulse * 0.5);
                ctx.stroke();

                ctx.restore();
            }

            // MERKEZ
            ctx.globalAlpha = fade * flowerAlpha;
            const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, ps * 0.32);
            cg.addColorStop(0,   '#ffffff');
            cg.addColorStop(0.4, this.col.center);
            cg.addColorStop(1,   this.col.petal);
            ctx.beginPath(); ctx.arc(0, 0, ps * 0.32, 0, Math.PI * 2);
            ctx.fillStyle = cg; ctx.fill();
            ctx.strokeStyle = this.col.glow;
            ctx.lineWidth = 1;
            ctx.globalAlpha = fade * flowerAlpha * 0.7;
            ctx.stroke();
        }

        ctx.restore();
    }

    get dead() { return this.life > this.maxLife; }
}

// ----------- SARMAŞIK (yukarıdan aşağı iner, üstünde küçük çiçekler) -----------
const IVY_COLORS = [
    { stem: '#cc0055', leaf: '#880033', flower: '#ff66aa', fCenter: '#ffddee' },
    { stem: '#8800cc', leaf: '#550088', flower: '#dd66ff', fCenter: '#eeccff' },
    { stem: '#ff0066', leaf: '#aa0044', flower: '#ff88bb', fCenter: '#ffccdd' },
];

class Ivy {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * W;
        this.col = IVY_COLORS[Math.floor(Math.random() * IVY_COLORS.length)];
        this.segments = [];
        this.maxLen = Math.random() * 180 + 120;
        this.curLen = 0;
        this.growSpeed = Math.random() * 1.5 + 1.0;
        this.phase = Math.random() * Math.PI * 2;
        this.swayAmp = Math.random() * 18 + 10;
        this.swaySpeed = Math.random() * 0.008 + 0.003;
        this.life = 0;
        this.maxLife = 700 + Math.random() * 400;
        this.segLen = 12;
        this.built = false;
        // Sarmaşık yolunu önceden hesapla
        this.buildPath();
    }
    buildPath() {
        this.points = [];
        let cx = this.x, cy = 0;
        const steps = Math.ceil(this.maxLen / this.segLen);
        for (let i = 0; i <= steps; i++) {
            const wave = Math.sin(i * 0.4 + this.phase) * this.swayAmp;
            cx = this.x + wave;
            cy = i * this.segLen;
            this.points.push({ x: cx, y: cy });
        }
        // Her 3 segmentte bir yaprak/çiçek
        this.decorations = [];
        for (let i = 2; i < this.points.length; i += 3) {
            const side = i % 2 === 0 ? 1 : -1;
            const isFlower = Math.random() < 0.35;
            this.decorations.push({ idx: i, side, isFlower });
        }
    }
    draw(t) {
        this.life++;
        if (this.curLen < this.maxLen) this.curLen += this.growSpeed;

        const fade = this.life > this.maxLife - 100
            ? Math.max(0, 1 - (this.life - (this.maxLife - 100)) / 100)
            : 1;

        const visiblePts = Math.floor((this.curLen / this.maxLen) * this.points.length);
        if (visiblePts < 2) return;

        ctx.save();
        ctx.globalAlpha = fade;

        // Sway animasyonu için offset
        const swayOff = Math.sin(t * this.swaySpeed + this.phase) * 4;

        // --- SARI DALLAR ---
        ctx.beginPath();
        ctx.moveTo(this.points[0].x + swayOff, this.points[0].y);
        for (let i = 1; i < visiblePts; i++) {
            ctx.lineTo(this.points[i].x + swayOff, this.points[i].y);
        }
        ctx.strokeStyle = this.col.stem;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Parlak kenar
        ctx.strokeStyle = this.col.flower + '55';
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // --- YAPRAKLAR & ÇİÇEKLER ---
        for (const dec of this.decorations) {
            if (dec.idx >= visiblePts) break;
            const p = this.points[dec.idx];
            const px = p.x + swayOff;
            const py = p.y;

            ctx.save();
            ctx.translate(px, py);

            if (dec.isFlower) {
                // Küçük çiçek
                const ps = 5;
                const nc = 5;
                for (let i = 0; i < nc; i++) {
                    const ang = (Math.PI * 2 / nc) * i;
                    ctx.save();
                    ctx.rotate(ang);
                    ctx.beginPath();
                    ctx.ellipse(0, -ps, ps * 0.4, ps * 0.55, 0, 0, Math.PI * 2);
                    ctx.fillStyle = this.col.flower;
                    ctx.globalAlpha = fade * 0.9;
                    ctx.fill();
                    ctx.restore();
                }
                // Merkez
                ctx.beginPath(); ctx.arc(0, 0, ps * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = this.col.fCenter;
                ctx.globalAlpha = fade;
                ctx.fill();
            } else {
                // Yaprak
                ctx.rotate(dec.side * 0.7);
                ctx.beginPath();
                ctx.ellipse(dec.side * 8, 0, 10, 5, dec.side * 0.3, 0, Math.PI * 2);
                ctx.fillStyle = this.col.leaf;
                ctx.globalAlpha = fade * 0.85;
                ctx.fill();
                ctx.strokeStyle = this.col.flower + '66';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.restore();

        if (this.life > this.maxLife) this.reset();
    }
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
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.globalAlpha = a;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? this.size : this.size * 0.35;
            const ang = i * Math.PI / 4 + this.phase * 0.2;
            i === 0
                ? ctx.moveTo(Math.cos(ang) * r, Math.sin(ang) * r)
                : ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
        }
        ctx.closePath(); ctx.fill();
        ctx.beginPath(); ctx.arc(0, 0, this.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = '#fff'; ctx.fill();
        ctx.restore();
    }
    get dead() { return this.life > this.maxLife; }
}

// ----------- STATE -----------
let flowers  = [];
let sparkles = [];
let grasses  = [];
let ivies    = [];
let t = 0;

for (let i = 0; i < 55; i++) grasses.push(new Grass(Math.random() * W));
for (let i = 0; i < 8; i++) {
    const ivy = new Ivy();
    ivy.curLen = ivy.maxLen * 0.5; // Baştan yarı uzunlukta başlasın
    ivies.push(ivy);
}
function noOverlap(x) {
    for (let f of flowers) {
        if (Math.abs(f.x - x) < 45) return false;
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

    // Sarmaşıklar (en arkada)
    ivies.forEach(iv => iv.draw(t));

    // Zemin otları
    grasses.forEach(g => g.draw(t));

    // Otomatik çiçek
    if (flowers.length < 22 && Math.random() < 0.04) {
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
    for (let i = 0; i < 55; i++) grasses.push(new Grass(Math.random() * W));
});
