import { useCallback } from 'react';

// Simple beep sounds using AudioContext or base64 to avoid external assets for now
// These are short, synthesized sounds

class AudioController {
    private ctx: AudioContext | null = null;
    private volume: number = 0.3;

    constructor() {
        try {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.warn('AudioContext not supported');
        }
    }

    play(type: 'click' | 'success' | 'error' | 'levelUp') {
        if (!this.ctx) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        const now = this.ctx.currentTime;

        switch (type) {
            case 'click':
                // High pitch short blip
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
                gain.gain.setValueAtTime(this.volume * 0.5, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;

            case 'success':
                // Ascending major arpeggio
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now); // A4
                osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
                osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.5);
                osc.start(now);
                osc.stop(now + 0.6);
                break;

            case 'error':
                // Low buzzing descending
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.linearRampToValueAtTime(100, now + 0.2);
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.3);
                osc.start(now);
                osc.stop(now + 0.3);
                break;

            case 'levelUp':
                // Grand fanfare
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.setValueAtTime(440, now + 0.2);
                osc.frequency.setValueAtTime(440, now + 0.4);
                osc.frequency.setValueAtTime(659.25, now + 0.6); // E5 long
                gain.gain.setValueAtTime(this.volume, now);
                gain.gain.setValueAtTime(0.01, now + 2);
                osc.start(now);
                osc.stop(now + 2);
                break;
        }
    }
}

const audioController = new AudioController();

export const useSound = () => {
    const play = useCallback((type: 'click' | 'success' | 'error' | 'levelUp') => {
        // Check if user has muted sfx in settings (future feature: check store)
        audioController.play(type);
    }, []);

    return { play };
};
