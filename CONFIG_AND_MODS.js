// The Watcher's Grove - Configuration & Modding Guide
// 
// This file contains configuration options and modding instructions
// for advanced players who want to customize their experience.
//
// To apply changes: Copy the code snippets into the browser console
// while the game is running, or modify the index.html directly.

// ============================================
// VISUAL CONFIGURATIONS
// ============================================

// Change eye colors (paste in console)
/*
document.querySelectorAll('.eye').forEach(eye => {
    eye.style.background = 'radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)';
});
*/

// Disable screen shake
/*
WatchersGroveEnhanced.prototype.shakeScreen = function() {
    // Screen shake disabled
};
*/

// Custom color schemes
const colorSchemes = {
    // Default eldritch horror
    classic: {
        primary: '#8b7355',
        secondary: '#b8a590',
        background: '#0a0a0a',
        accent: '#4a7c7e'
    },
    
    // Cosmic horror purple
    cosmic: {
        primary: '#9b59b6',
        secondary: '#bb99cc',
        background: '#1a0a1a',
        accent: '#3498db'
    },
    
    // Deep sea theme
    abyssal: {
        primary: '#2c7a7b',
        secondary: '#4fd1c5',
        background: '#0a1a1a',
        accent: '#38b2ac'
    },
    
    // Blood moon theme
    crimson: {
        primary: '#dc2626',
        secondary: '#ef4444',
        background: '#1a0a0a',
        accent: '#b91c1c'
    }
};

// ============================================
// GAMEPLAY MODIFICATIONS
// ============================================

// Infinite power-ups (paste in console during game)
/*
game.powerUps = {
    slowTime: { active: false, duration: 0, cooldown: 0 },
    revealOne: { uses: 999 },
    skipLevel: { uses: 999 },
    sanityBoost: { uses: 999 }
};
game.updatePowerUpUI();
*/

// God mode (no sanity loss)
/*
Object.defineProperty(game, 'sanity', {
    get: function() { return this._sanity || 100; },
    set: function(value) { this._sanity = 100; }
});
*/

// Speed multiplier
/*
game.difficultyMultiplier.timeBonus = 2.0; // 2x slower patterns
*/

// ============================================
// CUSTOM GAME MODES
// ============================================

// Marathon Mode - Endless patterns, increasing speed
/*
function startMarathonMode() {
    game.gameMode = 'marathon';
    game.gameState = 'playing';
    game.level = 1;
    game.score = 0;
    game.sanity = 100;
    game.power = 999;
    
    // Override level progression
    const originalInit = game.initLevel;
    game.initLevel = function() {
        this.sequence = [];
        const length = 3 + Math.floor(Math.log2(this.level + 1) * 2);
        for(let i = 0; i < length; i++) {
            this.sequence.push(Math.floor(Math.random() * 20));
        }
        originalInit.call(this);
    };
    
    game.initLevel();
}
*/

// Memory Mode - Patterns don't repeat, must remember all
/*
function startMemoryMode() {
    game.gameMode = 'memory';
    game.allPatterns = [];
    
    const originalPlaySequence = game.playSequence;
    game.playSequence = function() {
        // Add new pattern to history
        this.allPatterns = this.allPatterns.concat(this.sequence);
        this.sequence = this.allPatterns;
        originalPlaySequence.call(this);
    };
}
*/

// ============================================
// CUSTOM SOUNDS
// ============================================

// Replace sound system with custom notes
/*
game.soundScale = [
    130.81, // C3
    146.83, // D3
    164.81, // E3
    174.61, // F3
    196.00, // G3
    220.00, // A3
    246.94, // B3
    261.63  // C4
];
*/

// Disable all sounds
/*
game.playSound = function() {};
game.playAmbientDrone = function() {};
game.stopAmbientDrone = function() {};
*/

// ============================================
// VISUAL EFFECTS
// ============================================

// Rainbow eyes effect
/*
let hue = 0;
setInterval(() => {
    document.querySelectorAll('.eye').forEach((eye, index) => {
        const eyeHue = (hue + index * 30) % 360;
        eye.style.filter = `hue-rotate(${eyeHue}deg)`;
    });
    hue += 5;
}, 50);
*/

// Matrix rain effect
/*
function addMatrixRain() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.opacity = '0.1';
    canvas.style.zIndex = '1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const matrix = "ᚠᚢᚦᚨᚱᚲᚷᚹ";
    const matrixArray = matrix.split("");
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = [];
    
    for(let x = 0; x < columns; x++) {
        drops[x] = 1;
    }
    
    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#8b7355';
        ctx.font = fontSize + 'px monospace';
        
        for(let i = 0; i < drops.length; i++) {
            const text = matrixArray[Math.floor(Math.random() * matrixArray.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            
            if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }
    
    setInterval(draw, 35);
}
*/

