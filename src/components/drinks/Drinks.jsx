import styles from './drinks.module.css';
import cocktailPath from '../../images/cocktail.jpg'

export default function Drinks() {
    return (
        <section className={styles.drinks}>
            <img className={styles.image} src={cocktailPath} alt="коктейль" />
            <div className={styles.text}>
                <p className={styles.paragraph}>
                    Напитки, которые мы подаём, рождают массу теорий. Их нет в меню, и каждый бокал — это тайна со своей историей. 
                    Но наши опытные бармены готовы исполнить ваши желания и сотворить чудо, смешав напиток в соответствии с вашими предпочтениями.
                </p>
                <p className={styles.paragraph}>
                        Насладиться тайной сполна и не потерять голову от открытий помогут наши эксклюзивные закуски.
                </p>
            </div>
        </section>
    )
}