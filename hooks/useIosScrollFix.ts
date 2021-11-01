import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

// https://twitter.com/jordwalke/status/1356195754692382727
// https://gist.github.com/kiding/72721a0553fa93198ae2bb6eefaa3299
export const useIosScrollFix = () => {
  const t = useTheme();
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEnabled(false);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  return enabled ? t.opacity0 : null;
};
