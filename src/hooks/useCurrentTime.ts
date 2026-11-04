import { useContext } from 'react';

import { CurrentTimeContext } from '@/providers/currentTimeContext';

export const useCurrentTime = (): Date => {
  const now = useContext(CurrentTimeContext);

  if (!now) throw new Error('useCurrentTime requires CurrentTimeProvider');

  return now;
};
