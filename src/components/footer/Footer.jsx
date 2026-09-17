import SocialLinks from '../social-links/SocialLinks';
import styles from './footer.module.css';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.border}></div>
            <SocialLinks listClassName={styles.social} itemClassName={styles.icon} />
            <p className={styles.copyright}>© 2022. Komnata 1908. ВСЕ ПРАВА ЗАЩИЩЕНЫ</p>
        </footer>
    )
}