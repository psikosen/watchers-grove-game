// Main game class
class WatchersGroveUltimate {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize systems
        this.audioSystem = new AudioSystem();
        this.effectsSystem = new EffectsSystem(this.canvas, this.ctx);
        this.uiManager = new UIManager();
        
        // Game state
        this.gameState = 'menu';
        this.gameMode = 'story';
        this.isPaused = false;
        this.difficulty = 'normal';
        this.currentSeason = 'spring';
        
        // Game stats
        this.level = 1;
        this.score = 0;
        this.sanity = 100;
        this.insight = 0;
        this.power = 50;
        this.combo = 0;
        this.maxCombo = 0;
        this.streak = 0;
        this.totalEyesClicked = 0;
        
        // Game data
        this.sequence = [];
        this.playerSequence = [];
        this.eyes = [];
        this.achievements = new Set();
        
        // Boss mode
        this.bossMode = false;
        this.currentBoss = null;
        this.bossHealth = 100;
        this.bossMaxHealth = 100;
        
        // Power-ups
        this.powerUps = {
            slowTime: { active: false, duration: 0, cooldown: 0 },
            revealOne: { uses: 3 },
            skipLevel: { uses: 1 },
            sanityBoost: { uses: 2 },
            shield: { uses: 1, active: false },
            multiClick: { uses: 2, active: false }
        };
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.loadProgress();
        this.setupEventListeners();
        this.animate();
        
