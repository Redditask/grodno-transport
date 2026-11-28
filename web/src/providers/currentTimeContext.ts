import { createContext } from 'react';

export const CurrentTimeContext = createContext<Date | undefined>(undefined);
