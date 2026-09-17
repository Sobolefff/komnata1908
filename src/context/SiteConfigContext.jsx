import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchConfig } from '../utils/adminApi';

export const DEFAULT_SITE_CONFIG = {
    links: {
        instagram: 'https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=',
        telegram: 'https://t.me/komnata1908',
        whatsapp: 'whatsapp://send?phone=79650726145',
    },
    closedDates: [],
};

function isValidConfig(data) {
    return (
        !!data &&
        typeof data === 'object' &&
        !!data.links &&
        ['instagram', 'telegram', 'whatsapp'].every((key) => typeof data.links[key] === 'string') &&
        Array.isArray(data.closedDates)
    );
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
            .then((data) => {
                if (isValidConfig(data)) {
                    setConfig(data);
                } else {
                    console.warn('Конфиг сайта имеет неожиданный формат, используются значения по умолчанию');
                    setConfig(DEFAULT_SITE_CONFIG);
                }
            })
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
