const NAME_RE = /^[а-яА-ЯёЁa-zA-Z'`'\-\s]{2,20}$/;

export const validateName = (value) =>
    NAME_RE.test(String(value)) ? '' : 'Введите корректное имя от 2 до 20 символов';
