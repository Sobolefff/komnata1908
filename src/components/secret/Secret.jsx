import styles from './secret.module.css'

export default function Secret() {
    return (
        <section className={styles.secret}>
            <p className={styles.paragraph}>Мы не станем использовать ваши личные данные в рекламных целях и передавать их третьим лицам.</p>
        </section>
    )
}