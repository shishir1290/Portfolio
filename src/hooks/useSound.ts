/** @format */

import { useCallback } from "react";

export const useSound = () => {
  const playClickSound = useCallback(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      // Short, crisp click
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        500,
        audioCtx.currentTime + 0.05
      );

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.05
      );

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } catch (error) {
      console.error("Audio playback failed", error);
    }
  }, []);

  const playWinSound = useCallback(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();

      const playNote = (freq: number, time: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sine";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;
      playNote(523.25, now, 0.2); // C5
      playNote(659.25, now + 0.1, 0.2); // E5
      playNote(783.99, now + 0.2, 0.4); // G5
    } catch (error) {
      console.error("Audio playback failed", error);
    }
  }, []);

  const playLoseSound = useCallback(() => {
    try {
      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();

      const playNote = (freq: number, time: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.type = "sawtooth";
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

        osc.start(time);
        osc.stop(time + duration);
      };

      const now = audioCtx.currentTime;
      playNote(392.0, now, 0.3); // G4
      playNote(369.99, now + 0.2, 0.3); // F#4
      playNote(349.23, now + 0.4, 0.6); // F4
    } catch (error) {
      console.error("Audio playback failed", error);
    }
  }, []);

  return { playClickSound, playWinSound, playLoseSound };
};
