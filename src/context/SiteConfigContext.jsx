import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchConfig } from '../utils/adminApi';
import { DEFAULT_BOOKING_CONFIG } from '../utils/bookingWindow';

export const DEFAULT_SITE_CONFIG = {
    links: {
        instagram: 'https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=',
        telegram: 'https://t.me/komnata1908',
        whatsapp: 'whatsapp://send?phone=79650726145',
    },
    booking: DEFAULT_BOOKING_CONFIG,
};

function isWeekdayArray(value) {
    return Array.isArray(value) && value.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

function isWeekOverride(value) {
    return value === null || isWeekdayArray(value);
}

function isDateOverrides(value) {
    return (
        !!value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.entries(value).every(([key, v]) => /^\d{4}-\d{2}-\d{2}$/.test(key) && typeof v === 'boolean')
    );
}

// Каждое поле нормализуется независимо: старый/повреждённый/отсутствующий
// кусок конфига не должен затирать соседние корректные поля (например,
// самый первый формат хранил только closedDates, следующий - openWeekdays
// на верхнем уровне; оба должны тихо откатываться на дефолт, не теряя links).
function normalizeConfig(data) {
    const links =
        data && data.links && ['instagram', 'telegram', 'whatsapp'].every((key) => typeof data.links[key] === 'string')
            ? data.links
            : DEFAULT_SITE_CONFIG.links;

    const rawBooking = (data && data.booking) || data || {};
    const booking = {
        openWeekdays: isWeekdayArray(rawBooking.openWeekdays) ? rawBooking.openWeekdays : DEFAULT_BOOKING_CONFIG.openWeekdays,
        allowFutureWeeks:
            typeof rawBooking.allowFutureWeeks === 'boolean' ? rawBooking.allowFutureWeeks : DEFAULT_BOOKING_CONFIG.allowFutureWeeks,
        weekOverrides: {
            current: isWeekOverride(rawBooking.weekOverrides && rawBooking.weekOverrides.current)
                ? rawBooking.weekOverrides.current
                : DEFAULT_BOOKING_CONFIG.weekOverrides.current,
            next: isWeekOverride(rawBooking.weekOverrides && rawBooking.weekOverrides.next)
                ? rawBooking.weekOverrides.next
                : DEFAULT_BOOKING_CONFIG.weekOverrides.next,
        },
        dateOverrides: isDateOverrides(rawBooking.dateOverrides) ? rawBooking.dateOverrides : DEFAULT_BOOKING_CONFIG.dateOverrides,
    };

    return { links, booking };
}

const SiteConfigContext = createContext({
    ...DEFAULT_SITE_CONFIG,
    loading: true,
    refresh: () => {},
});

export function SiteConfigProvider({ children }) {
    const [config, setConfig] = useState(DEFAULT_SITE_CONFIG);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(() => {
        setLoading(true);
        fetchConfig()
            .then((data) => setConfig(normalizeConfig(data)))
            .catch((err) => {
                console.warn('Не удалось загрузить конфиг сайта, используются значения по умолчанию', err);
                setConfig(DEFAULT_SITE_CONFIG);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const value = useMemo(() => ({ ...config, loading, refresh }), [config, loading, refresh]);

    return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export const useSiteConfig = () => useContext(SiteConfigContext);
