// Visual effects system
class EffectsSystem {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.particles = [];
        this.weatherParticles = [];
        this.currentWeatherType = null;
    }

    // Particle explosion effect
    createParticleExplosion(x, y, count = 12, type = 'success') {
        const color = type === 'success' ? '#d4af37' : 
                     type === 'error' ? '#ff4444' : '#8b7355';
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (Math.PI * 2 / count) * i;
            const velocity = 2 + Math.random() * 3;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = color;
            particle.style.boxShadow = `0 0 6px ${color}`;
            
            document.body.appendChild(particle);
            
            let posX = x;
            let posY = y;
            let opacity = 1;
            let rotation = 0;
            
            const animateParticle = () => {
                posX += Math.cos(angle) * velocity;
                posY += Math.sin(angle) * velocity + 1;
                opacity -= 0.02;
                rotation += 10;
                
                particle.style.left = posX + 'px';
                particle.style.top = posY + 'px';
                particle.style.opacity = opacity;
                particle.style.transform = `rotate(${rotation}deg)`;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    }

    // Floating text effect
    showFloatingText(text, x, y, color = '#d4af37') {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        floatingText.style.color = color;
        floatingText.style.textShadow = `0 0 10px ${color}`;
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => floatingText.remove(), 2000);
    }

    // Screen shake effect
    shakeScreen(intensity = 10, duration = 500) {
        const startTime = Date.now();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < duration) {
                const x = (Math.random() - 0.5) * intensity;
                const y = (Math.random() - 0.5) * intensity;
                this.canvas.style.transform = `translate(${x}px, ${y}px)`;
                requestAnimationFrame(shake);
            } else {
                this.canvas.style.transform = '';
            }
        };
        
        shake();
    }

    // Healing effect overlay
    createHealingEffect() {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'radial-gradient(circle, rgba(139, 195, 74, 0.3) 0%, transparent 70%)';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '15';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.style.opacity = '1', 10);
        setTimeout(() => overlay.style.opacity = '0', 500);
        setTimeout(() => overlay.remove(), 1000);
    }

    // Weather effects
    startWeatherEffect(type = 'rain') {
        this.clearWeatherEffects();
        this.currentWeatherType = type;
        
        const createWeatherParticle = () => {
            if (this.currentWeatherType !== type) return;
            
            const particle = document.createElement('div');
            particle.className = `weather-particle ${type}`;
            
            // Random horizontal position
            particle.style.left = Math.random() * window.innerWidth + 'px';
            particle.style.top = '-20px';
            
            // Random animation delay for more natural effect
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            document.body.appendChild(particle);
            
            // Remove particle after animation
            const animationDuration = type === 'rain' ? 1000 : 
                                    type === 'snow' ? 3000 : 
                                    type === 'leaves' ? 4000 : 5000;
            
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.remove();
                }
            }, animationDuration + 2000);
        };
        
        // Create particles at intervals
        const interval = setInterval(() => {
            if (this.currentWeatherType === type) {
                createWeatherParticle();
            } else {
                clearInterval(interval);
            }
        }, type === 'rain' ? 50 : 200);
        
        this.weatherInterval = interval;
    }

    clearWeatherEffects() {
        if (this.weatherInterval) {
            clearInterval(this.weatherInterval);
        }
        
        // Remove existing weather particles
        const weatherParticles = document.querySelectorAll('.weather-particle');
        weatherParticles.forEach(particle => particle.remove());
        
        this.currentWeatherType = null;
    }

    // Draw atmospheric background
    drawBackground(time, sanity = 100, season = 'spring') {
        // Dark gradient with subtle animation
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2 + Math.sin(time) * 20,
            this.canvas.height / 2 + Math.cos(time) * 20,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width
        );
        
        const darkness = sanity ? (100 - sanity) / 200 : 0;
        gradient.addColorStop(0, `rgba(26, 21, 16, ${0.8 + darkness})`);
        gradient.addColorStop(0.5, `rgba(15, 12, 9, ${0.9 + darkness})`);
        gradient.addColorStop(1, '#050505');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw organic tree structure
        this.ctx.save();
        this.ctx.globalAlpha = 0.8;
        this.drawOrganicTree(time);
        this.ctx.restore();
        
        // Add atmospheric fog
        this.drawFog(time);
        
        // Season-specific effects
        if (season === 'winter') {
            this.drawFrost();
        } else if (season === 'autumn') {
            this.drawAutumnLeaves(time);
        }
    }

    drawOrganicTree(time) {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height;
        
        // Main trunk with organic curves
        this.ctx.fillStyle = '#0a0805';
        this.ctx.beginPath();
        
        const trunkWidth = 100 + Math.sin(time * 2) * 5;
        const curves = 8;
        
        for (let i = 0; i <= curves; i++) {
            const y = baseY - (i / curves) * (this.canvas.height * 0.6);
            const offsetX = Math.sin(i * 0.5 + time) * 20;
            const width = trunkWidth * (1 - i / curves / 2);
            
            if (i === 0) {
                this.ctx.moveTo(centerX - width + offsetX, y);
            } else {
                this.ctx.quadraticCurveTo(
                    centerX - width + offsetX,
                    y + 20,
                    centerX - width + offsetX,
                    y
                );
            }
        }
        
        // Right side of trunk
        for (let i = curves; i >= 0; i--) {
            const y = baseY - (i / curves) * (this.canvas.height * 0.6);
            const offsetX = Math.sin(i * 0.5 + time) * 20;
            const width = trunkWidth * (1 - i / curves / 2);
            
            this.ctx.quadraticCurveTo(
                centerX + width + offsetX,
                y + 20,
                centerX + width + offsetX,
                y
            );
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw writhing branches
        const branchCount = 7;
        for (let i = 0; i < branchCount; i++) {
            const startY = this.canvas.height * (0.3 + i * 0.08);
            const angle = (i - branchCount / 2) * 0.4 + Math.sin(time + i) * 0.1;
            this.drawOrganicBranch(
                centerX + Math.sin(i * 0.5 + time) * 20,
                startY,
                angle,
                100 + i * 20,
                20 - i * 2,
                time + i
            );
        }
    }

    drawOrganicBranch(x, y, angle, length, width, timeOffset) {
        if (length < 20 || width < 2) return;
        
        const segments = 5;
        
        this.ctx.strokeStyle = '#0a0805';
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        
        let currentX = x;
        let currentY = y;
        let currentAngle = angle;
        
        for (let i = 1; i <= segments; i++) {
            const segmentLength = length / segments;
            const wiggle = Math.sin(timeOffset * 3 + i) * 0.1;
            currentAngle += wiggle;
            
            const endX = currentX + Math.cos(currentAngle) * segmentLength;
            const endY = currentY + Math.sin(currentAngle) * segmentLength;
            
            this.ctx.quadraticCurveTo(
                currentX + Math.cos(currentAngle - Math.PI / 2) * width / 2,
                currentY + Math.sin(currentAngle - Math.PI / 2) * width / 2,
                endX,
                endY
            );
            
            currentX = endX;
            currentY = endY;
        }
        
        this.ctx.stroke();
        
        // Recursive smaller branches
        if (Math.random() > 0.3) {
            this.drawOrganicBranch(
                currentX,
                currentY,
                currentAngle - 0.5 + Math.random() * 0.3,
                length * 0.7,
                width * 0.7,
                timeOffset + 1
            );
        }
        
        if (Math.random() > 0.3) {
            this.drawOrganicBranch(
                currentX,
                currentY,
                currentAngle + 0.5 - Math.random() * 0.3,
                length * 0.7,
                width * 0.7,
                timeOffset - 1
            );
        }
    }

    drawFog(time) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        
        for (let i = 0; i < 3; i++) {
            const offset = i * 1000;
            const x = Math.sin(time + offset) * 100 + this.canvas.width / 2;
            const y = Math.cos(time * 0.7 + offset) * 50 + this.canvas.height / 2;
            
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 300);
            gradient.addColorStop(0, 'rgba(139, 115, 85, 0.2)');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        this.ctx.restore();
    }

    drawFrost() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.2;
        this.ctx.fillStyle = 'rgba(200, 220, 255, 0.3)';
        
        // Create frost pattern
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 20 + 5;
            
            this.ctx.beginPath();
            for (let j = 0; j < 6; j++) {
                const angle = (j / 6) * Math.PI * 2;
                const px = x + Math.cos(angle) * size;
                const py = y + Math.sin(angle) * size;
                
                if (j === 0) {
                    this.ctx.moveTo(px, py);
                } else {
                    this.ctx.lineTo(px, py);
                }
            }
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    drawAutumnLeaves(time) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.6;
        
        const colors = ['#8b6914', '#cd853f', '#d2691e', '#ff8c00'];
        
        for (let i = 0; i < 20; i++) {
            const x = (Math.sin(time + i) * 0.5 + 0.5) * this.canvas.width;
            const y = ((time * 50 + i * 100) % (this.canvas.height + 100)) - 50;
            const rotation = time * 2 + i;
            const size = 10 + Math.sin(i) * 5;
            
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.rotate(rotation);
            
            this.ctx.fillStyle = colors[i % colors.length];
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, size, size * 0.7, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        this.ctx.restore();
    }
}