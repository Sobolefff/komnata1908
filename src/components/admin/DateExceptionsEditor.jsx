import moment from 'moment';
import { useState } from 'react';
import styles from './admin.module.css';

function formatDateInput(raw) {
    const digits = raw.replace(/\D/g, '').slice(0, 8);
    const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean);
    return parts.join('.');
}

function parseDateInput(text) {
    const parsed = moment(text, 'DD.MM.YYYY', true);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : null;
}

export default function DateExceptionsEditor({ dateOverrides, onChange }) {
    const [text, setText] = useState('');
    const [mode, setMode] = useState('closed');
    const [error, setError] = useState('');

    const entries = Object.entries(dateOverrides).sort(([a], [b]) => a.localeCompare(b));

    const handleAdd = () => {
        const iso = parseDateInput(text);
        if (!iso) {
            setError('Введите дату в формате ДД.ММ.ГГГГ');
            return;
        }
        setError('');
        onChange({ ...dateOverrides, [iso]: mode === 'open' });
        setText('');
    };

    const handleRemove = (iso) => {
        const next = { ...dateOverrides };
        delete next[iso];
        onChange(next);
    };

    return (
        <section className={styles.section}>
            <h2>Отдельные даты</h2>
            <p className={styles.hint}>
                Открыть или закрыть конкретную дату независимо от общего расписания — такая дата всегда в приоритете.
            </p>
            <div className={styles.exceptionForm}>
                <input
                    type="text"
                    placeholder="ДД.ММ.ГГГГ"
                    value={text}
                    onChange={(e) => setText(formatDateInput(e.target.value))}
                    className={styles.exceptionInput}
                />
                <select value={mode} onChange={(e) => setMode(e.target.value)} className={styles.exceptionSelect}>
                    <option value="closed">Закрыть</option>
                    <option value="open">Открыть</option>
                </select>
                <button type="button" onClick={handleAdd}>
                    Добавить
                </button>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {entries.length > 0 && (
                <ul className={styles.exceptionList}>
                    {entries.map(([iso, isOpen]) => (
                        <li key={iso} className={styles.exceptionItem}>
                            <span>{moment(iso, 'YYYY-MM-DD').format('DD.MM.YYYY')}</span>
                            <span className={isOpen ? styles.exceptionOpen : styles.exceptionClosed}>
                                {isOpen ? 'открыто' : 'закрыто'}
                            </span>
                            <button type="button" onClick={() => handleRemove(iso)} className={styles.exceptionRemove}>
                                ×
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
