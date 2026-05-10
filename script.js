const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Renk Paleti (Canlı Bahar)
const colorPalette = [
    { main: '#ff69b4', inner: '#ffb6c1', center: '#ffdb58' }, // Pembe
    { main: '#9370db', inner: '#e6e6fa', center: '#ffff00' }, // Mor
    { main: '#ff7f50', inner: '#ffa07a', center: '#ffd700' }, // Mercan
    { main: '#40e0d0', inner: '#afeeee', center: '#ff8c00' }  // Turkuaz (Farklılık olsun)
];

class Flower {
    constructor(x, y, isClick = false) {
        this.x = x;
        this.y = y;
        this.isClick = isClick;
        this.size = 0;
        // Tıklananlar daha büyük, otomatikler daha varyasyonlu
        this.maxSize = isClick ? (Math.random() * 20 + 40) : (Math.random() * 25 + 20); 
        this.colors = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        this.petalCount = Math.floor(Math.random() * 3) + 6; // 6-8 yaprak
        this.rotation = Math.random() * Math.PI * 2;
        this.growthSpeed = isClick ? 1 : 0.4; // Tıklananlar hızlı açar
        this.life = 0; // Çiçeğin yaşı
    }

    draw() {
        if (this.size < this.maxSize) this.size += this.growthSpeed;
        this.life++;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation + this.life * 0.002); // Çok hafif yavaş dönme efekti

        // --- Katman 1: Gölge/Dış Çeper ---
        ctx.fillStyle = 'rgba(0,0,0,0.1)';
        this.drawPetals(this.size * 1.05, this.petalCount);

        // --- Katman 2: Ana Yapraklar (Gradient) ---
        let grad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        grad.addColorStop(0.5, this.colors.inner);
        grad.addColorStop(1, this.colors.main);
        ctx.fillStyle = grad;
        this.drawPetals(this.size, this.petalCount);

        // --- Katman 3: İç Küçük Yapraklar ---
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.drawPetals(this.size * 0.6, this.petalCount, true);

        // --- Katman 4: Çiçek Merkezi (Polen) ---
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        // Polen parlama efekti
        let polenGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size/4);
        polenGrad.addColorStop(0, '#fff');
        polenGrad.addColorStop(1, this.colors.center);
        ctx.fillStyle = polenGrad;
        ctx.fill();
        ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1; ctx.stroke();

        ctx.restore();
    }

    drawPetals(size, count, inner = false) {
        for (let i = 0; i < count; i++) {
            ctx.rotate((Math.PI * 2) / count);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            if(inner) {
                // İç yapraklar daha basit elips
                ctx.ellipse(0, -size/2, size/3, size, 0, 0, Math.PI * 2);
            } else {
                // Dış yapraklar daha süslü (Kalp benzeri)
                ctx.bezierCurveTo(size, -size, size, size, 0, 0);
            }
            ctx.fill();
        }
    }
}

// Uçuşan Polenler (Arka planı canlandırmak için)
class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 + 0.5;
        this.color = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.2})`;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.y > canvas.height) this.reset();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
}

let flowers = [];
let particles = [];
for(let i=0; i<30; i++) particles.push(new Particle()); // 30 polen oluştur

// --- AKILLI ÇATIŞMA KONTROLÜ ---
function isOverlapping(x, y, newSize) {
    for (let flower of flowers) {
        // İki merkez arasındaki mesafe
        const dx = flower.x - x;
        const dy = flower.y - y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        // Eğer mesafe, iki çiçeğin yarıçapları toplamından küçükse, çakışıyorlar demektir.
        // Tolerans için 0.7 ile çarptık (hafifçe dokunabilirler).
        if (distance < (flower.maxSize + newSize) * 0.7) {
            return true; 
        }
    }
    return false;
}

// Güvenli koordinat bulma (Üst üste binmeyi engellemek için)
function getSafeCoords(targetX, targetY, isClick) {
    let x, y, sizeEstimate = isClick ? 50 : 30;
    let attempts = 0;
    do {
        if(isClick) {
            // Tıklanan yerin etrafında rastgele
            x = targetX + (Math.random() * 100 - 50);
            y = targetY + (Math.random() * 100 - 50);
        } else {
            // Ekranın herhangi bir yerinde
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        }
        attempts++;
        // 10 denemede güvenli yer bulamazsa pes et (kilitlenmemek için)
    } while (isOverlapping(x, y, sizeEstimate) && attempts < 10);
    
    return attempts < 10 ? {x, y} : null; // null dönerse çiçek ekleme
}

// Etkileşim
function handleInteraction(e) {
    e.preventDefault(); // Varsayılan dokunma efektlerini engelle
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    for(let i=0; i<4; i++) { // Tıklayınca 4 çiçek
        const coords = getSafeCoords(x, y, true);
        if(coords) flowers.push(new Flower(coords.x, coords.y, true));
    }
}

window.addEventListener('mousedown', handleInteraction);
window.addEventListener('touchstart', handleInteraction, {passive: false});

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Polenleri çiz
    particles.forEach(p => { p.update(); p.draw(); });
    
    // Otomatik çiçek açma (Sadece güvenli yer varsa)
    if (flowers.length < 80 && Math.random() < 0.06) {
        const coords = getSafeCoords(0, 0, false);
        if(coords) flowers.push(new Flower(coords.x, coords.y, false));
    }

    flowers.forEach(flower => flower.draw());
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});