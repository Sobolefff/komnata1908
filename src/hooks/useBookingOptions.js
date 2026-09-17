import { useState } from 'react';
import { getDefaultBookingDate } from '../utils/bookingWindow';

const defaultOptions = () => ({
    date: getDefaultBookingDate(),
    time: '20:00',
    guests: '1',
});

export function useBookingOptions() {
    const [options, setOptions] = useState(defaultOptions);

    const setDate = (date) => setOptions((prev) => ({ ...prev, date }));
    const setTime = (time) => setOptions((prev) => ({ ...prev, time }));
    const setGuests = (guests) => setOptions((prev) => ({ ...prev, guests }));
    const reset = () => setOptions(defaultOptions());

    return { options, setDate, setTime, setGuests, reset };
}