        // Start weather effects for main menu
        this.effectsSystem.startWeatherEffect(GameData.seasonThemes[this.currentSeason].particles);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Eye click handler
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('eye')) {
                this.handleEyeClick(e.target);
            }
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Game mode management
    startGame(mode) {
        this.gameMode = mode;
        this.gameState = 'playing';
        this.bossMode = mode === 'boss';
        
        // Reset game state
        this.level = 1;
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        this.sequence = [];
        this.playerSequence = [];
        
        // Mode-specific initialization
        if (mode === 'zen') {
            this.sanity = 100;
            this.power = 100;
        } else if (mode === 'survival') {
            this.sanity = 75;
            this.power = 25;
        } else {
            this.sanity = 100;
            this.power = 50;
        }
        
        this.insight = 0;
        
        // Reset power-ups
        this.powerUps = {
            slowTime: { active: false, duration: 0, cooldown: 0 },
            revealOne: { uses: 3 },
            skipLevel: { uses: 1 },
            sanityBoost: { uses: 2 },
            shield: { uses: 1, active: false },
            multiClick: { uses: 2, active: false }
        };
        
        // Hide menu and show game UI
        this.uiManager.hideAllMenus();
        this.uiManager.showGameUI();
        
        if (this.bossMode) {
            this.initBossLevel();
        } else {
            this.initLevel();
        }
        
        // Start ambient audio
        this.audioSystem.playAmbientDrone();
        
        // Clear weather effects
        this.effectsSystem.clearWeatherEffects();
        
        // Show initial narrative
        const narratives = GameData.narratives[mode] || GameData.narratives.story;
        this.uiManager.showNarrative(narratives[0]);
    }

    initLevel() {
        this.playerSequence = [];
        
        // Generate eye positions
        const eyeCount = Math.min(3 + this.level, 12);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
        
        // Clear existing eyes
        this.uiManager.clearEyes(this.eyes);
        this.eyes = [];
        
        // Create new eyes
        const positions = GameData.eyePlacementPatterns.circle(eyeCount, centerX, centerY, radius);
        
        positions.forEach((pos, index) => {
            const eye = this.uiManager.createEye(pos.x, pos.y, index, this.bossMode);
            this.eyes.push(eye);
        });
        
        // Generate sequence
        this.generateSequence();
        
        // Update UI
        this.updateStats();
        
        // Play sequence after eyes are created
        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.playSequence();
            }
        }, eyeCount * 100 + 500);
    }

    initBossLevel() {
        const bossId = Math.min(Math.ceil(this.level / 5), 3);
        this.currentBoss = GameData.bosses[bossId];
        this.bossHealth = this.currentBoss.health;
        this.bossMaxHealth = this.currentBoss.health;
        
        this.uiManager.showBossUI(this.currentBoss.name);
        this.uiManager.updateBossHealth(this.bossHealth, this.bossMaxHealth);
        
        this.audioSystem.playBossSound();
        this.initLevel();
    }

    generateSequence() {
        const difficultyMultiplier = GameData.difficultySettings[this.difficulty];
        
        if (this.bossMode && this.currentBoss) {
            // Use boss pattern
            const patternIndex = Math.min(this.level - 1, this.currentBoss.patterns.length - 1);
            this.sequence = [...this.currentBoss.patterns[patternIndex]];
        } else {
            // Generate random sequence
            const baseLength = this.gameMode === 'zen' ? 3 : 
                             this.gameMode === 'survival' ? Math.min(2 + Math.floor(this.level / 2), 8) :
                             Math.min(2 + this.level, 6);
            
            this.sequence = [];
            for (let i = 0; i < baseLength; i++) {
                this.sequence.push(Math.floor(Math.random() * this.eyes.length));
            }
        }
    }

    playSequence() {
        if (this.isPaused) return;
        
        let index = 0;
        const timeMultiplier = this.powerUps.slowTime.active ? 2 : 1;
        const difficultyMultiplier = GameData.difficultySettings[this.difficulty];
        const baseDelay = 600 * difficultyMultiplier.timeBonus * timeMultiplier;
        
        const showNext = () => {
            if (index < this.sequence.length && !this.isPaused && this.gameState === 'playing') {
                const eyeIndex = this.sequence[index];
                const eye = this.eyes[eyeIndex];
                
                if (eye) {
                    eye.classList.add('active');
                    this.audioSystem.playSequenceNote(eyeIndex, this.eyes.length);
                    
                    setTimeout(() => {
                        if (eye) eye.classList.remove('active');
                        index++;
                        if (index < this.sequence.length) {
                            setTimeout(showNext, 300 * timeMultiplier);
                        }
                    }, baseDelay);
                }
            }
        };
        
        showNext();
    }

    handleEyeClick(eyeElement) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        // Resume audio context on first interaction
        this.audioSystem.resumeContext();
        
        const clickedIndex = parseInt(eyeElement.dataset.index);
        const expectedIndex = this.sequence[this.playerSequence.length];
        
        if (clickedIndex === expectedIndex) {
            this.handleCorrectClick(eyeElement, clickedIndex);
        } else {
            this.handleIncorrectClick(eyeElement);
        }
    }

    handleCorrectClick(eyeElement, index) {
        this.playerSequence.push(index);
        this.totalEyesClicked++;
        
        // Visual feedback
        eyeElement.classList.add('active');
        setTimeout(() => eyeElement.classList.remove('active'), 300);
        
        // Audio feedback
        this.audioSystem.playSuccessSound();
        
        // Effects
        const rect = eyeElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.effectsSystem.createParticleExplosion(centerX, centerY, 8, 'success');
        this.effectsSystem.showFloatingText('+10', centerX, centerY - 30);
        
        // Update game state
        this.combo++;
        this.streak++;
        this.maxCombo = Math.max(this.maxCombo, this.combo);
        this.score += 10 * this.combo * (this.level * 0.5 + 1);
        this.insight += 2;
        this.power += 1;
        
        // Multi-click power-up
        if (this.powerUps.multiClick.active) {
            this.score += 5 * this.combo;
            this.effectsSystem.showFloatingText('Multi!', centerX + 20, centerY - 50, '#ff8c00');
        }
        
        // Check if sequence complete
        if (this.playerSequence.length === this.sequence.length) {
            this.handleLevelComplete();
        }
        
        this.updateStats();
        this.checkAchievements();
    }

    handleIncorrectClick(eyeElement) {
        // Check shield power-up
        if (this.powerUps.shield.active) {
            this.powerUps.shield.active = false;
            document.getElementById('shield').classList.remove('active');
            this.uiManager.showNotification('Shield absorbed the mistake!', 'success');
            return;
        }
        
        // Visual feedback
        eyeElement.style.filter = 'hue-rotate(180deg)';
        setTimeout(() => eyeElement.style.filter = '', 500);
        
        // Audio feedback
        this.audioSystem.playErrorSound();
        
        // Effects
        const rect = eyeElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        this.effectsSystem.createParticleExplosion(centerX, centerY, 12, 'error');
        this.effectsSystem.showFloatingText('Miss!', centerX, centerY - 30, '#ff4444');
        this.effectsSystem.shakeScreen(8, 300);
        
        // Update game state
        const difficultyMultiplier = GameData.difficultySettings[this.difficulty];
        
        this.combo = 0;
        this.streak = 0;
        this.sanity -= 15 * difficultyMultiplier.sanityLoss;
        this.power -= 5;
        
        // Boss mode damage
        if (this.bossMode) {
            this.bossHealth -= 10;
            this.uiManager.updateBossHealth(this.bossHealth, this.bossMaxHealth);
        }
        
        // Reset player sequence
        this.playerSequence = [];
        
        // Check game over
        if (this.sanity <= 0) {
            this.endGame(false);
            return;
        }
        
        this.updateStats();
        
        // Replay sequence after mistake
        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.playSequence();
            }
        }, 1000);
    }

    handleLevelComplete() {
        this.level++;
        this.score += 50 * this.level;
        this.power += 10;
        this.sanity = Math.min(100, this.sanity + 5);
        
        // Boss mode specific
        if (this.bossMode) {
            this.bossHealth -= 25;
            this.uiManager.updateBossHealth(this.bossHealth, this.bossMaxHealth);
            
            if (this.bossHealth <= 0) {
                this.handleBossDefeated();
                return;
            }
        }
        
        this.audioSystem.playLevelUpSound();
        this.updateStats();
        
        // Show narrative
        const narratives = GameData.narratives[this.gameMode] || GameData.narratives.story;
        const narrativeIndex = Math.min(this.level - 1, narratives.length - 1);
        this.uiManager.showNarrative(narratives[narrativeIndex]);
        
        // Check win condition for story mode
        if (this.gameMode === 'story' && this.level > 20) {
            this.endGame(true);
            return;
        }
        
        // Continue to next level
        setTimeout(() => {
            if (this.gameState === 'playing') {
                if (this.bossMode) {
                    this.initBossLevel();
                } else {
                    this.initLevel();
                }
            }
        }, 2000);
    }

    handleBossDefeated() {
        this.score += 500;
        this.uiManager.showNotification(`${this.currentBoss.name} defeated!`, 'success', 4000);
        this.unlockAchievement('bossSlayer');
        
        // Check if all bosses defeated
        if (this.level >= 15) { // 3 bosses * 5 levels each
            this.unlockAchievement('allBosses');
            this.endGame(true);
        } else {
            // Continue to next boss
            setTimeout(() => {
                if (this.gameState === 'playing') {
                    this.initBossLevel();
                }
            }, 3000);
        }
    }

    // Power-up usage
    usePowerUp(type) {
        if (this.gameState !== 'playing' || this.isPaused) return;
        
        switch(type) {
            case 'slowTime':
                if (this.power >= 20 && this.powerUps.slowTime.cooldown <= 0) {
                    this.power -= 20;
                    this.powerUps.slowTime.active = true;
                    this.powerUps.slowTime.duration = 5000;
                    this.powerUps.slowTime.cooldown = 10000;
                    document.getElementById('slowTime').classList.add('active');
                    this.audioSystem.playSound(200, 0.5, 'triangle');
                    
                    setTimeout(() => {
                        this.powerUps.slowTime.active = false;
                        document.getElementById('slowTime').classList.remove('active');
                    }, 5000);
                }
                break;
                
            case 'revealOne':
                if (this.powerUps.revealOne.uses > 0 && this.playerSequence.length < this.sequence.length) {
                    this.powerUps.revealOne.uses--;
                    const nextIndex = this.playerSequence.length;
                    const nextEye = this.eyes[this.sequence[nextIndex]];
                    if (nextEye) {
                        nextEye.classList.add('active');
                        setTimeout(() => nextEye.classList.remove('active'), 1000);
                    }
                    this.audioSystem.playSound(600, 0.3);
                }
                break;
                
            case 'skipLevel':
                if (this.powerUps.skipLevel.uses > 0) {
                    this.powerUps.skipLevel.uses--;
                    this.combo = 0;
                    this.level++;
                    this.score += 50 * this.level;
                    this.uiManager.clearEyes(this.eyes);
                    this.uiManager.showNarrative("The tree grants passage...");
                    this.audioSystem.playSound(400, 0.5);
                    setTimeout(() => this.initLevel(), 1500);
                }
                break;
                
            case 'sanityBoost':
                if (this.powerUps.sanityBoost.uses > 0 && this.sanity < 100) {
                    this.powerUps.sanityBoost.uses--;
                    this.sanity = Math.min(100, this.sanity + 30);
                    this.uiManager.showNarrative("Your mind clears... temporarily.");
                    this.audioSystem.playSound(800, 0.5, 'sine');
                    this.effectsSystem.createHealingEffect();
                }
                break;
                
            case 'shield':
                if (this.powerUps.shield.uses > 0) {
                    this.powerUps.shield.uses--;
                    this.powerUps.shield.active = true;
                    document.getElementById('shield').classList.add('active');
                    this.audioSystem.playSound(400, 0.5, 'square');
                    this.uiManager.showNotification("Shield activated! Next mistake will be absorbed.");
                }
                break;
                
            case 'multiClick':
                if (this.powerUps.multiClick.uses > 0) {
                    this.powerUps.multiClick.uses--;
                    this.powerUps.multiClick.active = true;
                    document.getElementById('multiClick').classList.add('active');
                    this.audioSystem.playSound(700, 0.3, 'sine');
                    this.uiManager.showNotification("Multi-Click activated for next click!");
                    
                    setTimeout(() => {
                        this.powerUps.multiClick.active = false;
                        document.getElementById('multiClick').classList.remove('active');
                    }, 5000);
                }
                break;
        }
        
        this.updateStats();
    }

    // Game state management
    updateStats() {
        const stats = {
            sanity: this.sanity,
            insight: this.insight,
            power: this.power,
            level: this.level,
            score: this.score
        };
        
        this.uiManager.updateStats(stats);
        this.uiManager.updatePowerUps(this.powerUps, this.power);
        this.uiManager.updateCombo(this.combo);
        this.uiManager.updateStreak(this.streak);
    }

    togglePause() {
        if (this.gameState !== 'playing') return;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.uiManager.showMenu('pauseMenu');
        } else {
            this.uiManager.hideAllMenus();
        }
    }

    endGame(won) {
        this.gameState = 'ended';
        this.uiManager.clearEyes(this.eyes);
        this.audioSystem.stopAmbientDrone();
        this.uiManager.hideBossUI();
        
        // Save high score
        this.saveHighScore();
        this.saveProgress();
        
        const endData = {
            won,
            score: this.score,
            level: this.level,
            maxCombo: this.maxCombo,
            totalEyesClicked: this.totalEyesClicked,
            achievements: this.achievements,
            mode: this.gameMode,
            sanity: this.sanity
        };
        
        this.uiManager.showEndScreen(endData);
    }

    restartGame() {
        // Reset everything
        this.level = 1;
        this.score = 0;
        this.combo = 0;
        this.streak = 0;
        this.sequence = [];
        this.playerSequence = [];
        
        // Reset power-ups
        this.powerUps = {
            slowTime: { active: false, duration: 0, cooldown: 0 },
            revealOne: { uses: 3 },
            skipLevel: { uses: 1 },
            sanityBoost: { uses: 2 },
            shield: { uses: 1, active: false },
            multiClick: { uses: 2, active: false }
        };
        
        this.uiManager.hideAllMenus();
        this.uiManager.updateCombo(0);
        this.startGame(this.gameMode);
    }

    returnToMenu() {
        this.gameState = 'menu';
        this.uiManager.clearEyes(this.eyes);
        this.audioSystem.stopAmbientDrone();
        this.effectsSystem.clearWeatherEffects();
        
        // Reset UI
        this.uiManager.hideAllMenus();
        this.uiManager.hideGameUI();
        this.uiManager.hideBossUI();
        this.uiManager.showMenu('mainMenu');
        
        // Restart weather effects
        this.effectsSystem.startWeatherEffect(GameData.seasonThemes[this.currentSeason].particles);
    }

    // Settings management
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.saveProgress();
    }

    setSeason(season) {
        this.currentSeason = season;
        this.effectsSystem.clearWeatherEffects();
        if (this.gameState === 'menu') {
            this.effectsSystem.startWeatherEffect(GameData.seasonThemes[season].particles);
        }
        this.saveProgress();
    }

    toggleSound() {
        const enabled = this.audioSystem.toggleSound();
        this.saveProgress();
        return enabled;
    }

    setVolume(volume) {
        this.audioSystem.setVolume(volume);
        this.saveProgress();
    }

    // Menu management
    showSettingsMenu() {
        this.uiManager.showMenu('settingsMenu');
        this.uiManager.updateSettingsUI({
            soundEnabled: this.audioSystem.soundEnabled,
            volume: this.audioSystem.volume * 100,
            autoSave: true
        });
    }

    hideSettingsMenu() {
        this.uiManager.showMenu('mainMenu');
    }

    showLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('watchersGroveScores') || '[]');
        this.uiManager.displayLeaderboard(scores);
        this.uiManager.showMenu('leaderboard');
    }

    hideLeaderboard() {
        this.uiManager.showMenu('mainMenu');
    }

    showAchievements() {
        this.uiManager.displayAchievements(this.achievements, GameData.achievements);
        this.uiManager.showMenu('achievementsMenu');
    }

    hideAchievements() {
        this.uiManager.showMenu('mainMenu');
    }

    // Achievement system
    unlockAchievement(id) {
        if (this.achievements.has(id)) return;
        
        this.achievements.add(id);
        const achievement = GameData.achievements[id];
        
        this.uiManager.showAchievementUnlocked(achievement);
        this.audioSystem.playSound(1000, 0.5, 'sine');
        
        // Bonus score
        this.score += 500;
        this.updateStats();
        this.saveProgress();
    }

    checkAchievements() {
        // First level
        if (this.level >= 2 && !this.achievements.has('firstLevel')) {
            this.unlockAchievement('firstLevel');
        }
        
        // Combo achievements
        if (this.combo >= 10 && !this.achievements.has('combo10')) {
            this.unlockAchievement('combo10');
        }
        
        // Survival achievement
        if (this.gameMode === 'survival' && this.level >= 20 && !this.achievements.has('survivor')) {
            this.unlockAchievement('survivor');
        }
        
        // Sanity edge achievement
        if (this.sanity < 10 && !this.achievements.has('sanityEdge')) {
            this.unlockAchievement('sanityEdge');
        }
        
        // Streak achievement
        if (this.streak >= 50 && !this.achievements.has('streakMaster')) {
            this.unlockAchievement('streakMaster');
        }
        
        // Eye collector achievement
        if (this.totalEyesClicked >= 1000 && !this.achievements.has('eyeCollector')) {
            this.unlockAchievement('eyeCollector');
        }
    }

    // Update power-up cooldowns and effects
    updatePowerUpCooldowns() {
        // Update slow time cooldown
        if (this.powerUps.slowTime.cooldown > 0) {
            this.powerUps.slowTime.cooldown -= 16; // ~60fps
            if (this.powerUps.slowTime.cooldown <= 0) {
                this.updateStats();
            }
        }
        
        // Regenerate power slowly
        if (this.gameState === 'playing' && this.power < 100) {
            this.power += 0.05;
            this.updateStats();
        }
        
        // Drain power in survival mode
        if (this.gameMode === 'survival' && this.gameState === 'playing') {
            this.power -= 0.02;
            this.updateStats();
        }
    }

    // Save and load progress
    saveProgress() {
        const data = {
            achievements: Array.from(this.achievements),
            difficulty: this.difficulty,
            season: this.currentSeason,
            soundEnabled: this.audioSystem.soundEnabled,
            volume: this.audioSystem.volume,
            totalEyesClicked: this.totalEyesClicked
        };
        
        localStorage.setItem('watchersGroveProgress', JSON.stringify(data));
    }

    loadProgress() {
        const saved = localStorage.getItem('watchersGroveProgress');
        if (saved) {
            try {
                const data = JSON.parse(saved);
                this.achievements = new Set(data.achievements || []);
                this.difficulty = data.difficulty || 'normal';
                this.currentSeason = data.season || 'spring';
                this.audioSystem.soundEnabled = data.soundEnabled !== false;
                this.audioSystem.setVolume(data.volume * 100 || 50);
                this.totalEyesClicked = data.totalEyesClicked || 0;
                
                // Update UI elements
                document.getElementById('difficultySelect').value = this.difficulty;
                document.getElementById('seasonSelect').value = this.currentSeason;
            } catch (e) {
                console.warn('Error loading progress:', e);
            }
        }
    }

    saveHighScore() {
        const highScores = JSON.parse(localStorage.getItem('watchersGroveScores') || '[]');
        
        highScores.push({
            score: this.score,
            level: this.level,
            mode: this.gameMode,
            difficulty: this.difficulty,
            season: this.currentSeason,
            date: new Date().toISOString()
        });
        
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(10); // Keep top 10
        
        localStorage.setItem('watchersGroveScores', JSON.stringify(highScores));
    }

    // Animation loop
    animate() {
        const time = Date.now() * 0.0001;
        
        this.effectsSystem.drawBackground(time, this.sanity, this.currentSeason);
        this.updatePowerUpCooldowns();
        
        requestAnimationFrame(() => this.animate());
    }
}