import styles from './admin.module.css';

const FIELDS = [
    { key: 'instagram', label: 'Instagram' },
    { key: 'telegram', label: 'Telegram' },
    { key: 'whatsapp', label: 'WhatsApp' },
];

export default function LinksEditor({ links, onChange }) {
    return (
        <section className={styles.section}>
            <h2>Ссылки в хедере и футере</h2>
            {FIELDS.map(({ key, label }) => (
                <label key={key} className={styles.field}>
                    {label}
                    <input
                        type="text"
                        value={links[key]}
                        onChange={(e) => onChange({ ...links, [key]: e.target.value })}
                    />
                </label>
            ))}
        </section>
    );
}
