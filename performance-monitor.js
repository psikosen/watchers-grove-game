// The Watcher's Grove - Performance Monitor & Debug Tools
// Add this script to the game for performance monitoring and debugging

class PerformanceMonitor {
    constructor() {
        this.fps = 0;
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.memoryUsage = 0;
        this.eyeCount = 0;
        this.particleCount = 0;
        this.isVisible = false;
        
        this.createMonitorUI();
        this.startMonitoring();
        this.bindDebugKeys();
    }
    
    createMonitorUI() {
        // Create monitor container
        this.container = document.createElement('div');
        this.container.id = 'performanceMonitor';
        this.container.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid #8b7355;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            color: #8b7355;
            z-index: 10000;
            min-width: 200px;
            display: none;
            border-radius: 5px;
        `;
        
        document.body.appendChild(this.container);
    }
    
    startMonitoring() {
        // FPS counter
        const updateFPS = () => {
            const currentTime = performance.now();
            this.frameCount++;
            
            if (currentTime >= this.lastTime + 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;
                this.updateDisplay();
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
        
        // Memory monitoring (if available)
        if (performance.memory) {
            setInterval(() => {
                this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
            }, 1000);
        }
        
        // Game object monitoring
        setInterval(() => {
            this.eyeCount = document.querySelectorAll('.eye').length;
            this.particleCount = document.querySelectorAll('.particle').length;
        }, 500);
    }
    
    updateDisplay() {
        if (!this.isVisible) return;
        
        const game = window.game;
        const gameInfo = game ? `
            <div>Game State: ${game.gameState}</div>
            <div>Mode: ${game.gameMode}</div>
            <div>Level: ${game.level}</div>
            <div>Score: ${game.score}</div>
            <div>Sanity: ${Math.round(game.sanity)}%</div>
            <div>Combo: ${game.combo}x</div>
            <div>Sequence: ${game.sequence.length} eyes</div>
        ` : '<div>Game not initialized</div>';
        
        this.container.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">Performance Monitor</div>
            <div>FPS: ${this.fps}</div>
            <div>Memory: ${this.memoryUsage || 'N/A'} MB</div>
            <div>Eyes: ${this.eyeCount}</div>
            <div>Particles: ${this.particleCount}</div>
            <div style="margin-top: 10px; border-top: 1px solid #444; padding-top: 5px;">
                ${gameInfo}
            </div>
            <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
                Press F2 to toggle debug mode<br>
                Press F3 for console commands
            </div>
        `;
    }
    
    bindDebugKeys() {
        document.addEventListener('keydown', (e) => {
            // F1 - Toggle monitor
            if (e.key === 'F1') {
                e.preventDefault();
                this.toggle();
            }
            
            // F2 - Debug mode
            if (e.key === 'F2') {
                e.preventDefault();
                this.toggleDebugMode();
            }
            
            // F3 - Console commands
            if (e.key === 'F3') {
                e.preventDefault();
                this.showConsole();
            }
            
            // F4 - Quick save state
            if (e.key === 'F4') {
                e.preventDefault();
                this.quickSaveState();
            }
            
            // F5 - Reload with cache bypass
            if (e.key === 'F5' && e.shiftKey) {
                e.preventDefault();
                location.reload(true);
            }
        });
    }
    
    toggle() {
        this.isVisible = !this.isVisible;
        this.container.style.display = this.isVisible ? 'block' : 'none';
        if (this.isVisible) {
            this.updateDisplay();
        }
    }
    
    toggleDebugMode() {
        if (!window.game) return;
        
        window.debugMode = !window.debugMode;
        
        if (window.debugMode) {
            // Show all eye indices
            document.querySelectorAll('.eye').forEach((eye, index) => {
                const label = document.createElement('div');
                label.className = 'debug-label';
                label.style.cssText = `
                    position: absolute;
                    top: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: black;
                    color: white;
                    padding: 2px 5px;
                    font-size: 10px;
                    border-radius: 3px;
                    pointer-events: none;
                `;
                label.textContent = eye.dataset.index || index;
                eye.appendChild(label);
            });
            
            // Show hitboxes
            document.querySelectorAll('.eye').forEach(eye => {
                eye.style.border = '2px solid red';
            });
            
            console.log('Debug mode enabled');
        } else {
            // Remove debug elements
            document.querySelectorAll('.debug-label').forEach(label => label.remove());
            document.querySelectorAll('.eye').forEach(eye => {
                eye.style.border = '';
            });
            
            console.log('Debug mode disabled');
        }
    }
    
