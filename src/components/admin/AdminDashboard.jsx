import { useEffect, useState } from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { saveConfig } from '../../utils/adminApi';
import LinksEditor from './LinksEditor';
import ClosedDaysEditor from './ClosedDaysEditor';
import PasswordEditor from './PasswordEditor';
import styles from './admin.module.css';

export default function AdminDashboard({ token, onLogout }) {
    const { links, closedDates, loading, refresh } = useSiteConfig();
    const [draft, setDraft] = useState({ links, closedDates });
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!loading) setDraft({ links, closedDates });
    }, [loading, links, closedDates]);

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
            <ClosedDaysEditor
                closedDates={draft.closedDates}
                onChange={(closedDates) => setDraft((prev) => ({ ...prev, closedDates }))}
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
