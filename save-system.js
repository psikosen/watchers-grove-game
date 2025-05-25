// The Watcher's Grove - Save System & Level Sharing
// This module handles save data, level sharing, and data export/import

class WatchersGroveSaveSystem {
    constructor() {
        this.version = "3.0";
        this.storagePrefix = "watchersGrove_";
    }

    // Save game state
    saveGameState(gameInstance) {
        const saveData = {
            version: this.version,
            timestamp: new Date().toISOString(),
            playerStats: {
                totalEyesClicked: gameInstance.totalEyesClicked,
                totalPlaytime: this.calculatePlaytime(),
                favoriteMode: this.getMostPlayedMode(),
                favoriteSeaso: gameInstance.currentSeason
            },
            achievements: Array.from(gameInstance.achievements),
            unlockables: Array.from(gameInstance.unlockables),
            highScores: this.getHighScores(),
            customLevels: gameInstance.customLevels,
            settings: {
                soundEnabled: gameInstance.soundEnabled,
                difficulty: gameInstance.difficulty,
                currentSeason: gameInstance.currentSeason
            },
            statistics: {
                totalGamesPlayed: this.getTotalGamesPlayed(),
                perfectLevels: this.getPerfectLevels(),
                bossesDefeated: this.getBossesDefeated(),
                maxComboAchieved: this.getMaxCombo()
            }
        };

        localStorage.setItem(this.storagePrefix + 'saveData', JSON.stringify(saveData));
        return saveData;
    }

    // Load game state
    loadGameState() {
        const savedData = localStorage.getItem(this.storagePrefix + 'saveData');
        if (!savedData) return null;

        try {
            const data = JSON.parse(savedData);
            
            // Version compatibility check
            if (data.version !== this.version) {
                this.migrateData(data);
            }

            return data;
        } catch (error) {
            console.error('Failed to load save data:', error);
            return null;
        }
    }

