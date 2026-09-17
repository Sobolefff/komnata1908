import { useLayoutEffect, useRef, useState } from 'react';
import {
    CARET_POSITION_AFTER_DIGITS,
    formatPhone,
    getPhoneDigits,
} from '../utils/phoneMask';

const PHONE_ERROR = 'Введите корректный номер телефона';

const countDigitsBeforeCaret = (rawValue, caret) =>
    getPhoneDigits(rawValue.slice(0, caret)).length;

export function usePhoneField(initialError) {
    const inputRef = useRef(null);
    const pendingCaret = useRef(null);
    const [value, setValue] = useState('');
    const [dirty, setDirty] = useState(false);
    const [error, setError] = useState(initialError);

    useLayoutEffect(() => {
        if (pendingCaret.current !== null && inputRef.current) {
            inputRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
            pendingCaret.current = null;
        }
    }, [value]);

    const onChange = (e) => {
        const raw = e.target.value;
        const caret = e.target.selectionStart ?? raw.length;
        const digitCount = countDigitsBeforeCaret(raw, caret);
        const formatted = formatPhone(raw);

        pendingCaret.current =
            digitCount === 0 ? formatted.length : CARET_POSITION_AFTER_DIGITS[digitCount];
        setValue(formatted);
        setError(getPhoneDigits(formatted).length === 10 ? '' : PHONE_ERROR);
    };

    const onFocus = () => {
        if (!value) {
            pendingCaret.current = 4;
            setValue('+7 (');
        }
    };

    const onBlur = () => {
        setDirty(true);
        if (getPhoneDigits(value).length === 0) {
            setValue('');
        }
    };

    return { value, dirty, error, inputRef, onChange, onFocus, onBlur };
}
