import styles from './admin.module.css';

export default function FutureWeeksToggle({ allowFutureWeeks, onChange }) {
    return (
        <section className={styles.section}>
            <h2>Бронирование на будущие недели</h2>
            <p className={styles.hint}>
                Если выключено — бронь принимается только на дни текущей недели, все следующие недели закрыты целиком.
            </p>
            <label className={styles.checkboxRow}>
                <input type="checkbox" checked={allowFutureWeeks} onChange={(e) => onChange(e.target.checked)} />
                Разрешить бронирование на недели после текущей
            </label>
        </section>
    );
}
