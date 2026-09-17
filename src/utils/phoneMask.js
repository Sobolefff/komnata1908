// Форматирует ввод в маску телефона вида +7 (XXX) XXX-XX-XX.
// Сначала убирает сам литерал "+7" (он не цифры, набранные пользователем,
// а часть шаблона), затем — привычный, но лишний код 7/8, если его всё
// же напечатали поверх шаблона. Дальше идут ровно 10 значащих цифр.
export const getPhoneDigits = (rawValue) => {
    const withoutTemplate = rawValue.startsWith('+7') ? rawValue.slice(2) : rawValue;
    let digits = withoutTemplate.replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) {
        digits = digits.slice(1);
    }
    return digits.slice(0, 10);
};

export const formatPhone = (rawValue) => {
    const digits = getPhoneDigits(rawValue);
    if (!digits) {
        // rawValue непустой, но свёлся к нулю значащих цифр (например,
        // напечатали только лишний "8") — оставляем шаблон, а не стираем всё
        return rawValue ? '+7 (' : '';
    }

    let result = '+7';
    result += ' (' + digits.slice(0, 3);
    if (digits.length >= 3) result += ')';
    if (digits.length > 3) result += ' ' + digits.slice(3, 6);
    if (digits.length > 6) result += '-' + digits.slice(6, 8);
    if (digits.length > 8) result += '-' + digits.slice(8, 10);
    return result;
};

// Позиция каретки в отформатированной строке сразу после N-й введённой цифры.
export const CARET_POSITION_AFTER_DIGITS = [0, 5, 6, 8, 10, 11, 12, 14, 15, 17, 19];
