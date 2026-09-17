import moment from 'moment';

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
// moment's day() is locale-independent: 0 = Sunday ... 6 = Saturday.
export const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

export const DEFAULT_OPEN_WEEKDAYS = [4, 5, 6]; // Чт, Пт, Сб

// Бронь принимаем только на дни недели, включённые в openWeekdays, и только
// в пределах текущего недельного цикла (воскресенье-суббота), начиная с
// сегодня: следующий цикл открывается сам собой, когда наступает его
// воскресенье, так что это работает бессрочно, неделя за неделей.
export const getAvailableDates = (openWeekdays = DEFAULT_OPEN_WEEKDAYS) => {
    const today = moment().startOf('day');
    const cycleEnd = moment().day(6).startOf('day');
    const dates = [];
    const cursor = today.clone();
    while (cursor.isSameOrBefore(cycleEnd, 'day')) {
        if (openWeekdays.includes(cursor.day())) {
            dates.push(cursor.clone());
        }
        cursor.add(1, 'day');
    }
    return dates;
};

export const getDefaultBookingDate = (openWeekdays = DEFAULT_OPEN_WEEKDAYS) => {
    const [first] = getAvailableDates(openWeekdays);
    return first ? first.format('YYYY-MM-DD') : null;
};

export const getCalendarDays = (openWeekdays = DEFAULT_OPEN_WEEKDAYS) => {
    const [firstAvailable] = getAvailableDates(openWeekdays);
    const anchor = firstAvailable || moment().startOf('day');
    const gridStart = anchor.clone().startOf('month').startOf('isoWeek');
    const gridEnd = anchor.clone().endOf('month').endOf('isoWeek');
    const days = [];
    const cursor = gridStart.clone();
    while (cursor.isSameOrBefore(gridEnd)) {
        days.push(cursor.clone());
        cursor.add(1, 'day');
    }
    return days;
};

export const getCalendarAnchor = (openWeekdays = DEFAULT_OPEN_WEEKDAYS) => {
    const [firstAvailable] = getAvailableDates(openWeekdays);
    return firstAvailable || moment().startOf('day');
};

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
