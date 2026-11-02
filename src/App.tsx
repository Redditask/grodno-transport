import { AppFooter } from './components/AppFooter/AppFooter';
import { AppHeader } from './components/AppHeader/AppHeader';
import { StopsList } from './components/StopsList/StopsList';

import styles from './App.module.scss';

export const App = () => (
  <div className={styles.page}>
    <AppHeader />
    <main>
      <StopsList />
    </main>
    <AppFooter />
  </div>
);
