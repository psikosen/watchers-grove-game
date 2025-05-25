// The Watcher's Grove - UI Manager
// Handles all user interface elements and interactions

class UIManager {
    constructor() {
        this.narrativeQueue = [];
        this.currentNarrative = null;
        
        this.bindMenuEvents();
        this.bindPowerUpEvents();
        this.bindSeasonEvents();
    }
    
    bindMenuEvents() {
        // Main menu buttons
        document.getElementById('storyModeBtn').addEventListener('click', () => {
            window.game.startGame('story');
        });
        
        document.getElementById('survivalModeBtn').addEventListener('click', () => {
            window.game.startGame('survival');
        });
        
        document.getElementById('zenModeBtn').addEventListener('click', () => {
            window.game.startGame('zen');
        });
        
        document.getElementById('bossModeBtn').addEventListener('click', () => {
            window.bossManager.startBossMode();
        });
        
        document.getElementById('practiceModeBtn').addEventListener('click', () => {
            this.showNotification('Practice Mode coming soon!');
        });
        
        document.getElementById('levelEditorBtn').addEventListener('click', () => {
            this.showNotification('Level Editor coming soon!');
        });
        
        document.getElementById('customLevelsBtn').addEventListener('click', () => {
            this.showNotification('Custom Levels coming soon!');
        });
        
        document.getElementById('achievementsBtn').addEventListener('click', () => {
            window.achievementManager.showAchievements();
        });
        
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showNotification('Settings coming soon!');
        });
        
        // End screen buttons
        document.getElementById('restartButton').addEventListener('click', () => {
            this.hideEndScreen();
            window.game.startGame(window.game.gameMode);
        });
        
        document.getElementById('menuButton').addEventListener('click', () => {
            this.returnToMenu();
        });
        
        // Pause menu
        document.getElementById('resumeBtn').addEventListener('click', () => {
            window.game.togglePause();
        });
        
        document.getElementById('quitBtn').addEventListener('click', () => {
            window.game.togglePause();
            this.returnToMenu();
        });
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => {
            const enabled = window.audioManager.toggleSound();
            document.getElementById('soundToggle').textContent = enabled ? '🔊' : '🔇';
        });
    }
    
    bindPowerUpEvents() {
        document.getElementById('slowTime').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('slowTime');
        });
        
        document.getElementById('revealOne').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('revealOne');
        });
        
        document.getElementById('skipLevel').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('skipLevel');
        });
        
        document.getElementById('sanityBoost').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('sanityBoost');
        });
        
        document.getElementById('shield').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('shield');
        });
        
        document.getElementById('multiClick').addEventListener('click', () => {
            window.powerUpManager.usePowerUp('multiClick');
        });
    }
    
    bindSeasonEvents() {
        document.querySelectorAll('.season-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const season = e.target.dataset.season;
                window.seasonManager.changeSeason(season);
                
                // Update active state
                document.querySelectorAll('.season-button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
    
    showNarrative(text, duration = 4000) {
        const narrative = document.getElementById('narrative');
        narrative.textContent = text;
        narrative.style.opacity = '1';
        
        if (this.currentNarrative) {
            clearTimeout(this.currentNarrative);
        }
        
        this.currentNarrative = setTimeout(() => {
            narrative.style.opacity = '0';
            this.currentNarrative = null;
        }, duration);
    }
    
    updateStats(gameEngine) {
        // Update stat bars
        document.getElementById('sanityBar').style.width = `${Math.max(0, gameEngine.sanity)}%`;
        document.getElementById('insightBar').style.width = `${Math.min(100, gameEngine.insight)}%`;
        document.getElementById('powerBar').style.width = `${Math.max(0, gameEngine.power)}%`;
        
        // Update text displays
        document.getElementById('levelDisplay').textContent = gameEngine.level;
        document.getElementById('scoreDisplay').textContent = gameEngine.score.toLocaleString();
        
        // Show/hide streak
        const streakDisplay = document.getElementById('streakDisplay');
        if (streakDisplay) {
            if (gameEngine.streak > 0) {
                streakDisplay.style.display = 'flex';
                document.getElementById('streakValue').textContent = gameEngine.streak;
            } else {
                streakDisplay.style.display = 'none';
            }
        }
        
        // Update vision overlay based on sanity
        const overlay = document.querySelector('.vision-overlay');
        if (gameEngine.sanity < 50) {
            overlay.classList.add('madness-effect');
            overlay.style.opacity = (50 - gameEngine.sanity) / 50;
        } else {
            overlay.classList.remove('madness-effect');
            overlay.style.opacity = 0;
        }
        
        // Update combo meter if visible
        if (gameEngine.combo > 1) {
            this.updateComboMeter(gameEngine.combo);
        }
    }
    
    updateComboMeter(combo) {
        const comboMeter = document.getElementById('comboMeter');
        if (!comboMeter) return;
        
        comboMeter.style.opacity = '1';
        document.getElementById('comboValue').textContent = combo;
        document.getElementById('comboFill').style.width = `${Math.min(100, combo * 5)}%`;
        
        // Hide after a delay
        clearTimeout(this.comboTimeout);
        this.comboTimeout = setTimeout(() => {
            comboMeter.style.opacity = '0';
        }, 3000);
    }
    
    showFloatingText(text, x, y) {
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text';
        floatingText.textContent = text;
        floatingText.style.left = x + 'px';
        floatingText.style.top = y + 'px';
        
        document.body.appendChild(floatingText);
        
        setTimeout(() => floatingText.remove(), 2000);
    }
    
    showNotification(message, duration = 3000) {
        const notification = document.createElement('div');
        notification.className = 'achievement show';
        notification.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, duration);
    }
    
    showEndScreen(gameEngine, won) {
        const endScreen = document.getElementById('endScreen');
        const endTitle = document.getElementById('endTitle');
        const endMessage = document.getElementById('endMessage');
        const finalScore = document.getElementById('finalScore');
        
        if (won) {
            endTitle.textContent = "The Grove Accepts You";
            endMessage.textContent = "You have mastered the ancient patterns!";
        } else if (gameEngine.sanity <= 0) {
            endTitle.textContent = "Madness Takes Hold";
            endMessage.textContent = "The countless eyes have shattered your mind...";
        } else {
            endTitle.textContent = "The Grove Claims You";
            endMessage.textContent = "Your journey ends, but the eyes remember...";
        }
        
        finalScore.textContent = `Final Score: ${gameEngine.score.toLocaleString()}`;
        
        // Add detailed stats
        const endStats = document.getElementById('endStats');
        if (endStats) {
            endStats.innerHTML = `
                <div>Level Reached: ${gameEngine.level}</div>
                <div>Max Combo: ${gameEngine.maxCombo}x</div>
                <div>Achievements: ${window.achievementManager?.getUnlockedCount() || 0}</div>
            `;
        }
        
        endScreen.style.display = 'flex';
    }
    
    hideEndScreen() {
        document.getElementById('endScreen').style.display = 'none';
    }
    
    returnToMenu() {
        // Hide all game UI
        document.getElementById('endScreen').style.display = 'none';
        document.getElementById('pauseMenu').style.display = 'none';
        document.getElementById('stats').style.opacity = '0';
        document.getElementById('powerUps').style.opacity = '0';
        document.getElementById('comboMeter').style.opacity = '0';
        
        // Show menu
        const menu = document.getElementById('mainMenu');
        menu.style.display = 'block';
        
        setTimeout(() => {
            menu.style.opacity = '1';
            menu.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
        
        // Reset game state
        if (window.game) {
            window.game.gameState = 'menu';
            window.game.clearEyes();
        }
        
        if (window.audioManager) {
            window.audioManager.stopAmbientDrone();
        }
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 1000);
        }
    }
    
    updatePowerUpUI(powerUps) {
        // This would be called by PowerUpManager to update button states
        Object.entries(powerUps).forEach(([id, powerUp]) => {
            const button = document.getElementById(id);
            if (!button) return;
            
            if (powerUp.disabled) {
                button.classList.add('disabled');
            } else {
                button.classList.remove('disabled');
            }
            
            if (powerUp.active) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
            
            // Update use count if applicable
            if (powerUp.uses !== undefined) {
                const icon = button.textContent.split(' ')[0];
                button.textContent = `${icon} (${powerUp.uses})`;
            }
        });
    }
}

// Export for use in main.js
window.UIManager = UIManager;