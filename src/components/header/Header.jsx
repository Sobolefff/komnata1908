import HeaderButton from '../header-button/HeaderButton';
import styles from './header.module.css';
import tgPath from '../../images/icons/tg.png';
import instPath from '../../images/icons/inst.png';
import waPath from '../../images/icons/wa.png';

export default function Header() {
    return (
        <header className={styles.header}>
            <ul className={styles.social}>
                <li className={styles.icon}><a href="https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=" target="blank"><img src={instPath} alt="иконка инстаграм" /></a></li>
                <li className={styles.icon}><a href="https://t.me/komnata1908" target="blank"><img src={tgPath} alt="" /></a></li>
                <li className={styles.icon}><a href="whatsapp://send?phone=79650726145" target="blank"><img src={waPath} alt="" /></a></li>
            </ul>
            <h1 className={styles.title}>KOMNATA 1908</h1>
            <HeaderButton />
        </header>
    );
}