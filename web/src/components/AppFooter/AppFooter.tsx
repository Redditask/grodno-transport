import styles from './AppFooter.module.scss';

export const AppFooter = () => (
  <footer className={styles.footer}>
    <span className={styles.demoLabel}>Учебный режим</span>

    <p>Учебный снимок расписаний ZippyBus от 2 ноября 2026 года.</p>
  </footer>
);
