import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { CurrentTimeProvider } from '@/providers/CurrentTimeProvider';

import { App } from './App';

import './styles.scss';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден корневой элемент приложения');
}

createRoot(rootElement).render(
  <StrictMode>
    <CurrentTimeProvider>
      <App />
    </CurrentTimeProvider>
  </StrictMode>,
);
