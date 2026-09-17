const NAME_RE = /^[а-яА-ЯёЁa-zA-Z'`'\-\s]{2,20}$/;
const TEL_RE = /^((8|\+7)[-]?)?(\(?\d{3}\)?[-]?)?[\d-]{7,10}$/;

export const validateName = (value) =>
    NAME_RE.test(String(value)) ? '' : 'Введите корректное имя от 2 до 20 символов';

export const validateTel = (value) =>
    TEL_RE.test(String(value)) ? '' : 'Введите корректный номер телефона';
