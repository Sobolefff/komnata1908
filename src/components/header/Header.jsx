import HeaderButton from '../header-button/HeaderButton';
import styles from './header.module.css';

export default function Header() {
    return (
        <header className={styles.header}>
            <h1 className={styles.title}>KOMNATA 1908</h1>
            <HeaderButton />
        </header>
    );
}