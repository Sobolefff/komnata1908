import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utm } from 'utm-extractor';
import { reachGoal } from '../utils/analytics';
import { submitBooking, submitToSheet } from '../utils/bookingApi';
import { toPlainPhone } from '../utils/phoneMask';
import { validateName } from '../utils/validators';
import { useBookingOptions } from './useBookingOptions';
import { usePhoneField } from './usePhoneField';
import { useValidatedField } from './useValidatedField';

const SUBMIT_ERROR_MESSAGE =
    'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram/WhatsApp.';

export function useFeedbackForm() {
    const navigate = useNavigate();
    const bookingOptions = useBookingOptions();
    const name = useValidatedField('Заполните имя', validateName);
    const tel = usePhoneField('Заполните телефон');

    const [formValid, setFormValid] = useState(false);
    const [buttonText, setButtonText] = useState('Оставить заявку');
    const [submitError, setSubmitError] = useState('');

    useEffect(() => {
        const isValid = !name.error && !tel.error;
        setFormValid(isValid);
        if (isValid) {
            reachGoal('name-tel');
        }
    }, [name.error, tel.error]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setFormValid(false);
        setSubmitError('');
        setButtonText('Отправка...');

        const url = document.location.href.split('#')[0];
        const utmValues = new Utm(url).get();

        submitToSheet(e.target);
        submitBooking({
            name: name.value,
            tel: toPlainPhone(tel.value),
            date: bookingOptions.options.date,
            time: bookingOptions.options.time,
            guests: bookingOptions.options.guests,
            utm: new URL(url).search ? utmValues : undefined,
        })
            .then(() => {
                navigate('/thanks');
                setButtonText('Оставить заявку');
            })
            .catch((err) => {
                console.warn(err);
                setButtonText('Оставить заявку');
                setFormValid(true);
                setSubmitError(SUBMIT_ERROR_MESSAGE);
            })
            .finally(() => {
                reachGoal('form-submit');
            });

        bookingOptions.reset();
    };

    return { name, tel, bookingOptions, formValid, buttonText, submitError, handleSubmit };
}
