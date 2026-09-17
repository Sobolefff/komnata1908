import moment from 'moment';
import { useMemo } from 'react';
import styles from './admin.module.css';

const BOOKABLE_WEEKDAYS = [4, 5, 6]; // Чт, Пт, Сб
const WEEKS_AHEAD = 8;

function getUpcomingBookableDays() {
    const days = [];
    const cursor = moment().startOf('day');
    const end = moment().add(WEEKS_AHEAD, 'weeks');
    while (cursor.isSameOrBefore(end)) {
        if (BOOKABLE_WEEKDAYS.includes(cursor.day())) days.push(cursor.clone());
        cursor.add(1, 'day');
    }
    return days;
}

export default function ClosedDaysEditor({ closedDates, onChange }) {
    const days = useMemo(getUpcomingBookableDays, []);

    const toggle = (dateStr) => {
        if (closedDates.includes(dateStr)) {
            onChange(closedDates.filter((d) => d !== dateStr));
        } else {
            onChange([...closedDates, dateStr]);
        }
    };

    return (
        <section className={styles.section}>
            <h2>Дни для брони</h2>
            <p className={styles.hint}>
                Заявки принимаются только по чт/пт/сб. Отметьте дни, которые нужно закрыть для брони.
            </p>
            <div className={styles.daysGrid}>
                {days.map((day) => {
                    const dateStr = day.format('YYYY-MM-DD');
                    const isClosed = closedDates.includes(dateStr);
                    return (
                        <button
                            type="button"
                            key={dateStr}
                            onClick={() => toggle(dateStr)}
                            className={[styles.dayToggle, isClosed && styles.dayClosed].filter(Boolean).join(' ')}
                        >
                            {day.format('dd, DD.MM')}
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
