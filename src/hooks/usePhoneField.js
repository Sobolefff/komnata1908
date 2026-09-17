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

    // Backspace/Delete рядом с литералом маски ")", "-", " " по умолчанию
    // стирает сам литерал, а не цифру — formatPhone тут же восстанавливает
    // его обратно, и кажется, что нажатие вообще ни на что не повлияло.
    // Здесь ищем ближайшую цифру в нужную сторону и удаляем её саму.
    const removeDigitAndReformat = (digitIndex, digitsBeforeAnchor) => {
        const rawWithoutDigit = value.slice(0, digitIndex) + value.slice(digitIndex + 1);
        const digitCount = getPhoneDigits(value.slice(0, digitsBeforeAnchor)).length;
        const formatted = formatPhone(rawWithoutDigit);

        pendingCaret.current =
            digitCount === 0 ? formatted.length : CARET_POSITION_AFTER_DIGITS[digitCount];
        setValue(formatted);
        setError(getPhoneDigits(formatted).length === 10 ? '' : PHONE_ERROR);
    };

    const onKeyDown = (e) => {
        const el = e.target;
        if (el.selectionStart !== el.selectionEnd) return;
        const caret = el.selectionStart;

        if (e.key === 'Backspace' && caret > 0 && !/\d/.test(value[caret - 1])) {
            let digitIndex = caret - 1;
            while (digitIndex >= 0 && !/\d/.test(value[digitIndex])) digitIndex -= 1;
            if (digitIndex < 0) return;
            e.preventDefault();
            removeDigitAndReformat(digitIndex, digitIndex);
        } else if (e.key === 'Delete' && caret < value.length && !/\d/.test(value[caret])) {
            let digitIndex = caret;
            while (digitIndex < value.length && !/\d/.test(value[digitIndex])) digitIndex += 1;
            if (digitIndex >= value.length) return;
            e.preventDefault();
            removeDigitAndReformat(digitIndex, caret);
        }
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

    return { value, dirty, error, inputRef, onChange, onKeyDown, onFocus, onBlur };
}
