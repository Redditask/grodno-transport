import { AppFooter } from '@/components/AppFooter/AppFooter';
import { AppHeader } from '@/components/AppHeader/AppHeader';
import { CityMap } from '@/components/CityMap/CityMap';
import { TransportSearch } from '@/components/TransportSearch/TransportSearch';

import styles from './App.module.scss';

export const App = () => {
  return (
    <div className={styles.page}>
      <AppHeader />

      <main className={styles.mapStage}>
        <CityMap />

        <div className={styles.searchPanel}>
          <TransportSearch />
        </div>
      </main>

      <AppFooter />
    </div>
  );
};
