import styles from './footer.module.css';
import tgPath from '../../images/icons/tg.png';
import instPath from '../../images/icons/inst.png';
import waPath from '../../images/icons/wa.png';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.border}></div>
            <ul className={styles.social}>
                <li className={styles.icon}><a href=""><img src={instPath} alt="" /></a></li>
                <li className={styles.icon}><a href=""><img src={tgPath} alt="" /></a></li>
                <li className={styles.icon}><a href=""><img src={waPath} alt="" /></a></li>
            </ul>
            <copyright className={styles.copyright}>© 2022. Komnata 1908. ВСЕ ПРАВА ЗАЩИЩЕНЫ</copyright>
        </footer>
    )
}