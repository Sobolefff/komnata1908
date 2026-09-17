import { useEffect, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getAvailableDates, getDefaultBookingDate } from '../utils/bookingWindow';

const defaultOptions = (closedDates) => ({
    date: getDefaultBookingDate(closedDates),
    time: '20:00',
    guests: '1',
});

export function useBookingOptions() {
    const { closedDates } = useSiteConfig();
    const [options, setOptions] = useState(() => defaultOptions(closedDates));

    useEffect(() => {
        setOptions((prev) => {
            const availableDates = getAvailableDates(closedDates).map((d) => d.format('YYYY-MM-DD'));
            if (prev.date && availableDates.includes(prev.date)) return prev;
            return { ...prev, date: getDefaultBookingDate(closedDates) };
        });
    }, [closedDates]);

    const setDate = (date) => setOptions((prev) => ({ ...prev, date }));
    const setTime = (time) => setOptions((prev) => ({ ...prev, time }));
    const setGuests = (guests) => setOptions((prev) => ({ ...prev, guests }));
    const reset = () => setOptions(defaultOptions(closedDates));

    return { options, setDate, setTime, setGuests, reset };
}