    // Export save data as file
    exportSaveData() {
        const saveData = this.saveGameState(window.game);
        const dataStr = JSON.stringify(saveData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `WatchersGrove_Save_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    // Import save data from file
    importSaveData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate save data
                    if (!this.validateSaveData(data)) {
                        reject('Invalid save file');
                        return;
                    }

                    // Apply save data
                    this.applySaveData(data);
                    resolve(data);
                } catch (error) {
                    reject('Failed to parse save file');
                }
            };

            reader.readAsText(file);
        });
    }

    // Level sharing system
    encodeLevelData(level) {
        const levelData = {
            name: level.name,
            eyes: level.eyes,
            sequence: level.sequence,
            created: level.created,
            author: this.getPlayerName()
        };

        // Compress and encode
        const jsonStr = JSON.stringify(levelData);
        const compressed = this.compressString(jsonStr);
        return btoa(compressed);
    }

    decodeLevelData(encodedData) {
        try {
            const compressed = atob(encodedData);
            const jsonStr = this.decompressString(compressed);
            return JSON.parse(jsonStr);
        } catch (error) {
            console.error('Failed to decode level:', error);
            return null;
        }
    }

    // Share level via URL
    generateShareableLink(level) {
        const encoded = this.encodeLevelData(level);
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?level=${encodeURIComponent(encoded)}`;
    }

    // Load shared level from URL
    loadSharedLevel() {
        const urlParams = new URLSearchParams(window.location.search);
        const levelData = urlParams.get('level');
        
        if (levelData) {
            const decoded = this.decodeLevelData(decodeURIComponent(levelData));
            if (decoded) {
                return decoded;
            }
        }
        
        return null;
    }

    // Utility functions
    compressString(str) {
        // Simple compression using run-length encoding
        return str.replace(/(.)\1+/g, (match, char) => {
            return char + match.length;
        });
    }

    decompressString(str) {
        // Decompress run-length encoded string
        return str.replace(/(.)\d+/g, (match, char) => {
            const count = parseInt(match.slice(1));
            return char.repeat(count);
        });
    }

    validateSaveData(data) {
        // Check required fields
        const requiredFields = ['version', 'timestamp', 'achievements', 'settings'];
        return requiredFields.every(field => field in data);
    }

    applySaveData(data) {
        const game = window.game;
        if (!game) return;

        // Apply achievements
        game.achievements = new Set(data.achievements);
        
        // Apply unlockables
        game.unlockables = new Set(data.unlockables);
        
        // Apply settings
        game.soundEnabled = data.settings.soundEnabled;
        game.difficulty = data.settings.difficulty;
        game.changeSeason(data.settings.currentSeason);
        
        // Apply custom levels
        game.customLevels = data.customLevels || [];
        
        // Update UI
        game.checkUnlockables();
        
        // Show confirmation
        game.showNotification('Save data loaded successfully!');
    }

    migrateData(oldData) {
        // Handle version migrations
        console.log('Migrating save data from version', oldData.version, 'to', this.version);
        
        // Add migration logic here for different versions
        if (!oldData.unlockables) {
            oldData.unlockables = [];
        }
        
        if (!oldData.customLevels) {
            oldData.customLevels = [];
        }
        
        return oldData;
    }

    // Statistics tracking
    calculatePlaytime() {
        const startTime = localStorage.getItem(this.storagePrefix + 'firstPlayed');
        if (!startTime) {
            localStorage.setItem(this.storagePrefix + 'firstPlayed', Date.now());
            return 0;
        }
        
        const totalSessions = parseInt(localStorage.getItem(this.storagePrefix + 'sessions') || '0');
        return totalSessions * 15; // Estimate 15 minutes per session
    }

    getMostPlayedMode() {
        const modes = ['story', 'survival', 'zen', 'boss'];
        let maxPlays = 0;
        let favoriteMode = 'story';
        
        modes.forEach(mode => {
            const plays = parseInt(localStorage.getItem(this.storagePrefix + mode + 'Plays') || '0');
            if (plays > maxPlays) {
                maxPlays = plays;
                favoriteMode = mode;
            }
        });
        
        return favoriteMode;
    }

    getTotalGamesPlayed() {
        return parseInt(localStorage.getItem(this.storagePrefix + 'totalGames') || '0');
    }

    getPerfectLevels() {
        return parseInt(localStorage.getItem(this.storagePrefix + 'perfectLevels') || '0');
    }

    getBossesDefeated() {
        return parseInt(localStorage.getItem(this.storagePrefix + 'bossesDefeated') || '0');
    }

    getMaxCombo() {
        return parseInt(localStorage.getItem(this.storagePrefix + 'maxCombo') || '0');
    }

    getHighScores() {
        return JSON.parse(localStorage.getItem('watchersGroveScores') || '[]');
    }

    getPlayerName() {
        return localStorage.getItem(this.storagePrefix + 'playerName') || 'Anonymous Watcher';
    }

    setPlayerName(name) {
        localStorage.setItem(this.storagePrefix + 'playerName', name);
    }

    // Cloud save preparation (for future implementation)
    prepareCloudSave() {
        const saveData = this.saveGameState(window.game);
        
        // Add unique identifier
        saveData.playerId = this.getOrCreatePlayerId();
        saveData.deviceId = this.getDeviceId();
        
        return {
            data: saveData,
            checksum: this.calculateChecksum(JSON.stringify(saveData))
        };
    }

    getOrCreatePlayerId() {
        let playerId = localStorage.getItem(this.storagePrefix + 'playerId');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.storagePrefix + 'playerId', playerId);
        }
        return playerId;
    }

    getDeviceId() {
        let deviceId = localStorage.getItem(this.storagePrefix + 'deviceId');
        if (!deviceId) {
            deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.storagePrefix + 'deviceId', deviceId);
        }
        return deviceId;
    }

    calculateChecksum(data) {
        // Simple checksum for data integrity
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(16);
    }

    // Reset functions
    resetProgress() {
        if (confirm('Are you sure you want to reset all progress? This cannot be undone!')) {
            const keys = Object.keys(localStorage).filter(key => key.startsWith(this.storagePrefix));
            keys.forEach(key => localStorage.removeItem(key));
            
            // Also clear other game-specific keys
            localStorage.removeItem('watchersGroveScores');
            localStorage.removeItem('watchersGroveCustomLevels');
            localStorage.removeItem('watchersGroveProgress');
            localStorage.removeItem('watchersGroveAchievements');
            
            window.location.reload();
        }
    }

    // Debug functions
    exportDebugInfo() {
        const debugInfo = {
            localStorage: {},
            gameState: window.game ? {
                level: window.game.level,
                score: window.game.score,
                sanity: window.game.sanity,
                gameMode: window.game.gameMode,
                achievements: Array.from(window.game.achievements)
            } : null,
            browser: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language
            },
            timestamp: new Date().toISOString()
        };

        // Get all localStorage items
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(this.storagePrefix) || key.includes('watchersGrove')) {
                debugInfo.localStorage[key] = localStorage.getItem(key);
            }
        });

        const dataStr = JSON.stringify(debugInfo, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `WatchersGrove_Debug_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }
}

// Initialize save system
const saveSystem = new WatchersGroveSaveSystem();

// Auto-save every 5 minutes
setInterval(() => {
    if (window.game && window.game.gameState === 'playing') {
        saveSystem.saveGameState(window.game);
    }
}, 5 * 60 * 1000);

// Check for shared level on page load
window.addEventListener('load', () => {
    const sharedLevel = saveSystem.loadSharedLevel();
    if (sharedLevel) {
        // Wait for game to initialize
        setTimeout(() => {
            if (window.game) {
                window.game.customLevels.push(sharedLevel);
                window.game.showNotification(`Imported level: "${sharedLevel.name}"`);
            }
        }, 3000);
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S = Save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveSystem.saveGameState(window.game);
        if (window.game) {
            window.game.showNotification('Game saved!');
        }
    }
    
    // Ctrl/Cmd + E = Export save
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        saveSystem.exportSaveData();
    }
    
    // Ctrl/Cmd + D = Debug info
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        saveSystem.exportDebugInfo();
    }
});

// Expose save system globally for console access
window.watchersGroveSaveSystem = saveSystem;