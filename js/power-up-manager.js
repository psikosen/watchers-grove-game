// The Watcher's Grove - Power-Up Manager
// Handles all power-up functionality

class PowerUpManager {
    constructor() {
        this.powerUps = {
            slowTime: { 
                active: false, 
                duration: 0, 
                cooldown: 0,
                cost: 20
            },
            revealOne: { 
                uses: 3 
            },
            skipLevel: { 
                uses: 1 
            },
            sanityBoost: { 
                uses: 2,
                healAmount: 30
            },
            shield: { 
                uses: 1, 
                active: false 
            },
            multiClick: { 
                uses: 2, 
                active: false 
            }
        };
        
        this.activeEffects = [];
    }
    
    usePowerUp(type) {
        if (!window.game || window.game.gameState !== 'playing') return;
        
        const powerUp = this.powerUps[type];
        if (!powerUp) return;
        
        switch(type) {
            case 'slowTime':
                this.useSlowTime();
                break;
            case 'revealOne':
                this.useRevealOne();
                break;
            case 'skipLevel':
                this.useSkipLevel();
                break;
            case 'sanityBoost':
                this.useSanityBoost();
                break;
            case 'shield':
                this.useShield();
                break;
            case 'multiClick':
                this.useMultiClick();
                break;
        }
        
        this.updateUI();
    }
    
    useSlowTime() {
        const powerUp = this.powerUps.slowTime;
        
        if (window.game.power >= powerUp.cost && powerUp.cooldown <= 0) {
            window.game.power -= powerUp.cost;
            powerUp.active = true;
            powerUp.duration = 5000;
            powerUp.cooldown = 10000;
            
            // Visual feedback
            document.getElementById('slowTime').classList.add('active');
            
            // Audio feedback
            if (window.audioManager) {
                window.audioManager.playPowerUpSound();
            }
            
            // Show notification
            if (window.uiManager) {
                window.uiManager.showNotification('Time slows down...');
            }
            
            // Set timeout to deactivate
            setTimeout(() => {
                powerUp.active = false;
                document.getElementById('slowTime').classList.remove('active');
            }, 5000);
        }
    }
    
    useRevealOne() {
        const powerUp = this.powerUps.revealOne;
        
        if (powerUp.uses > 0 && window.game.playerSequence.length < window.game.sequence.length) {
            powerUp.uses--;
            
            const nextIndex = window.game.playerSequence.length;
            const nextEyeIndex = window.game.sequence[nextIndex];
            const nextEye = window.game.eyes[nextEyeIndex];
            
            if (nextEye) {
                nextEye.classList.add('active');
                setTimeout(() => nextEye.classList.remove('active'), 1000);
                
                // Show hint arrow or effect
                this.createHintEffect(nextEye);
            }
            
            if (window.audioManager) {
                window.audioManager.playPowerUpSound();
            }
        }
    }
    
    useSkipLevel() {
        const powerUp = this.powerUps.skipLevel;
        
        if (powerUp.uses > 0) {
            powerUp.uses--;
            
            window.game.combo = 0;
            window.game.level++;
            window.game.score += 50 * window.game.level;
            window.game.updateStats();
            
            window.game.clearEyes();
            
            if (window.uiManager) {
                window.uiManager.showNarrative("The tree grants passage...");
            }
            
            if (window.audioManager) {
                window.audioManager.playSuccessSound();
            }
            
            setTimeout(() => window.game.initLevel(), 1500);
        }
    }
    
    useSanityBoost() {
        const powerUp = this.powerUps.sanityBoost;
        
        if (powerUp.uses > 0 && window.game.sanity < 100) {
            powerUp.uses--;
            
            window.game.sanity = Math.min(100, window.game.sanity + powerUp.healAmount);
            window.game.updateStats();
            
            if (window.uiManager) {
                window.uiManager.showNarrative("Your mind clears... temporarily.");
            }
            
            if (window.audioManager) {
                window.audioManager.playPowerUpSound();
            }
            
            this.createHealingEffect();
        }
    }
    
