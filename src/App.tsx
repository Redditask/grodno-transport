import { AppFooter } from './components/AppFooter/AppFooter';
import { AppHeader } from './components/AppHeader/AppHeader';
import { StopList } from './components/StopList/StopList';

import styles from './App.module.scss';

export const App = () => (
  <div className={styles.page}>
    <AppHeader />
    <main>
      <StopList />
    </main>
    <AppFooter />
  </div>
);
