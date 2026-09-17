import { ALL_WEEKDAYS, WEEKDAY_LABELS, WEEKDAY_VALUES } from '../../utils/bookingWindow';
import styles from './admin.module.css';

export default function WeekOverrideEditor({ label, hint, override, onChange }) {
    const enabled = Array.isArray(override);

    const toggleEnabled = () => onChange(enabled ? null : ALL_WEEKDAYS);

    const toggleDay = (dayNum) => {
        onChange(override.includes(dayNum) ? override.filter((d) => d !== dayNum) : [...override, dayNum]);
    };

    return (
        <section className={styles.section}>
            <h2>{label}</h2>
            <p className={styles.hint}>{hint}</p>
            <label className={styles.checkboxRow}>
                <input type="checkbox" checked={enabled} onChange={toggleEnabled} />
                Задать вручную для этой недели (вместо общего расписания)
            </label>
            {enabled && (
                <div className={styles.daysGrid}>
                    {WEEKDAY_LABELS.map((dayLabel, i) => {
                        const dayNum = WEEKDAY_VALUES[i];
                        const isOpen = override.includes(dayNum);
                        return (
                            <button
                                type="button"
                                key={dayNum}
                                onClick={() => toggleDay(dayNum)}
                                className={[styles.dayToggle, isOpen && styles.dayOpen].filter(Boolean).join(' ')}
                            >
                                {dayLabel}
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
