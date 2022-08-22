import styles from './secret.module.css'

export default function Secret() {
    return (
        <section className={styles.secret}>
            <p className={styles.paragraph}>Если не спросить — никогда не узнаешь, если знаешь — нужно лишь спросить.</p>
        </section>
    )
}