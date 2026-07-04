import { useState, useEffect } from 'react';

/**
 * useCountdown — derives a live countdown (in seconds) from a DB timestamp.
 * Works by reading `turnExpiresAt` from the game doc and ticking down every second.
 *
 * @param {string|Date|null} expiresAt - The turnExpiresAt value from the game document
 * @returns {number} secondsRemaining - 0 when expired
 */
export function useCountdown(expiresAt) {
  const getSecondsLeft = () => {
    if (!expiresAt) return 0;
    const diff = Math.floor((new Date(expiresAt) - Date.now()) / 1000);
    return Math.max(0, diff);
  };

  const [secondsRemaining, setSecondsRemaining] = useState(getSecondsLeft);

  useEffect(() => {
    if (!expiresAt) {
      setSecondsRemaining(0);
      return;
    }

    setSecondsRemaining(getSecondsLeft());

    const interval = setInterval(() => {
      const left = getSecondsLeft();
      setSecondsRemaining(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return secondsRemaining;
}
