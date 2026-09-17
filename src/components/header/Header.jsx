import HeaderButton from '../header-button/HeaderButton';
import SocialLinks from '../social-links/SocialLinks';
import styles from './header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <SocialLinks listClassName={styles.social} itemClassName={styles.icon} />
            <h1 className={styles.title}>KOMNATA 1908</h1>
            <HeaderButton />
        </header>
    );
}