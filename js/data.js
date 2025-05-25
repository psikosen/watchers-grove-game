// Game data and configurations
const GameData = {
    // Season themes
    seasonThemes: {
        spring: {
            colors: ['#8fbc8f', '#98fb98', '#90ee90'],
            particles: 'petals',
            narrativeBonus: 'The grove blooms with ancient life...'
        },
        summer: {
            colors: ['#32cd32', '#228b22', '#006400'],
            particles: 'leaves',
            narrativeBonus: 'The summer heat intensifies the watchers\' gaze...'
        },
        autumn: {
            colors: ['#8b6914', '#cd853f', '#d2691e'],
            particles: 'leaves',
            narrativeBonus: 'The dying season whispers forgotten secrets...'
        },
        winter: {
            colors: ['#b0c4de', '#87ceeb', '#4682b4'],
            particles: 'snow',
            narrativeBonus: 'The cold preserves memories of ages past...'
        }
    },

    // Difficulty settings
    difficultySettings: {
        normal: {
            timeBonus: 1,
            sanityLoss: 1,
            powerGain: 1,
            name: 'Normal'
        },
        hard: {
            timeBonus: 0.8,
            sanityLoss: 1.5,
            powerGain: 0.8,
            name: 'Hard'
        },
        nightmare: {
            timeBonus: 0.6,
            sanityLoss: 2,
            powerGain: 0.6,
            name: 'Nightmare'
        }
    },

    // Boss data
    bosses: {
        1: {
            name: 'The Watching Sentinel',
            health: 100,
            patterns: [
                [0, 1, 2],
                [3, 4, 5, 0],
                [1, 3, 5, 2, 4],
                [0, 2, 4, 1, 3, 5]
            ],
            speed: 0.9,
            description: 'The first guardian of the grove, ancient beyond measure.'
        },
        2: {
            name: 'The Memory Keeper',
            health: 150,
            patterns: [
                [1, 4, 2, 5, 0, 3],
                [0, 3, 1, 4, 2, 5, 0],
                [2, 0, 4, 1, 5, 3, 2, 4],
                [3, 1, 5, 0, 2, 4, 1, 3, 5]
            ],
            speed: 0.8,
            description: 'Keeper of forgotten memories and lost knowledge.'
        },
        3: {
            name: 'The Eternal Watcher',
            health: 200,
            patterns: [
                [0, 2, 4, 1, 3, 5, 0, 2],
                [1, 3, 0, 4, 2, 5, 1, 4, 0],
                [2, 5, 1, 4, 0, 3, 2, 1, 5, 4],
                [3, 0, 4, 1, 5, 2, 0, 3, 1, 4, 2]
            ],
            speed: 0.7,
            description: 'The final guardian, watcher of all that was and will be.'
        }
    },

    // Achievement definitions
    achievements: {
        firstLevel: 'Complete your first level',
        combo10: 'Achieve a 10x combo',
        perfectLevel: 'Complete a level without mistakes',
        sanityEdge: 'Survive with less than 10% sanity',
        powerUser: 'Use all power-ups in a single game',
        speedDemon: 'Complete a level in under 30 seconds',
        survivor: 'Reach level 20 in survival mode',
        bossSlayer: 'Defeat your first boss',
        allBosses: 'Defeat all bosses',
        zenMaster: 'Complete 50 levels in zen mode',
        nightmareWalker: 'Complete 10 levels on nightmare difficulty',
        streakMaster: 'Achieve a 50-eye streak',
        eyeCollector: 'Click 1000 eyes total',
        seasonalExplorer: 'Play in all four seasons',
        perfectionist: 'Achieve 100% accuracy for 5 consecutive levels'
    },

    // Eye placement patterns for different levels
    eyePlacementPatterns: {
        // Circular patterns
        circle: (count, centerX, centerY, radius) => {
            const positions = [];
            for (let i = 0; i < count; i++) {
                const angle = (2 * Math.PI * i) / count;
                positions.push({
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                });
            }
            return positions;
        },

        // Spiral pattern
        spiral: (count, centerX, centerY, radius) => {
            const positions = [];
            const angleStep = 0.5;
            const radiusStep = radius / count;
            
            for (let i = 0; i < count; i++) {
                const angle = i * angleStep;
                const r = i * radiusStep;
                positions.push({
                    x: centerX + r * Math.cos(angle),
                    y: centerY + r * Math.sin(angle)
                });
            }
            return positions;
        },

        // Grid pattern
        grid: (count, centerX, centerY, spacing) => {
            const positions = [];
            const cols = Math.ceil(Math.sqrt(count));
            const rows = Math.ceil(count / cols);
            
            for (let i = 0; i < count; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                positions.push({
                    x: centerX + (col - cols/2) * spacing,
                    y: centerY + (row - rows/2) * spacing
                });
            }
            return positions;
        }
    },

    // Narrative text collections
    narratives: {
        story: [
            "You stand before the ancient tree. Its countless eyes watch your every move...",
            "The eyes blink in patterns. They speak a language older than words...",
            "Each pattern unlocks a fragment of forbidden knowledge...",
            "The tree recognizes you. Its gaze grows more intense...",
            "Whispers echo through your mind. The truth is near...",
            "The final revelation awaits. Will you embrace it?"
        ],
        survival: [
            "The grove hungers. Feed it patterns or be consumed...",
            "Time is fleeting. The eyes grow impatient...",
            "Your sanity frays, but you must continue...",
            "How long can you last in this nightmare?",
            "The patterns accelerate. The grove tests your limits...",
            "Survival is not guaranteed. Only the worthy endure..."
        ],
        zen: [
            "Breathe. Focus. The patterns flow like water...",
            "There is no rush. Only you and the eternal gaze...",
            "Find peace in the watching eyes...",
            "Let the patterns guide your meditation...",
            "In stillness, understanding blooms...",
            "The grove shares its wisdom with the patient..."
        ],
        boss: [
            "A guardian stirs. Prove your worth or perish...",
            "The ancient one awakens. Its patterns are legendary...",
            "Boss battles test more than memory. They test your soul...",
            "Each guardian holds a piece of the ultimate truth..."
        ]
    }
};