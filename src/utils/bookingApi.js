import axios from 'axios';
import moment from 'moment';

const PROXY_API = 'https://komnata1908-telegram.petr-sobolew.workers.dev';

const SHEET_URL =
    'https://script.google.com/macros/s/AKfycbzZVbb4WWi1NBKlRopRsIZMpt3cE51wnPz6B_RmdZRON2dK63imOeVSZH6eGFoK8u7D/exec';

export const submitToSheet = (formElement) =>
    fetch(SHEET_URL, {
        method: 'POST',
        body: new FormData(formElement),
    });

export const submitBooking = ({ name, tel, date, time, guests, utm }) =>
    axios.post(PROXY_API, {
        name,
        tel,
        date: moment(date).format('ddd DD.MM.YYYY'),
        time,
        guests,
        utm,
    });
