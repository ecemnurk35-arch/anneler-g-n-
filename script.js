const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = Math.random() * 35 + 25;
        const colors = [
            `hsl(${Math.random() * 30 + 320}, 80%, 70%)`, // Pembeler
            `hsl(${Math.random() * 30 + 260}, 70%, 70%)`, // Morlar
            `hsl(${Math.random() * 20 + 10}, 90%, 70%)`,  // Soft Turuncu
            '#ffffff' // Beyaz papatya efekti
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.petalCount = Math.floor(Math.random() * 2) + 5;
        this.rotation = Math.random() * Math.PI;
    }

    draw() {
        if (this.size < this.maxSize) this.size += 0.5;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        for (let j = 1; j >= 0.7; j -= 0.3) {
            ctx.fillStyle = this.color;
            ctx.globalAlpha = j === 1 ? 1 : 0.7;
            for (let i = 0; i < this.petalCount; i++) {
                ctx.rotate((Math.PI * 2) / this.petalCount);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(this.size * j, -this.size * j, this.size * j, this.size * j, 0, 0);
                ctx.fill();
            }
        }

        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fillStyle = "#FFD700";
        ctx.fill();
        ctx.restore();
    }
}

let flowers = [];

// Tıklama etkileşimi
function createFlowers(e) {
    const x = e.clientX || e.touches[0].clientX;
    const y = e.clientY || e.touches[0].clientY;
    for(let i=0; i<5; i++) {
        flowers.push(new Flower(x + (Math.random()*60-30), y + (Math.random()*60-30)));
    }
}

window.addEventListener('mousedown', createFlowers);
window.addEventListener('touchstart', createFlowers);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Zamanla kendi kendine çiçek açması
    if (flowers.length < 70 && Math.random() < 0.08) {
        flowers.push(new Flower(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    flowers.forEach(flower => flower.draw());
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});