// The Watcher's Grove - Audio Manager
// Handles all sound effects, music, and audio processing

class AudioManager {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.soundEnabled = true;
        this.soundScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C major scale
        
        this.initializeAudio();
    }
    
    initializeAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.connect(this.audioCtx.destination);
            this.masterGain.gain.value = 0.3;
            
            // Create reverb
            this.createReverb();
            
            console.log('Audio system initialized');
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }
    
    createReverb() {
        this.convolver = this.audioCtx.createConvolver();
        const length = this.audioCtx.sampleRate * 2;
        const impulse = this.audioCtx.createBuffer(2, length, this.audioCtx.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        this.convolver.buffer = impulse;
        this.reverbGain = this.audioCtx.createGain();
        this.reverbGain.gain.value = 0.2;
        this.convolver.connect(this.reverbGain);
        this.reverbGain.connect(this.masterGain);
    }
    
    playSound(frequency, duration, type = 'sine', useReverb = false) {
        if (!this.soundEnabled || !this.audioCtx) return;
        
        const oscillator = this.audioCtx.createOscillator();
        const gainNode = this.audioCtx.createGain();
        const filter = this.audioCtx.createBiquadFilter();
        
        oscillator.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);
        
        if (useReverb && this.convolver) {
            gainNode.connect(this.convolver);
        }
        
        oscillator.frequency.value = frequency;
        oscillator.type = type;
        
        filter.type = 'lowpass';
        filter.frequency.value = frequency * 2;
        filter.Q.value = 10;
        
        const now = this.audioCtx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    }
    
    playEyeSound(eyeIndex) {
        const noteIndex = eyeIndex % this.soundScale.length;
        const frequency = this.soundScale[noteIndex];
        this.playSound(frequency, 0.3, 'sine');
    }
    
    playSuccessSound() {
        this.playSound(500, 1, 'sine', true);
        setTimeout(() => this.playSound(600, 0.2), 100);
        setTimeout(() => this.playSound(800, 0.2), 200);
    }
    
    playErrorSound() {
        this.playSound(100, 1, 'sawtooth');
    }
    
    playBossSound() {
        // Deep, ominous bass sound
        this.playSound(55, 2, 'sawtooth', true);
        this.playSound(110, 1, 'square', true);
        
        // Dissonant chord
        setTimeout(() => {
            this.playSound(220, 0.5, 'triangle');
            this.playSound(233, 0.5, 'triangle');
            this.playSound(261, 0.5, 'triangle');
        }, 200);
    }
    
    playAchievementSound() {
        this.playSound(1000, 0.5, 'sine');
        setTimeout(() => this.playSound(1200, 0.5, 'sine'), 100);
    }
    
    playPowerUpSound() {
        this.playSound(600, 0.3, 'triangle');
    }
    
    playAmbientDrone() {
        if (!this.soundEnabled || this.ambientOscillator) return;
        
        try {
            this.ambientOscillator = this.audioCtx.createOscillator();
            this.ambientGain = this.audioCtx.createGain();
            const filter = this.audioCtx.createBiquadFilter();
            
            this.ambientOscillator.connect(filter);
            filter.connect(this.ambientGain);
            this.ambientGain.connect(this.masterGain);
            
            this.ambientOscillator.frequency.value = 55; // Low A
            this.ambientOscillator.type = 'triangle';
            
            filter.type = 'lowpass';
            filter.frequency.value = 200;
            
            this.ambientGain.gain.value = 0.05;
            
            this.ambientOscillator.start();
        } catch (error) {
            console.error('Failed to start ambient drone:', error);
        }
    }
    
    stopAmbientDrone() {
        if (this.ambientOscillator) {
            try {
                this.ambientOscillator.stop();
                this.ambientOscillator = null;
            } catch (error) {
                // Already stopped
            }
        }
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
            this.stopAmbientDrone();
        }
        return this.soundEnabled;
    }
    
    setVolume(volume) {
        if (this.masterGain) {
            this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
        }
    }
    
    // Create complex sound effects
    playSequenceComplete() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C (octave higher)
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSound(freq, 0.3, 'sine', true);
            }, i * 100);
        });
    }
    
    playMadnessEffect() {
        // Dissonant, unsettling sounds
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const freq = 100 + Math.random() * 300;
                this.playSound(freq, 0.2, 'sawtooth');
            }, i * 200);
        }
    }
    
    playSeasonalSound(season) {
        switch(season) {
            case 'winter':
                // Crystalline, high-pitched sounds
                this.playSound(2000, 0.5, 'sine', true);
                break;
            case 'summer':
                // Warm, buzzing sounds
                this.playSound(440, 1, 'triangle', true);
                break;
            case 'autumn':
                // Rustling, mid-range sounds
                this.playSound(330, 0.8, 'square');
                break;
            case 'spring':
                // Light, ascending sounds
                for (let i = 0; i < 4; i++) {
                    setTimeout(() => {
                        this.playSound(300 + i * 100, 0.2, 'sine');
                    }, i * 50);
                }
                break;
        }
    }
}

// Export for use in main.js
window.AudioManager = AudioManager;