import moment from 'moment';

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
// moment's day() is locale-independent: 0 = Sunday ... 6 = Saturday.
export const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];
export const ALL_WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export const DEFAULT_BOOKING_CONFIG = {
    openWeekdays: ALL_WEEKDAYS,
    weekOverrides: { current: null, next: null },
    dateOverrides: {},
};

const MAX_SEARCH_DAYS = 730; // safety cap so "infinite weeks ahead" can't loop forever

// Недельный цикл понедельник-воскресенье (isoWeek — не зависит от локали),
// используемый как единица отсчёта для "текущая неделя" / "следующая
// неделя" — тот же порядок дней, что в WEEKDAY_LABELS и в сетке календаря.
function weekIndexOf(date) {
    const cycleStart = moment().startOf('isoWeek');
    return Math.floor(date.diff(cycleStart, 'days') / 7);
}

export function isDateBookable(date, booking = DEFAULT_BOOKING_CONFIG) {
    const today = moment().startOf('day');
    if (date.isBefore(today, 'day')) return false;

    const dateStr = date.format('YYYY-MM-DD');
    if (Object.prototype.hasOwnProperty.call(booking.dateOverrides || {}, dateStr)) {
        return !!booking.dateOverrides[dateStr];
    }

    const weekIndex = weekIndexOf(date);
    const weekOverride = weekIndex === 0 ? booking.weekOverrides.current : weekIndex === 1 ? booking.weekOverrides.next : null;
    if (Array.isArray(weekOverride)) return weekOverride.includes(date.day());

    return (booking.openWeekdays || ALL_WEEKDAYS).includes(date.day());
}

export const getDefaultBookingDate = (booking = DEFAULT_BOOKING_CONFIG) => {
    const cursor = moment().startOf('day');
    for (let i = 0; i < MAX_SEARCH_DAYS; i++) {
        if (isDateBookable(cursor, booking)) return cursor.format('YYYY-MM-DD');
        cursor.add(1, 'day');
    }
    return null;
};

export const getCalendarDays = (monthAnchor) => {
    const gridStart = monthAnchor.clone().startOf('month').startOf('isoWeek');
    const gridEnd = monthAnchor.clone().endOf('month').endOf('isoWeek');
    const days = [];
    const cursor = gridStart.clone();
    while (cursor.isSameOrBefore(gridEnd)) {
        days.push(cursor.clone());
        cursor.add(1, 'day');
    }
    return days;
};

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
