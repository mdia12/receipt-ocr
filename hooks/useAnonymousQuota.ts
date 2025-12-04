import { useState, useEffect } from 'react';

const STORAGE_KEY = 'anonymous_last_scan';
const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

export function useAnonymousQuota() {
  const [isAllowed, setIsAllowed] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  useEffect(() => {
    checkQuota();
  }, []);

  const checkQuota = () => {
    if (typeof window === 'undefined') return;

    const lastScan = localStorage.getItem(STORAGE_KEY);
    if (!lastScan) {
      setIsAllowed(true);
      setTimeRemaining(null);
      return;
    }

    const lastScanTime = parseInt(lastScan, 10);
    const now = Date.now();
    const diff = now - lastScanTime;

    if (diff < COOLDOWN_MS) {
      setIsAllowed(false);
      const remaining = COOLDOWN_MS - diff;
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setIsAllowed(true);
      setTimeRemaining(null);
    }
  };

  const recordScan = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    checkQuota();
  };

  return { isAllowed, timeRemaining, recordScan, checkQuota };
}
