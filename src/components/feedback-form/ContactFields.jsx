import styles from './feedbackForm.module.css';

export function ContactFields({ name, tel }) {
    return (
        <fieldset className={styles.inputContainer}>
            <label className={styles.textLabel}>
                <input
                    autoComplete="off"
                    id="add-name"
                    type="text"
                    name="Name"
                    placeholder="Имя"
                    value={name.value}
                    onChange={name.onChange}
                    onBlur={name.onBlur}
                    className={styles.textInput}
                />
                {name.dirty && name.error && (
                    <span className={styles.error}>{name.error}</span>
                )}
            </label>
            <label className={styles.textLabel}>
                <input
                    ref={tel.inputRef}
                    autoComplete="off"
                    type="tel"
                    inputMode="tel"
                    name="Tel"
                    placeholder="+7 (___) ___-__-__"
                    value={tel.value}
                    onChange={tel.onChange}
                    onFocus={tel.onFocus}
                    onBlur={tel.onBlur}
                    className={styles.textInput}
                />
                {tel.dirty && tel.error && (
                    <span className={styles.error}>{tel.error}</span>
                )}
            </label>
        </fieldset>
    );
}
