import userPath from '../../images/icons/user.png';
import { useDropdown } from '../../hooks/useDropdown';
import { guestOptions } from '../../utils/times';
import { guestWordForm } from '../../utils/guestWordForm';
import styles from './feedbackForm.module.css';

export function GuestsField({ value, onChange }) {
    const { ref, isOpen, toggle } = useDropdown();

    return (
        <label className={styles.guests}>
            <img src={userPath} alt="иконка гостя" className={styles.icon} />
            <div className={styles.dropDown} ref={ref}>
                <button
                    type="button"
                    onClick={toggle}
                    className={styles.dropDownButton}
                >
                    {value}
                    <p className={styles.text}>{guestWordForm(value)}</p>
                </button>
                {isOpen && (
                    <ul className={styles.dropDownList}>
                        {guestOptions.map((g) => (
                            <li
                                key={g.id}
                                onClick={() => onChange(g.guests)}
                                className={styles.dropDownItem}
                            >
                                {g.guests}
                            </li>
                        ))}
                    </ul>
                )}
                <input
                    type="text"
                    name="Guests"
                    value={value}
                    readOnly
                    className={styles.hiddenInput}
                />
            </div>
        </label>
    );
}
