import { useEffect, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getAvailableDates, getDefaultBookingDate } from '../utils/bookingWindow';

const defaultOptions = (openWeekdays) => ({
    date: getDefaultBookingDate(openWeekdays),
    time: '20:00',
    guests: '1',
});

export function useBookingOptions() {
    const { openWeekdays } = useSiteConfig();
    const [options, setOptions] = useState(() => defaultOptions(openWeekdays));

    useEffect(() => {
        setOptions((prev) => {
            const availableDates = getAvailableDates(openWeekdays).map((d) => d.format('YYYY-MM-DD'));
            if (prev.date && availableDates.includes(prev.date)) return prev;
            return { ...prev, date: getDefaultBookingDate(openWeekdays) };
        });
    }, [openWeekdays]);

    const setDate = (date) => setOptions((prev) => ({ ...prev, date }));
    const setTime = (time) => setOptions((prev) => ({ ...prev, time }));
    const setGuests = (guests) => setOptions((prev) => ({ ...prev, guests }));
    const reset = () => setOptions(defaultOptions(openWeekdays));

    return { options, setDate, setTime, setGuests, reset };
}
