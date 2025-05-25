// The Watcher's Grove - Game Engine
// Core game logic and state management

class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, ended
        this.gameMode = 'story'; // story, survival, zen, boss, practice, editor
        this.level = 1;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.streak = 0;
        
        // Player stats
        this.sanity = 100;
        this.insight = 0;
        this.power = 100;
        
        // Game elements
        this.eyes = [];
        this.particles = [];
        this.sequence = [];
        this.playerSequence = [];
        
        // Settings
        this.soundEnabled = true;
        this.difficulty = 'adept';
        this.currentSeason = 'default';
        
        // Initialize
        this.setupCanvas();
        this.bindEvents();
    }
    
    setupCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    bindEvents() {
        // Pause
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.togglePause();
            }
        });
    }
    
    startGame(mode) {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.level = 1;
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        
        this.initializeStats();
        this.hideMenu();
        this.showGameUI();
        
        setTimeout(() => {
            this.initLevel();
        }, 1000);
    }
    
    initializeStats() {
        const difficultySettings = {
            novice: { sanity: 100, powerBonus: 2, timeBonus: 1.5 },
            adept: { sanity: 100, powerBonus: 1, timeBonus: 1 },
            master: { sanity: 80, powerBonus: 0.5, timeBonus: 0.8 },
            elder: { sanity: 60, powerBonus: 0.3, timeBonus: 0.6 }
        };
        
        const settings = difficultySettings[this.difficulty];
        this.sanity = settings.sanity;
        this.power = 100;
        this.insight = 0;
        this.difficultyMultiplier = settings;
        
        this.updateStats();
    }
    
    initLevel() {
        this.eyes = [];
        this.playerSequence = [];
        
        const numEyes = this.calculateEyeCount();
        this.createEyes(numEyes);
        
        const sequenceLength = this.calculateSequenceLength();
        this.generateSequence(sequenceLength, numEyes);
        
        this.showNarrative();
        
        setTimeout(() => {
            this.playSequence();
        }, 3000);
    }
    
    calculateEyeCount() {
        switch(this.gameMode) {
            case 'zen':
                return 10;
            case 'boss':
                return 10 + this.level * 3;
            default:
                return 15 + Math.floor(this.level * 2.5);
        }
    }
    
    calculateSequenceLength() {
        switch(this.gameMode) {
            case 'zen':
                return 4;
            case 'boss':
                return 5 + this.level * 2;
            default:
                return Math.min(3 + this.level, 12);
        }
    }
    
    createEyes(count) {
        const patterns = ['spiral', 'tree', 'circle', 'chaos', 'fibonacci'];
        const pattern = patterns[this.level % patterns.length];
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        for (let i = 0; i < count; i++) {
            let x, y;
            
            // Calculate position based on pattern
            switch(pattern) {
                case 'spiral':
                    const angle = (i / count) * Math.PI * 4;
                    const radius = 50 + i * 10;
                    x = centerX + Math.cos(angle) * radius;
                    y = centerY + Math.sin(angle) * radius;
                    break;
                    
                case 'tree':
                    const level = Math.floor(Math.sqrt(i));
                    const angleInLevel = (i - level * level) / (2 * level + 1) * Math.PI * 2;
                    const levelRadius = 80 + level * 60;
                    x = centerX + Math.cos(angleInLevel) * levelRadius * (0.8 + Math.random() * 0.4);
                    y = centerY - 100 + level * 80 + Math.sin(angleInLevel) * 40;
                    break;
                    
                case 'circle':
                    const circleAngle = (i / count) * Math.PI * 2;
                    const circleRadius = 150 + (i % 3) * 50;
                    x = centerX + Math.cos(circleAngle) * circleRadius;
                    y = centerY + Math.sin(circleAngle) * circleRadius;
                    break;
                    
                case 'fibonacci':
                    const fibAngle = i * 137.5 * Math.PI / 180;
                    const fibRadius = 10 * Math.sqrt(i);
                    x = centerX + Math.cos(fibAngle) * fibRadius;
                    y = centerY + Math.sin(fibAngle) * fibRadius;
                    break;
                    
                default: // chaos
                    const randAngle = Math.random() * Math.PI * 2;
                    const randRadius = 100 + Math.random() * 250;
                    x = centerX + Math.cos(randAngle) * randRadius;
                    y = centerY + Math.sin(randAngle) * randRadius;
            }
            
            this.createEye(x, y, i);
        }
    }
    
    createEye(x, y, index) {
        const eye = document.createElement('div');
        eye.className = 'eye';
        
        // Special eye types
        if (Math.random() < 0.1) {
            eye.classList.add('ancient');
        } else if (Math.random() < 0.05 && this.gameMode === 'survival') {
            eye.classList.add('corrupted');
        }
        
        eye.style.left = (x - 20) + 'px';
        eye.style.top = (y - 20) + 'px';
        eye.dataset.index = index;
        
        eye.addEventListener('click', (e) => this.handleEyeClick(e));
        
        document.body.appendChild(eye);
        this.eyes.push(eye);
        
        // Animate appearance
        eye.style.opacity = '0';
        eye.style.transform = 'scale(0)';
        setTimeout(() => {
            eye.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            eye.style.opacity = '1';
            eye.style.transform = 'scale(1)';
        }, index * 30);
    }
    
    generateSequence(length, maxIndex) {
        this.sequence = [];
        for (let i = 0; i < length; i++) {
            this.sequence.push(Math.floor(Math.random() * maxIndex));
        }
    }
    
    playSequence() {
        if (this.gameState !== 'playing') return;
        
        let index = 0;
        const baseDelay = 600 * (this.difficultyMultiplier?.timeBonus || 1);
        
        const showNext = () => {
            if (index < this.sequence.length && this.gameState === 'playing') {
                const eyeIndex = this.sequence[index];
                const eye = this.eyes[eyeIndex];
                
                if (eye) {
                    eye.classList.add('active');
                    this.playEyeSound(eyeIndex);
                    
                    setTimeout(() => {
                        if (eye) eye.classList.remove('active');
                        index++;
                        setTimeout(showNext, 300);
                    }, baseDelay);
                }
            }
        };
        
        showNext();
    }
    
    handleEyeClick(e) {
        if (this.gameState !== 'playing') return;
        
        const eye = e.target;
        const index = parseInt(eye.dataset.index);
        
        this.playerSequence.push(index);
        eye.classList.add('active');
        
        this.playEyeSound(index);
        this.createParticles(eye);
        
        setTimeout(() => eye.classList.remove('active'), 300);
        
        // Check sequence
        const currentIndex = this.playerSequence.length - 1;
        if (this.playerSequence[currentIndex] !== this.sequence[currentIndex]) {
            this.handleMistake();
        } else if (this.playerSequence.length === this.sequence.length) {
            this.handleSuccess();
        }
    }
    
    handleMistake() {
        this.combo = 0;
        this.streak = 0;
        this.sanity -= 20;
        
        this.updateStats();
        this.showNarrative("The pattern breaks. Try again...");
        this.shakeScreen();
        
        if (this.sanity <= 0) {
            this.endGame(false);
        } else {
            this.playerSequence = [];
            setTimeout(() => this.playSequence(), 2000);
        }
    }
    
    handleSuccess() {
        this.combo++;
        this.streak++;
        
        if (this.combo > this.maxCombo) {
            this.maxCombo = this.combo;
        }
        
        // Calculate score
        let points = 100 * this.level * (this.combo + 1);
        this.score += Math.floor(points);
        
        // Gain insight
        this.insight += 10 + this.level * 2;
        
        this.updateStats();
        this.showFloatingScore(points);
        
        this.level++;
        
        this.showNarrative("The pattern is accepted. Deeper we go...");
        
        setTimeout(() => {
            this.clearEyes();
            
            if (this.shouldEndGame()) {
                this.endGame(true);
            } else {
                this.initLevel();
            }
        }, 2000);
    }
    
    shouldEndGame() {
        switch(this.gameMode) {
            case 'story':
                return this.level > 6;
            case 'survival':
                return this.power <= 0;
            default:
                return false;
        }
    }
    
    createParticles(eye) {
        const rect = eye.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const angle = (Math.PI * 2 / 10) * i;
            const velocity = 2 + Math.random() * 3;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = '#8b7355';
            
            document.body.appendChild(particle);
            
            let posX = x;
            let posY = y;
            let opacity = 1;
            
            const animateParticle = () => {
                posX += Math.cos(angle) * velocity;
                posY += Math.sin(angle) * velocity + 1;
                opacity -= 0.02;
                
                particle.style.left = posX + 'px';
                particle.style.top = posY + 'px';
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    particle.remove();
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
    }
    
    playEyeSound(index) {
        if (!this.soundEnabled || !window.audioManager) return;
        window.audioManager.playEyeSound(index);
    }
    
    showNarrative(text) {
        if (window.uiManager) {
            window.uiManager.showNarrative(text);
        }
    }
    
    showFloatingScore(points) {
        if (window.uiManager) {
            window.uiManager.showFloatingText(`+${Math.floor(points)}`, 
                this.canvas.width / 2, this.canvas.height / 2);
        }
    }
    
    updateStats() {
        if (window.uiManager) {
            window.uiManager.updateStats(this);
        }
    }
    
    shakeScreen() {
        const intensity = 10;
        const duration = 500;
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
    
    clearEyes() {
        this.eyes.forEach((eye, index) => {
            setTimeout(() => {
                eye.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                eye.style.opacity = '0';
                eye.style.transform = 'scale(0) rotate(180deg)';
                setTimeout(() => eye.remove(), 500);
            }, index * 20);
        });
        this.eyes = [];
    }
    
    hideMenu() {
        const menu = document.getElementById('mainMenu');
        menu.style.opacity = '0';
        menu.style.transform = 'translate(-50%, -50%) scale(0.8)';
        setTimeout(() => {
            menu.style.display = 'none';
        }, 2000);
    }
    
    showGameUI() {
        document.getElementById('stats').style.opacity = '1';
        if (this.gameMode !== 'zen') {
            document.getElementById('powerUps').style.opacity = '1';
        }
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseMenu').style.display = 'flex';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseMenu').style.display = 'none';
        }
    }
    
    endGame(won) {
        this.gameState = 'ended';
        this.clearEyes();
        
        if (window.audioManager) {
            window.audioManager.stopAmbientDrone();
        }
        
        if (window.uiManager) {
            window.uiManager.showEndScreen(this, won);
        }
        
        // Save stats
        this.saveGameStats();
    }
    
    saveGameStats() {
        // Update local storage stats
        const totalEyes = parseInt(localStorage.getItem('watchersGrove_totalEyesClicked') || '0');
        localStorage.setItem('watchersGrove_totalEyesClicked', totalEyes + this.playerSequence.length);
        
        const totalGames = parseInt(localStorage.getItem('watchersGrove_totalGames') || '0');
        localStorage.setItem('watchersGrove_totalGames', totalGames + 1);
        
        // Save high score
        const scores = JSON.parse(localStorage.getItem('watchersGroveScores') || '[]');
        scores.push({
            score: this.score,
            level: this.level,
            mode: this.gameMode,
            date: new Date().toISOString()
        });
        scores.sort((a, b) => b.score - a.score);
        scores.splice(10); // Keep top 10
        localStorage.setItem('watchersGroveScores', JSON.stringify(scores));
    }
    
    // Canvas rendering
    drawBackground() {
        const time = Date.now() * 0.0001;
        
        // Dark gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width
        );
        
        gradient.addColorStop(0, 'rgba(26, 21, 16, 0.8)');
        gradient.addColorStop(0.5, 'rgba(15, 12, 9, 0.9)');
        gradient.addColorStop(1, '#050505');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw tree
        this.drawTree(time);
    }
    
    drawTree(time) {
        const centerX = this.canvas.width / 2;
        const baseY = this.canvas.height;
        
        // Main trunk
        this.ctx.fillStyle = '#0a0805';
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - 80, baseY);
        this.ctx.lineTo(centerX - 40, baseY - 300);
        this.ctx.lineTo(centerX + 40, baseY - 300);
        this.ctx.lineTo(centerX + 80, baseY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Branches
        for (let i = 0; i < 5; i++) {
            const y = baseY - 100 - i * 50;
            const angle = (i - 2) * 0.3 + Math.sin(time + i) * 0.1;
            this.drawBranch(centerX, y, angle, 80 + i * 10, 15 - i);
        }
    }
    
    drawBranch(x, y, angle, length, width) {
        if (length < 20) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        this.ctx.strokeStyle = '#0a0805';
        this.ctx.lineWidth = width;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();
        
        // Recursive branches
        if (Math.random() > 0.3) {
            this.drawBranch(endX, endY, angle - 0.5, length * 0.7, width * 0.7);
        }
        if (Math.random() > 0.3) {
            this.drawBranch(endX, endY, angle + 0.5, length * 0.7, width * 0.7);
        }
    }
    
    // Animation loop
    animate() {
        this.drawBackground();
        requestAnimationFrame(() => this.animate());
    }
}

// Export for use in main.js
window.GameEngine = GameEngine;