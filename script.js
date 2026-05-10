const canvas = document.getElementById('flowerCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Flower {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.maxSize = Math.random() * 30 + 20;
        this.color = `hsl(${Math.random() * 60 + 330}, 80%, 70%)`; // Pembe ve mor tonları
        this.petalCount = Math.floor(Math.random() * 3) + 5;
    }

    draw() {
        if (this.size < this.maxSize) this.size += 0.5; // Büyüme hızı

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.fillStyle = this.color;

        for (let i = 0; i < this.petalCount; i++) {
            ctx.rotate((Math.PI * 2) / this.petalCount);
            ctx.beginPath();
            ctx.ellipse(0, this.size / 2, this.size / 4, this.size, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Çiçeğin ortası (polen kısmı)
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 5, 0, Math.PI * 2);
        ctx.fillStyle = "yellow";
        ctx.fill();
        ctx.restore();
    }
}

let flowers = [];

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Rastgele yeni çiçekler ekle
    if (flowers.length < 50 && Math.random() < 0.1) {
        flowers.push(new Flower(Math.random() * canvas.width, Math.random() * canvas.height));
    }

    flowers.forEach(flower => flower.draw());
    requestAnimationFrame(animate);
}

animate();