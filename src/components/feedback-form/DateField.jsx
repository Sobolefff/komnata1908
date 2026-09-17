import moment from 'moment';
import calendarPath from '../../images/icons/calendar.png';
import { useDropdown } from '../../hooks/useDropdown';
import { useSiteConfig } from '../../context/SiteConfigContext';
import {
    WEEKDAY_LABELS,
    capitalize,
    getAvailableDates,
    getCalendarAnchor,
    getCalendarDays,
} from '../../utils/bookingWindow';
import styles from './feedbackForm.module.css';

export function DateField({ value, onChange }) {
    const { ref, isOpen, toggle } = useDropdown();
    const { openWeekdays } = useSiteConfig();
    const availableDates = getAvailableDates(openWeekdays);
    const anchor = getCalendarAnchor(openWeekdays);

    if (availableDates.length === 0) {
        return (
            <label className={styles.inputLabel}>
                <img
                    className={styles.icon}
                    src={calendarPath}
                    alt="иконка календаря"
                />
                <span className={styles.dropDownButton}>Сейчас нет доступных дат для брони</span>
            </label>
        );
    }

    return (
        <label className={styles.inputLabel}>
            <img
                className={styles.icon}
                src={calendarPath}
                alt="иконка календаря"
            />
            <div className={styles.dropDown} ref={ref}>
                <button
                    type="button"
                    onClick={toggle}
                    className={styles.dropDownButton}
                >
                    {capitalize(moment(value).format('dddd, DD.MM'))}
                </button>
                {isOpen && (
                    <div className={styles.calendar}>
                        <div className={styles.calendarHeader}>
                            {capitalize(anchor.format('MMMM YYYY'))}
                        </div>
                        <div className={styles.calendarWeekdays}>
                            {WEEKDAY_LABELS.map((d) => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className={styles.calendarGrid}>
                            {getCalendarDays(openWeekdays).map((day) => {
                                const dateStr = day.format('YYYY-MM-DD');
                                const isAvailable = availableDates.some((d) =>
                                    d.isSame(day, 'day')
                                );
                                const isCurrentMonth =
                                    day.month() === anchor.month();
                                return (
                                    <button
                                        type="button"
                                        key={dateStr}
                                        disabled={!isAvailable}
                                        onClick={() => onChange(dateStr)}
                                        className={[
                                            styles.calendarDay,
                                            value === dateStr &&
                                                styles.calendarDaySelected,
                                            !isCurrentMonth &&
                                                styles.calendarDayMuted,
                                        ]
                                            .filter(Boolean)
                                            .join(' ')}
                                    >
                                        {day.date()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
                <input
                    type="text"
                    name="Data"
                    value={value}
                    readOnly
                    className={styles.hiddenInput}
                />
            </div>
        </label>
    );
}
