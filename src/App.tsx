import { AppFooter } from '@/components/AppFooter/AppFooter';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { TransportSearch } from '@/components/TransportSearch/TransportSearch';

import styles from './App.module.scss';

export const App = () => (
  <div className={styles.page}>
    <AppHeader />
    <main>
      <TransportSearch />
    </main>
    <AppFooter />
  </div>
);
