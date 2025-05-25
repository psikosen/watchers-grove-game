// Audio system for the game
class AudioSystem {
    constructor() {
        this.audioCtx = null;
        this.masterGain = null;
        this.ambientOscillator = null;
        this.ambientGain = null;
        this.soundEnabled = true;
        this.volume = 0.5;
        
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioCtx.createGain();
            this.masterGain.connect(this.audioCtx.destination);
            this.masterGain.gain.value = this.volume;
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.soundEnabled = false;
        }
    }

    playSound(frequency = 440, duration = 0.3, type = 'sine', volume = 0.3) {
        if (!this.soundEnabled || !this.audioCtx) return;

        try {
            const oscillator = this.audioCtx.createOscillator();
            const gainNode = this.audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.value = frequency;
            oscillator.type = type;
            
            gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
            gainNode.gain.linearRampToValueAtTime(volume, this.audioCtx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);
            
            oscillator.start(this.audioCtx.currentTime);
            oscillator.stop(this.audioCtx.currentTime + duration);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    playSequenceNote(index, total = 8) {
        const baseFreq = 261.63; // C4
        const noteIndex = index % total;
        const frequency = baseFreq * Math.pow(2, noteIndex / 12);
        this.playSound(frequency, 0.5, 'sine', 0.4);
    }

    playSuccessSound() {
        this.playSound(523.25, 0.2, 'sine', 0.3); // C5
        setTimeout(() => this.playSound(659.25, 0.2, 'sine', 0.3), 100); // E5
        setTimeout(() => this.playSound(783.99, 0.3, 'sine', 0.3), 200); // G5
    }

    playErrorSound() {
        this.playSound(220, 0.5, 'sawtooth', 0.4); // A3
        setTimeout(() => this.playSound(196, 0.3, 'sawtooth', 0.3), 200); // G3
    }

    playLevelUpSound() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.playSound(440 + i * 110, 0.2, 'sine', 0.3);
            }, i * 100);
        }
    }

    playBossSound() {
        this.playSound(110, 1.0, 'sawtooth', 0.5); // A2
        setTimeout(() => this.playSound(87.31, 0.8, 'square', 0.4), 200); // F2
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
        } catch (e) {
            console.warn('Error playing ambient drone:', e);
        }
    }

    stopAmbientDrone() {
        if (this.ambientOscillator) {
            try {
                this.ambientOscillator.stop();
                this.ambientOscillator = null;
            } catch (e) {
                console.warn('Error stopping ambient drone:', e);
            }
        }
    }

    setVolume(volume) {
        this.volume = volume / 100;
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
    }

    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        if (!this.soundEnabled) {
            this.stopAmbientDrone();
        }
        return this.soundEnabled;
    }

    // Resume audio context (needed for mobile browsers)
    resumeContext() {
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }
}