    useShield() {
        const powerUp = this.powerUps.shield;
        
        if (powerUp.uses > 0) {
            powerUp.uses--;
            powerUp.active = true;
            
            document.getElementById('shield').classList.add('active');
            
            if (window.uiManager) {
                window.uiManager.showNotification("Shield activated! Next mistake will be absorbed.");
            }
            
            if (window.audioManager) {
                window.audioManager.playPowerUpSound();
            }
        }
    }
    
    useMultiClick() {
        const powerUp = this.powerUps.multiClick;
        
        if (powerUp.uses > 0) {
            powerUp.uses--;
            powerUp.active = true;
            
            document.getElementById('multiClick').classList.add('active');
            
            if (window.uiManager) {
                window.uiManager.showNotification("Multi-Click activated for next click!");
            }
            
            if (window.audioManager) {
                window.audioManager.playPowerUpSound();
            }
            
            // Auto-deactivate after 5 seconds
            setTimeout(() => {
                powerUp.active = false;
                document.getElementById('multiClick').classList.remove('active');
            }, 5000);
        }
    }
    
    checkShield() {
        // Called when player makes a mistake
        if (this.powerUps.shield.active) {
            this.powerUps.shield.active = false;
            document.getElementById('shield').classList.remove('active');
            
            if (window.uiManager) {
                window.uiManager.showNotification('Shield absorbed the mistake!');
            }
            
            return true; // Mistake was blocked
        }
        return false; // Mistake not blocked
    }
    
    isSlowTimeActive() {
        return this.powerUps.slowTime.active;
    }
    
    isMultiClickActive() {
        return this.powerUps.multiClick.active;
    }
    
    createHintEffect(eye) {
        const rect = eye.getBoundingClientRect();
        const hint = document.createElement('div');
        hint.style.cssText = `
            position: absolute;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top - 30}px;
            transform: translateX(-50%);
            color: #8b7355;
            font-size: 24px;
            font-weight: bold;
            pointer-events: none;
            animation: bounce 1s infinite;
            z-index: 100;
        `;
        hint.textContent = '↓';
        document.body.appendChild(hint);
        
        setTimeout(() => hint.remove(), 1000);
    }
    
    createHealingEffect() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(139, 195, 74, 0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 15;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => overlay.style.opacity = '1', 10);
        setTimeout(() => overlay.style.opacity = '0', 500);
        setTimeout(() => overlay.remove(), 1000);
    }
    
    updateCooldowns() {
        // Called every frame to update cooldowns
        if (this.powerUps.slowTime.cooldown > 0) {
            this.powerUps.slowTime.cooldown -= 16; // ~60fps
        }
    }
    
    updateUI() {
        if (window.uiManager) {
            const uiState = {};
            
            Object.entries(this.powerUps).forEach(([id, powerUp]) => {
                uiState[id] = {
                    disabled: false,
                    active: powerUp.active || false,
                    uses: powerUp.uses
                };
                
                // Check if disabled
                if (id === 'slowTime' && (powerUp.cooldown > 0 || window.game.power < powerUp.cost)) {
                    uiState[id].disabled = true;
                } else if (powerUp.uses !== undefined && powerUp.uses <= 0) {
                    uiState[id].disabled = true;
                } else if (id === 'sanityBoost' && window.game.sanity >= 100) {
                    uiState[id].disabled = true;
                }
            });
            
            window.uiManager.updatePowerUpUI(uiState);
        }
    }
    
    reset() {
        // Reset power-ups for new game
        this.powerUps.slowTime.active = false;
        this.powerUps.slowTime.cooldown = 0;
        this.powerUps.revealOne.uses = 3;
        this.powerUps.skipLevel.uses = 1;
        this.powerUps.sanityBoost.uses = 2;
        this.powerUps.shield.uses = 1;
        this.powerUps.shield.active = false;
        this.powerUps.multiClick.uses = 2;
        this.powerUps.multiClick.active = false;
        
        this.updateUI();
    }
    
    addBonusUses(type, amount) {
        if (this.powerUps[type] && this.powerUps[type].uses !== undefined) {
            this.powerUps[type].uses += amount;
            this.updateUI();
        }
    }
}

// Export for use in main.js
window.PowerUpManager = PowerUpManager;