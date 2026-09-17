import { reachGoal } from '../../utils/analytics';
import styles from './feedbackForm.module.css';

export function SubmitButton({ disabled, buttonText, submitError }) {
    return (
        <fieldset className={styles.submitContainer}>
            <button
                disabled={disabled}
                onClick={() => reachGoal('submit-click')}
                id="form-submit"
                type="submit"
                className={styles.submitButton}
            >
                {buttonText}
            </button>
            {submitError && <span className={styles.error}>{submitError}</span>}
        </fieldset>
    );
}
