import moment from 'moment';
import { useMemo, useState } from 'react';
import calendarPath from '../../images/icons/calendar.png';
import { useDropdown } from '../../hooks/useDropdown';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { WEEKDAY_LABELS, capitalize, getCalendarDays, getDefaultBookingDate, isDateBookable, shortWeekdayLabel } from '../../utils/bookingWindow';
import styles from './feedbackForm.module.css';

const YEARS_AHEAD = 2;

function clampMonth(month, minMonth, maxMonth) {
    if (month.isBefore(minMonth, 'month')) return minMonth.clone();
    if (month.isAfter(maxMonth, 'month')) return maxMonth.clone();
    return month;
}

export function DateField({ value, onChange }) {
    const { ref, isOpen, toggle } = useDropdown();
    const { booking } = useSiteConfig();
    const today = moment().startOf('day');
    const minMonth = today.clone().startOf('month');
    const maxMonth = today.clone().add(YEARS_AHEAD, 'years').endOf('year').startOf('month');

    const [viewedMonth, setViewedMonth] = useState(() =>
        clampMonth((value ? moment(value) : today).clone().startOf('month'), minMonth, maxMonth)
    );

    const days = useMemo(() => getCalendarDays(viewedMonth), [viewedMonth]);
    const hasAnyAvailability = useMemo(() => getDefaultBookingDate(booking) !== null, [booking]);
    const monthNames = useMemo(() => moment.localeData().months(), []);
    const yearOptions = useMemo(() => {
        const years = [];
        for (let y = today.year(); y <= today.year() + YEARS_AHEAD; y++) years.push(y);
        return years;
    }, [today]);

    const goToMonth = (next) => setViewedMonth(clampMonth(next, minMonth, maxMonth));

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
                    {value ? `${shortWeekdayLabel(moment(value).day())}, ${moment(value).format('DD.MM')}` : 'Выберите дату'}
                </button>
                {isOpen && (
                    <div className={styles.calendar}>
                        <div className={styles.calendarNav}>
                            <button
                                type="button"
                                className={styles.calendarNavButton}
                                onClick={() => goToMonth(viewedMonth.clone().subtract(1, 'month'))}
                                disabled={viewedMonth.isSame(minMonth, 'month')}
                                aria-label="Предыдущий месяц"
                            >
                                ‹
                            </button>
                            <select
                                className={styles.calendarSelect}
                                value={viewedMonth.month()}
                                onChange={(e) => goToMonth(viewedMonth.clone().month(Number(e.target.value)))}
                            >
                                {monthNames.map((name, i) => (
                                    <option key={name} value={i}>
                                        {capitalize(name)}
                                    </option>
                                ))}
                            </select>
                            <select
                                className={styles.calendarSelect}
                                value={viewedMonth.year()}
                                onChange={(e) => goToMonth(viewedMonth.clone().year(Number(e.target.value)))}
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="button"
                                className={styles.calendarNavButton}
                                onClick={() => goToMonth(viewedMonth.clone().add(1, 'month'))}
                                disabled={viewedMonth.isSame(maxMonth, 'month')}
                                aria-label="Следующий месяц"
                            >
                                ›
                            </button>
                        </div>
                        <div className={styles.calendarWeekdays}>
                            {WEEKDAY_LABELS.map((d) => (
                                <span key={d}>{d}</span>
                            ))}
                        </div>
                        <div className={styles.calendarGrid}>
                            {days.map((day) => {
                                const dateStr = day.format('YYYY-MM-DD');
                                const isAvailable = isDateBookable(day, booking);
                                const isCurrentMonth = day.month() === viewedMonth.month();
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
                        {!hasAnyAvailability && (
                            <div className={styles.calendarEmptyHint}>Сейчас нет доступных дат для брони</div>
                        )}
                    </div>
                )}
                <input
                    type="text"
                    name="Data"
                    value={value || ''}
                    readOnly
                    className={styles.hiddenInput}
                />
            </div>
        </label>
    );
}
