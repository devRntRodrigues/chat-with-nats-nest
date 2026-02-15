let lastPlayTime = 0;
const DEBOUNCE_MS = 1000;

export function playNotificationSound() {
  const now = Date.now();

  if (now - lastPlayTime < DEBOUNCE_MS) {
    return;
  }

  lastPlayTime = now;

  try {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    setTimeout(() => {
      audioContext.close();
    }, 200);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}
