import { useEffect, useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { saveConfig } from '../../utils/adminApi';
import LinksEditor from './LinksEditor';
import WeekdaysEditor from './WeekdaysEditor';
import FutureWeeksToggle from './FutureWeeksToggle';
import WeekOverrideEditor from './WeekOverrideEditor';
import DateExceptionsEditor from './DateExceptionsEditor';
import PasswordEditor from './PasswordEditor';
import styles from './admin.module.css';

export default function AdminDashboard({ token, onLogout }) {
    const { links, booking, loading, refresh } = useSiteConfig();
    const [draft, setDraft] = useState({ links, booking });
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) setDraft({ links, booking });
    }, [loading, links, booking]);

    const updateBooking = (patch) => setDraft((prev) => ({ ...prev, booking: { ...prev.booking, ...patch } }));

    const handleSave = () => {
        setSaving(true);
        setStatus('');
        saveConfig(token, draft)
            .then(() => {
                setStatus('Сохранено');
                refresh();
            })
            .catch((err) => {
                if (err.message === 'unauthorized') return onLogout();
                setStatus('Не удалось сохранить');
            })
            .finally(() => setSaving(false));
    };

    if (loading) return <p className={styles.hint}>Загрузка...</p>;

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1>Админка Komnata 1908</h1>
                <button type="button" onClick={onLogout} className={styles.logout}>
                    Выйти
                </button>
            </div>

            <LinksEditor links={draft.links} onChange={(links) => setDraft((prev) => ({ ...prev, links }))} />

            <WeekdaysEditor openWeekdays={draft.booking.openWeekdays} onChange={(openWeekdays) => updateBooking({ openWeekdays })} />

            <FutureWeeksToggle
                allowFutureWeeks={draft.booking.allowFutureWeeks}
                onChange={(allowFutureWeeks) => updateBooking({ allowFutureWeeks })}
            />

            <WeekOverrideEditor
                label="Эта неделя"
                hint="Переопределить общее расписание только для текущей недели."
                override={draft.booking.weekOverrides.current}
                onChange={(current) => updateBooking({ weekOverrides: { ...draft.booking.weekOverrides, current } })}
            />

            <WeekOverrideEditor
                label="Следующая неделя"
                hint="Переопределить общее расписание только для следующей недели."
                override={draft.booking.weekOverrides.next}
                onChange={(next) => updateBooking({ weekOverrides: { ...draft.booking.weekOverrides, next } })}
            />

            <DateExceptionsEditor
                dateOverrides={draft.booking.dateOverrides}
                onChange={(dateOverrides) => updateBooking({ dateOverrides })}
            />

            <div className={styles.saveBar}>
                <button type="button" onClick={handleSave} disabled={saving}>
                    {saving ? 'Сохранение...' : 'Сохранить изменения'}
                </button>
                {status && <span className={styles.status}>{status}</span>}
            </div>

            <PasswordEditor token={token} onUnauthorized={onLogout} />
        </div>
    );
}
