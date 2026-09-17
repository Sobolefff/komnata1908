import { WEEKDAY_LABELS, WEEKDAY_VALUES } from '../../utils/bookingWindow';
import styles from './admin.module.css';

export default function WeekdaysEditor({ openWeekdays, onChange }) {
    const toggle = (dayNum) => {
        if (openWeekdays.includes(dayNum)) {
            onChange(openWeekdays.filter((d) => d !== dayNum));
        } else {
            onChange([...openWeekdays, dayNum]);
        }
    };

    return (
        <section className={styles.section}>
            <h2>Дни недели для брони</h2>
            <p className={styles.hint}>
                Выберите дни недели, по которым принимаются заявки. Действует для всех недель вперёд, без привязки к датам.
            </p>
            <div className={styles.daysGrid}>
                {WEEKDAY_LABELS.map((label, i) => {
                    const dayNum = WEEKDAY_VALUES[i];
                    const isOpen = openWeekdays.includes(dayNum);
                    return (
                        <button
                            type="button"
                            key={dayNum}
                            onClick={() => toggle(dayNum)}
                            className={[styles.dayToggle, isOpen && styles.dayOpen].filter(Boolean).join(' ')}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
