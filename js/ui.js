// UI management system
class UIManager {
    constructor() {
        this.notifications = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'Escape') {
                e.preventDefault();
                if (window.game) {
                    window.game.togglePause();
                }
            }
        });

        // Mobile touch events
        document.addEventListener('touchstart', (e) => {
            if (window.game && window.game.audioSystem) {
                window.game.audioSystem.resumeContext();
            }
        });
    }

    // Update game statistics display
    updateStats(stats) {
        const { sanity, insight, power, level, score } = stats;
        
        document.getElementById('sanityBar').style.width = `${Math.max(0, sanity)}%`;
        document.getElementById('insightBar').style.width = `${Math.min(100, insight)}%`;
        document.getElementById('powerBar').style.width = `${Math.max(0, power)}%`;
        document.getElementById('levelDisplay').textContent = level;
        document.getElementById('scoreDisplay').textContent = score.toLocaleString();
        
        // Update vision overlay based on sanity
        const overlay = document.querySelector('.vision-overlay');
        if (sanity < 50) {
            overlay.classList.add('madness-effect');
            overlay.style.opacity = (50 - sanity) / 50;
        } else {
            overlay.classList.remove('madness-effect');
            overlay.style.opacity = 0;
        }
    }

    // Update power-up button states
    updatePowerUps(powerUps, power) {
        const powerUpButtons = [
            { id: 'slowTime', condition: powerUps.slowTime.cooldown > 0 || power < 20 },
            { id: 'revealOne', condition: powerUps.revealOne.uses <= 0, text: `👁️ (${powerUps.revealOne.uses})` },
            { id: 'skipLevel', condition: powerUps.skipLevel.uses <= 0, text: `⏭️ (${powerUps.skipLevel.uses})` },
            { id: 'sanityBoost', condition: powerUps.sanityBoost.uses <= 0, text: `💊 (${powerUps.sanityBoost.uses})` },
            { id: 'shield', condition: powerUps.shield.uses <= 0, text: `🛡️ (${powerUps.shield.uses})` },
            { id: 'multiClick', condition: powerUps.multiClick.uses <= 0, text: `✨ (${powerUps.multiClick.uses})` }
        ];
        
        powerUpButtons.forEach(powerUp => {
            const btn = document.getElementById(powerUp.id);
            if (!btn) return;
            
            if (powerUp.text) {
                btn.textContent = powerUp.text;
            }
            
            if (powerUp.condition) {
                btn.classList.add('disabled');
            } else {
                btn.classList.remove('disabled');
            }
        });
    }

    // Update combo meter
    updateCombo(combo, maxCombo = 50) {
        const comboMeter = document.getElementById('comboMeter');
        const comboValue = document.getElementById('comboValue');
        const comboFill = document.getElementById('comboFill');
        
        if (combo > 0) {
            comboMeter.style.opacity = '1';
            comboValue.textContent = `${combo}x`;
            comboFill.style.width = `${Math.min(100, (combo / maxCombo) * 100)}%`;
        } else {
            comboMeter.style.opacity = '0';
        }
    }

    // Update streak display
    updateStreak(streak) {
        const streakDisplay = document.getElementById('streakDisplay');
        const streakValue = document.getElementById('streakValue');
        
        if (streak > 0) {
            streakDisplay.style.display = 'flex';
            streakValue.textContent = streak;
        } else {
            streakDisplay.style.display = 'none';
        }
    }

    // Show narrative text
    showNarrative(text, duration = 4000) {
        const narrative = document.getElementById('narrative');
        narrative.textContent = text;
        narrative.style.opacity = '1';
        
        setTimeout(() => {
            narrative.style.opacity = '0';
        }, duration);
    }

    // Show/hide UI elements
    showGameUI() {
        document.getElementById('stats').style.opacity = '1';
        document.getElementById('powerUps').style.opacity = '1';
    }

    hideGameUI() {
        document.getElementById('stats').style.opacity = '0';
        document.getElementById('powerUps').style.opacity = '0';
        document.getElementById('comboMeter').style.opacity = '0';
        document.getElementById('streakDisplay').style.display = 'none';
    }

    // Boss UI management
    showBossUI(bossName) {
        document.getElementById('bossHealthBar').style.display = 'block';
        document.getElementById('bossName').style.display = 'block';
        document.getElementById('bossName').textContent = bossName;
        
        // Show boss-specific power-ups
        document.getElementById('shield').style.display = 'block';
        document.getElementById('multiClick').style.display = 'block';
    }

    hideBossUI() {
        document.getElementById('bossHealthBar').style.display = 'none';
        document.getElementById('bossName').style.display = 'none';
        
        // Hide boss-specific power-ups
        document.getElementById('shield').style.display = 'none';
        document.getElementById('multiClick').style.display = 'none';
    }

    updateBossHealth(health, maxHealth) {
        const healthFill = document.getElementById('bossHealthFill');
        const percentage = (health / maxHealth) * 100;
        healthFill.style.width = `${Math.max(0, percentage)}%`;
    }

    // Notification system
    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notificationContainer');
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }

    // Achievement display
    showAchievementUnlocked(achievement) {
        const achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement';
        achievementDiv.innerHTML = `
            <h3>Achievement Unlocked!</h3>
            <p>${achievement}</p>
        `;
        
        document.body.appendChild(achievementDiv);
        
        setTimeout(() => achievementDiv.classList.add('show'), 100);
        setTimeout(() => achievementDiv.classList.remove('show'), 3000);
        setTimeout(() => achievementDiv.remove(), 3500);
    }

    // Menu management
    showMenu(menuId) {
        // Hide all menus first
        const menus = ['mainMenu', 'settingsMenu', 'leaderboard', 'achievementsMenu', 'pauseMenu', 'endScreen'];
        menus.forEach(id => {
            const menu = document.getElementById(id);
            if (menu) menu.style.display = 'none';
        });

        // Show requested menu
        const menu = document.getElementById(menuId);
        if (menu) {
            menu.style.display = menuId === 'pauseMenu' || menuId === 'endScreen' ? 'flex' : 'block';
            if (menuId === 'mainMenu') {
                setTimeout(() => {
                    menu.style.opacity = '1';
                    menu.style.transform = 'translate(-50%, -50%) scale(1)';
                }, 100);
            }
        }
    }

    hideAllMenus() {
        const menus = ['mainMenu', 'settingsMenu', 'leaderboard', 'achievementsMenu', 'pauseMenu', 'endScreen'];
        menus.forEach(id => {
            const menu = document.getElementById(id);
            if (menu) menu.style.display = 'none';
        });
    }

    // Settings menu management
    updateSettingsUI(settings) {
        document.getElementById('soundToggle').checked = settings.soundEnabled;
        document.getElementById('volumeSlider').value = settings.volume;
        document.getElementById('autoSaveToggle').checked = settings.autoSave;
    }

    // Leaderboard display
    displayLeaderboard(scores) {
        const content = document.getElementById('leaderboardContent');
        
        if (scores.length === 0) {
            content.innerHTML = '<p>No scores yet!</p>';
            return;
        }

        content.innerHTML = scores.map((score, index) => `
            <div class="leaderboard-entry">
                <span>#${index + 1} - ${score.score.toLocaleString()}</span>
                <span>Level ${score.level} (${score.mode})</span>
            </div>
        `).join('');
    }

    // Achievements display
    displayAchievements(unlockedAchievements, allAchievements) {
        const content = document.getElementById('achievementsContent');
        
        content.innerHTML = Object.entries(allAchievements).map(([id, description]) => `
            <div class="achievement-item ${unlockedAchievements.has(id) ? 'unlocked' : ''}">
                <h4>${id.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h4>
                <p>${description}</p>
            </div>
        `).join('');
    }

    // End game screen
    showEndScreen(data) {
        const { won, score, level, maxCombo, totalEyesClicked, achievements, mode, sanity } = data;
        
        const endTitle = document.getElementById('endTitle');
        const endMessage = document.getElementById('endMessage');
        const finalScore = document.getElementById('finalScore');
        const endStats = document.getElementById('endStats');
        
        if (won) {
            if (mode === 'boss') {
                endTitle.textContent = "All Bosses Defeated!";
                endMessage.textContent = "You have conquered the ancient guardians of the grove!";
            } else {
                endTitle.textContent = "The Grove Accepts You";
                endMessage.textContent = "You have mastered the ancient patterns. The tree's wisdom is yours.";
            }
        } else if (sanity <= 0) {
            endTitle.textContent = "Madness Takes Hold";
            endMessage.textContent = "The countless eyes have shattered your mind...";
        } else {
            endTitle.textContent = "The Grove Claims You";
            endMessage.textContent = "Your journey ends, but the eyes will remember...";
        }
        
        finalScore.textContent = `Final Score: ${score.toLocaleString()}`;
        
        endStats.innerHTML = `
            <div>Level Reached: ${level}</div>
            <div>Max Combo: ${maxCombo}x</div>
            <div>Total Eyes Clicked: ${totalEyesClicked}</div>
            <div>Achievements: ${achievements.size}/${Object.keys(GameData.achievements).length}</div>
        `;
        
        this.showMenu('endScreen');
    }

    // Tutorial display
    showTutorial() {
        document.getElementById('tutorialOverlay').style.display = 'flex';
    }

    hideTutorial() {
        document.getElementById('tutorialOverlay').style.display = 'none';
    }

    // Eye creation and management
    createEye(x, y, index, isBoss = false) {
        const eye = document.createElement('div');
        eye.className = isBoss ? 'eye boss' : 'eye';
        eye.style.left = (x - 30) + 'px';
        eye.style.top = (y - 30) + 'px';
        eye.dataset.index = index;
        
        document.body.appendChild(eye);
        
        // Add entrance animation
        eye.style.opacity = '0';
        eye.style.transform = 'scale(0)';
        
        setTimeout(() => {
            eye.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
            eye.style.opacity = '1';
            eye.style.transform = 'scale(1)';
        }, index * 100);
        
        return eye;
    }

    clearEyes(eyes) {
        eyes.forEach((eye, index) => {
            setTimeout(() => {
                eye.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                eye.style.opacity = '0';
                eye.style.transform = 'scale(0) rotate(180deg)';
                setTimeout(() => eye.remove(), 500);
            }, index * 20);
        });
    }

    // Utility methods
    getCanvasCenter() {
        const canvas = document.getElementById('gameCanvas');
        return {
            x: canvas.width / 2,
            y: canvas.height / 2
        };
    }

    resizeCanvas() {
        const canvas = document.getElementById('gameCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}