import styles from './drinks.module.css';
import cocktailPath from '../../images/cocktail.webp'

export default function Drinks() {
    return (
        <section className={styles.drinks}>
            <img className={styles.image} src={cocktailPath} alt="Авторский коктейль в секретном баре Komnata 1908" loading="lazy" width="445" height="583" />
            <div className={styles.text}>
                <h2 className={styles.title}>Авторские коктейли и эксклюзивные закуски</h2>
                <p className={styles.paragraph}>
                    Напитки, которые мы подаём, рождают массу теорий. Их нет в меню, и каждый бокал — это тайна со своей историей. 
                    Но наши опытные бармены готовы исполнить ваши желания и сотворить чудо, смешав напиток в соответствии с вашими предпочтениями.
                    Насладиться тайной сполна и не потерять голову от открытий помогут наши эксклюзивные закуски.
                </p>
                <p className={styles.paragraph}>
                    Заполните форму ниже, а мы перезвоним вам и расскажем, как к нам попасть.
                </p>
            </div>
        </section>
    )
}