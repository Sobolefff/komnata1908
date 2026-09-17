import 'moment/locale/ru';
import { Feedback } from '../feedback/Feedback';
import { useFeedbackForm } from '../../hooks/useFeedbackForm';
import { ContactFields } from './ContactFields';
import { DateField } from './DateField';
import { TimeField } from './TimeField';
import { GuestsField } from './GuestsField';
import { SubmitButton } from './SubmitButton';
import styles from './feedbackForm.module.css';

export default function FeedbackForm() {
    const {
        name,
        tel,
        bookingOptions,
        formValid,
        buttonText,
        submitError,
        handleSubmit,
    } = useFeedbackForm();

    return (
        <Feedback>
            <form
                onSubmit={handleSubmit}
                id="feedback-form"
                name="avatar-save"
                className={styles.form}
            >
                <ContactFields name={name} tel={tel} />
                <fieldset className={styles.optionsContainer}>
                    <DateField
                        value={bookingOptions.options.date}
                        onChange={bookingOptions.setDate}
                    />
                    <TimeField
                        value={bookingOptions.options.time}
                        onChange={bookingOptions.setTime}
                    />
                    <GuestsField
                        value={bookingOptions.options.guests}
                        onChange={bookingOptions.setGuests}
                    />
                </fieldset>
                <SubmitButton
                    disabled={!formValid}
                    buttonText={buttonText}
                    submitError={submitError}
                />
            </form>
        </Feedback>
    );
}
