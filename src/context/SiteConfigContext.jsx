import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchConfig } from '../utils/adminApi';
import { DEFAULT_OPEN_WEEKDAYS } from '../utils/bookingWindow';

export const DEFAULT_SITE_CONFIG = {
    links: {
        instagram: 'https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=',
        telegram: 'https://t.me/komnata1908',
        whatsapp: 'whatsapp://send?phone=79650726145',
    },
    openWeekdays: DEFAULT_OPEN_WEEKDAYS,
};

// Принимает конфиг по частям: старое/повреждённое/отсутствующее поле не
// должно затирать корректные соседние поля (например старый формат с
// closedDates вместо openWeekdays всё ещё содержит рабочие links).
function normalizeConfig(data) {
    const links =
        data && data.links && ['instagram', 'telegram', 'whatsapp'].every((key) => typeof data.links[key] === 'string')
            ? data.links
            : DEFAULT_SITE_CONFIG.links;
    const openWeekdays =
        data && Array.isArray(data.openWeekdays) && data.openWeekdays.every((d) => Number.isInteger(d) && d >= 0 && d <= 6)
            ? data.openWeekdays
            : DEFAULT_SITE_CONFIG.openWeekdays;
    return { links, openWeekdays };
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
