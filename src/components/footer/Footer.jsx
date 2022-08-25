import styles from './footer.module.css';
import tgPath from '../../images/icons/tg.png';
import instPath from '../../images/icons/inst.png';
import waPath from '../../images/icons/wa.png';

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.border}></div>
            <ul className={styles.social}>
                <li className={styles.icon}><a href="https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=" target="blank"><img src={instPath} alt="иконка инстаграм" /></a></li>
                <li className={styles.icon}><a href="https://t.me/komnata1908" target="blank"><img src={tgPath} alt="" /></a></li>
                <li className={styles.icon}><a href="whatsapp://send?phone=79650726145" target="blank"><img src={waPath} alt="" /></a></li>
            </ul>
            <copyright className={styles.copyright}>© 2022. Komnata 1908. ВСЕ ПРАВА ЗАЩИЩЕНЫ</copyright>
        </footer>
    )
}