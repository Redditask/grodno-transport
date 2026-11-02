import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { CurrentTimeContext } from './currentTimeContext';

const useClock = (): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timerId: number;

    const tick = () => {
      setNow(new Date());

      timerId = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));
    };

    timerId = window.setTimeout(tick, 60_000 - (Date.now() % 60_000));

    return () => window.clearTimeout(timerId);
  }, []);

  return now;
};

interface CurrentTimeProviderProps {
  children: ReactNode;
}

export const CurrentTimeProvider = ({ children }: CurrentTimeProviderProps) => {
  const now = useClock();

  return <CurrentTimeContext.Provider value={now}>{children}</CurrentTimeContext.Provider>;
};