    showConsole() {
        const commands = `
=== Debug Console Commands ===

game.sanity = 100          // Set sanity to 100%
game.power = 100           // Set power to 100%
game.score += 10000        // Add 10000 points
game.level = 5             // Jump to level 5
game.combo = 20            // Set combo to 20x

game.powerUps.revealOne.uses = 99     // Unlimited reveals
game.powerUps.slowTime.cooldown = 0   // No cooldown

game.showAllPatterns()     // Reveal current pattern
game.skipToEnd()          // Skip to end game
game.unlockAllAchievements() // Unlock all achievements

perfMon.exportMetrics()    // Export performance data
perfMon.stressTest()      // Run stress test
        `;
        
        console.log(commands);
        alert('Debug commands printed to console (F12)');
    }
    
    quickSaveState() {
        if (!window.game) return;
        
        const state = {
            timestamp: new Date().toISOString(),
            gameState: window.game.gameState,
            level: window.game.level,
            score: window.game.score,
            sanity: window.game.sanity,
            sequence: window.game.sequence,
            playerSequence: window.game.playerSequence
        };
        
        localStorage.setItem('watchersGrove_quickSave', JSON.stringify(state));
        console.log('Quick save created:', state);
        
        // Visual feedback
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(139, 115, 85, 0.8);
            color: white;
            padding: 20px;
            border-radius: 10px;
            font-size: 20px;
            z-index: 10001;
        `;
        flash.textContent = 'State Saved!';
        document.body.appendChild(flash);
        
        setTimeout(() => flash.remove(), 1000);
    }
    
    exportMetrics() {
        const metrics = {
            timestamp: new Date().toISOString(),
            performance: {
                averageFPS: this.fps,
                memoryUsage: this.memoryUsage,
                objectCounts: {
                    eyes: this.eyeCount,
                    particles: this.particleCount
                }
            },
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                memory: performance.memory ? {
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576),
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576),
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576)
                } : 'Not available'
            }
        };
        
        console.log('Performance Metrics:', metrics);
        return metrics;
    }
    
    stressTest() {
        console.log('Starting stress test...');
        
        // Create many eyes
        for (let i = 0; i < 100; i++) {
            const eye = document.createElement('div');
            eye.className = 'eye';
            eye.style.left = Math.random() * window.innerWidth + 'px';
            eye.style.top = Math.random() * window.innerHeight + 'px';
            document.body.appendChild(eye);
        }
        
        // Create many particles
        const createParticles = () => {
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = Math.random() * window.innerWidth + 'px';
                particle.style.top = Math.random() * window.innerHeight + 'px';
                document.body.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }
        };
        
        // Run particle creation every 100ms for 10 seconds
        const interval = setInterval(createParticles, 100);
        setTimeout(() => {
            clearInterval(interval);
            console.log('Stress test completed');
            
            // Clean up test eyes
            document.querySelectorAll('.eye').forEach(eye => {
                if (!eye.dataset.index) eye.remove();
            });
        }, 10000);
    }
}

// Debug command extensions for the game
if (window.game) {
    // Show all patterns
    window.game.showAllPatterns = function() {
        console.log('Current pattern:', this.sequence);
        this.sequence.forEach((index, i) => {
            setTimeout(() => {
                const eye = this.eyes[index];
                if (eye) {
                    eye.style.border = '3px solid gold';
                    const label = document.createElement('div');
                    label.style.cssText = `
                        position: absolute;
                        top: -25px;
                        left: 50%;
                        transform: translateX(-50%);
                        background: gold;
                        color: black;
                        padding: 2px 8px;
                        font-weight: bold;
                        border-radius: 3px;
                    `;
                    label.textContent = i + 1;
                    eye.appendChild(label);
                }
            }, i * 200);
        });
    };
    
    // Skip to end
    window.game.skipToEnd = function() {
        this.level = 10;
        this.score = 999999;
        this.endGame(true);
    };
    
    // Unlock all achievements
    window.game.unlockAllAchievements = function() {
        Object.keys(this.possibleAchievements).forEach(id => {
            this.unlockAchievement(id);
        });
    };
}

// Auto-initialize on game load
window.addEventListener('load', () => {
    window.perfMon = new PerformanceMonitor();
    console.log('Performance Monitor loaded. Press F1 to toggle display.');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceMonitor;
}