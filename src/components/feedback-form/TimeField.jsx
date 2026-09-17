import clockPath from '../../images/icons/clock.png';
import { useDropdown } from '../../hooks/useDropdown';
import { timeOptions } from '../../utils/times';
import styles from './feedbackForm.module.css';

export function TimeField({ value, onChange }) {
    const { ref, isOpen, toggle } = useDropdown();

    return (
        <label className={styles.inputLabel}>
            <img src={clockPath} alt="иконка часов" className={styles.icon} />
            <div className={styles.dropDown} ref={ref}>
                <button
                    type="button"
                    onClick={toggle}
                    className={styles.dropDownButton}
                >
                    {value}
                </button>
                {isOpen && (
                    <ul className={styles.dropDownList}>
                        {timeOptions.map((t) => (
                            <li
                                key={t.id}
                                onClick={() => onChange(t.time)}
                                className={styles.dropDownItem}
                            >
                                {t.time}
                            </li>
                        ))}
                    </ul>
                )}
                <input
                    type="text"
                    name="Time"
                    value={value}
                    readOnly
                    className={styles.hiddenInput}
                />
            </div>
        </label>
    );
}