// ============================================
// CHEATS & DEBUG
// ============================================

// Show all patterns (debug mode)
/*
game.revealPattern = function() {
    console.log('Current pattern:', this.sequence);
    this.sequence.forEach((index, i) => {
        setTimeout(() => {
            this.eyes[index].style.border = '3px solid #ff0000';
            this.eyes[index].textContent = i + 1;
        }, i * 100);
    });
};
*/

// Skip to specific level
/*
function skipToLevel(targetLevel) {
    game.level = targetLevel - 1;
    game.clearEyes();
    game.initLevel();
}
*/

// Auto-play bot
/*
function enableAutoPlay() {
    const originalPlaySequence = game.playSequence;
    game.playSequence = function() {
        originalPlaySequence.call(this);
        
        setTimeout(() => {
            this.sequence.forEach((index, i) => {
                setTimeout(() => {
                    if (this.eyes[index]) {
                        this.eyes[index].click();
                    }
                }, i * 400);
            });
        }, this.sequence.length * 700);
    };
}
*/

// ============================================
// ACCESSIBILITY OPTIONS
// ============================================

// High contrast mode
/*
document.body.style.filter = 'contrast(2) brightness(1.2)';
*/

// Larger eyes for easier clicking
/*
document.querySelectorAll('.eye').forEach(eye => {
    eye.style.width = '60px';
    eye.style.height = '60px';
});
*/

// Number overlay on eyes
/*
game.eyes.forEach((eye, index) => {
    const number = document.createElement('div');
    number.textContent = index + 1;
    number.style.position = 'absolute';
    number.style.color = 'white';
    number.style.fontSize = '12px';
    number.style.pointerEvents = 'none';
    eye.appendChild(number);
});
*/

// ============================================
// CUSTOM NARRATIVES
// ============================================

// Add your own story lines
/*
game.narratives.custom = [
    "Your custom narrative line 1...",
    "Your custom narrative line 2...",
    "Your custom narrative line 3...",
    "Your custom narrative line 4...",
    "Your custom narrative line 5...",
    "Your custom narrative line 6..."
];

// Use custom narratives
game.narratives.story = game.narratives.custom;
*/

// ============================================
// ADVANCED MODDING
// ============================================

// Create completely custom eye behavior
/*
class CustomEye {
    constructor(x, y, behavior) {
        this.element = document.createElement('div');
        this.element.className = 'eye custom-eye';
        this.element.style.left = x + 'px';
        this.element.style.top = y + 'px';
        this.behavior = behavior;
        
        this.element.addEventListener('click', () => {
            this.behavior(this);
        });
        
        document.body.appendChild(this.element);
    }
    
    pulse() {
        this.element.style.animation = 'pulse 0.5s';
    }
    
    remove() {
        this.element.remove();
    }
}

// Example: Teleporting eye
const teleportEye = new CustomEye(500, 300, function(self) {
    const newX = Math.random() * window.innerWidth;
    const newY = Math.random() * window.innerHeight;
    self.element.style.left = newX + 'px';
    self.element.style.top = newY + 'px';
    self.pulse();
});
*/

// ============================================
// SAVING CUSTOM SETTINGS
// ============================================

// Save settings to localStorage
/*
const customSettings = {
    colorScheme: 'cosmic',
    difficulty: 'custom',
    powerUpMultiplier: 2,
    sanityDrainRate: 0.5,
    scoreMultiplier: 3
};

localStorage.setItem('watchersGroveCustomSettings', JSON.stringify(customSettings));

// Load settings on game start
const loadCustomSettings = () => {
    const settings = JSON.parse(localStorage.getItem('watchersGroveCustomSettings') || '{}');
    // Apply settings to game...
};
*/

// ============================================
// NOTES FOR MODDERS
// ============================================

/*
1. The main game instance is accessible as 'game' after initialization
2. Most methods can be overridden by replacing them on the prototype
3. Use the browser console to experiment with modifications
4. Changes to index.html are permanent, console changes are temporary
5. Back up index.html before making direct modifications

Key game properties:
- game.level: Current level number
- game.score: Current score
- game.sanity: Sanity percentage (0-100)
- game.power: Power percentage (0-100)
- game.insight: Insight percentage (0-100)
- game.sequence: Array of eye indices for current pattern
- game.eyes: Array of eye DOM elements
- game.gameState: 'menu', 'playing', or 'ended'

Key methods to override:
- initLevel(): Sets up a new level
- playSequence(): Shows the pattern to memorize
- handleEyeClick(): Processes player input
- checkSequence(): Validates the player's attempt
- drawBackground(): Renders the canvas background
- updateStats(): Updates the UI displays

Happy modding! May the eyes watch over your code... 👁️
*/