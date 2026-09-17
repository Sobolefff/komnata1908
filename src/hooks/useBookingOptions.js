import moment from 'moment';
import { useEffect, useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getDefaultBookingDate, isDateBookable } from '../utils/bookingWindow';

const defaultOptions = (booking) => ({
    date: getDefaultBookingDate(booking),
    time: '20:00',
    guests: '1',
});

export function useBookingOptions() {
    const { booking } = useSiteConfig();
    const [options, setOptions] = useState(() => defaultOptions(booking));

    useEffect(() => {
        setOptions((prev) => {
            if (prev.date && isDateBookable(moment(prev.date), booking)) return prev;
            return { ...prev, date: getDefaultBookingDate(booking) };
        });
    }, [booking]);

    const setDate = (date) => setOptions((prev) => ({ ...prev, date }));
    const setTime = (time) => setOptions((prev) => ({ ...prev, time }));
    const setGuests = (guests) => setOptions((prev) => ({ ...prev, guests }));
    const reset = () => setOptions(defaultOptions(booking));

    return { options, setDate, setTime, setGuests, reset };
}
