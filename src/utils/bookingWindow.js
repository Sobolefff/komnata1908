import moment from 'moment';

const THURSDAY = 4;
const SATURDAY = 6;

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// Бронь принимаем только на ближайший блок четверг-пятница-суббота:
// если сегодня раньше четверга — берём четверг текущей недели,
// если сегодня уже чт/пт/сб — можно выбрать любой день от сегодня до субботы.
export const getBookingWindow = () => {
    const today = moment().startOf('day');
    const thursday = moment().day(THURSDAY).startOf('day');
    const saturday = moment().day(SATURDAY).startOf('day');
    const min = moment.max(today, thursday);
    return { min, max: saturday };
};

export const getAvailableDates = (closedDates = []) => {
    const { min, max } = getBookingWindow();
    const dates = [];
    const cursor = min.clone();
    while (cursor.isSameOrBefore(max)) {
        if (!closedDates.includes(cursor.format('YYYY-MM-DD'))) {
            dates.push(cursor.clone());
        }
        cursor.add(1, 'day');
    }
    return dates;
};

export const getCalendarDays = () => {
    const { min } = getBookingWindow();
    const gridStart = min.clone().startOf('month').startOf('isoWeek');
    const gridEnd = min.clone().endOf('month').endOf('isoWeek');
    const days = [];
    const cursor = gridStart.clone();
    while (cursor.isSameOrBefore(gridEnd)) {
        days.push(cursor.clone());
        cursor.add(1, 'day');
    }
    return days;
};

export const getDefaultBookingDate = (closedDates = []) => {
    const [first] = getAvailableDates(closedDates);
    return first ? first.format('YYYY-MM-DD') : null;
};

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
