import { useEffect, useRef, useState } from 'react';
import styles from './feedbackForm.module.css';
import moment from 'moment';
import 'moment/locale/ru';
import axios from 'axios';
import { Feedback } from '../feedback/Feedback';
import { useNavigate } from 'react-router-dom';
import calendarPath from '../../images/icons/calendar.png';
import clockPath from '../../images/icons/clock.png';
import userPath from '../../images/icons/user.png';
import { data } from '../../utils/times';
import { Utm } from 'utm-extractor';

export default function FeedbackForm() {
    const url = document.location.href.split('#')[0];
    const utm = new Utm(url);
    const utmValues = utm.get();
    const refTime = useRef();
    const refGuests = useRef();
    const timesArr = data.filter((el) => el.type === 'time');
    const times = Array.from(timesArr);
    const guestsArr = data.filter((el) => el.type === 'guest_vol');
    const guests = Array.from(guestsArr);
    const navigate = useNavigate();

    const getToWeekend = () => {
        let weekend = Number(moment().format('d'));
        let sum = 0;
        if (weekend < 5) {
            sum = 5 - weekend; // для открытия четверга - 4, для пт и сб - 5
            return (weekend = moment().add(sum, 'd').format('YYYY-MM-DD'));
        } else return (weekend = moment().format('YYYY-MM-DD'));
    };

    const [options, setOptions] = useState({
        date: getToWeekend(),
        time: '20:00',
        guests: '1',
    });

    const [maxInterval, setMaxInterval] = useState(
        moment(getToWeekend()).add(1, 'd').format('YYYY-MM-DD')
    );
    const [name, setName] = useState('');
    const [tel, setTel] = useState('');
    const [nameDirty, setNameDirty] = useState(false);
    const [telDirty, setTelDirty] = useState(false);
    const [nameError, setNameError] = useState('Заполните имя');
    const [telError, setTelError] = useState('Заполните телефон');
    const [formValid, setFormValid] = useState(false);
    const [dateError, setDateError] = useState('');
    const [buttonText, setButtonText] = useState('Оставить заявку');
    const [showDropDown, setShowDropDown] = useState(false);
    const [showDropDownGuests, setShowDropDownGuests] = useState(false);

    useEffect(() => {
        nameError || telError || dateError
            ? setFormValid(false)
            : setFormValid(true);
        if (!nameError && !telError) {
            window.ym(90093500, 'reachGoal', 'name-tel');
        }
    }, [nameError, telError, dateError]);

    const closeDayHandler = () => {
        const dayOfWeek = moment(options.date);
        // чт/пт/сб или пт/сб
        // setMaxInterval(
        //     dayOfWeek.format('dddd') === 'суббота'
        //         ? dayOfWeek.format('YYYY-MM-DD')
        //         : dayOfWeek.format('dddd') === 'четверг'
        //         ? moment(getToWeekend()).add(2, 'd').format('YYYY-MM-DD')
        //         : dayOfWeek.format('dddd') === 'пятница'
        //         ? moment(getToWeekend()).add(2, 'd').format('YYYY-MM-DD')
        //         : moment(getToWeekend()).add(1, 'd').format('YYYY-MM-DD')
        // );
        setMaxInterval(
            dayOfWeek.format('dddd') === 'суббота'
                ? dayOfWeek.format('YYYY-MM-DD')
                : moment(getToWeekend()).add(1, 'd').format('YYYY-MM-DD')
        );
        if (options.date === '2022-09-09') {
            setDateError('К сожалению, все места заняты');
        } else if (
            dayOfWeek.format('X') < moment(getToWeekend()).format('X') ||
            dayOfWeek.format('X') >
                moment(getToWeekend()).add(1, 'd').format('X') ||
            (moment().format('dddd') === 'суббота' &&
                dayOfWeek.format('X') > moment(getToWeekend()).format('X'))
        ) {
            setDateError(
                'Принимаем бронь только на ближайшую пятницу и субботу'
            );
        } else setDateError('');
    };
    useEffect(() => {
        closeDayHandler();
    }, [options.date]);

    const handlerDate = (e) => {
        setOptions({ ...options, date: e.target.value });
    };
    const handlerFormSubmit = (e) => {
        e.preventDefault();
        setFormValid(false);
        setButtonText('Отправка...');

        const TOKEN = '5418369687:AAHCMy9pCFT7S1-BDWexPZZW1YS11CPd1I8';
        const CHAT_ID = '-1001736786651';
        const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        let message = `<b><i>Заявка с сайта:</i></b>\n\n`;
        message += `<i>Основная информация:</i>\n`;
        message += `Отправитель: <b>${name}</b>\n`;
        message += `Телефон: <b>${tel}</b>\n`;
        message += `Желаемая дата: <b>${moment(options.date).format(
            'ddd DD.MM.YYYY'
        )}</b>\n`;
        message += `Желаемое время: <b>${options.time}</b>\n`;
        message += `Количество гостей: <b>${options.guests}</b>\n\n`;
        if (new URL(url).search) {
            message += `<i>Дополнительная информация:</i>\n`;
            message += `UTM source: <b>${utmValues.utm_source}</b>\n`;
            message += `UTM medium: <b>${utmValues.utm_medium}</b>\n`;
            message += `UTM campaign: <b>${utmValues.utm_campaign}</b>\n`;
            message += `UTM content: <b>${utmValues.utm_content}</b>\n`;
            message += `UTM term: <b>${utmValues.utm_term}</b>\n`;
        }
        const sheetUrl =
            'https://script.google.com/macros/s/AKfycbzZVbb4WWi1NBKlRopRsIZMpt3cE51wnPz6B_RmdZRON2dK63imOeVSZH6eGFoK8u7D/exec';
        const sheetApi = () => {
            fetch(sheetUrl, {
                method: 'POST',
                body: new FormData(e.target),
            });
        };
        sheetApi();
        axios
            .post(URL_API, {
                chat_id: CHAT_ID,
                parse_mode: 'html',
                text: message,
                disable_notification: false,
            })
            .then((res) => {
                navigate('/thanks');
                setButtonText('Оставить заявку');
            })
            .catch((err) => {
                console.warn(err);
            })
            .finally(() => {
                window.ym(90093500, 'reachGoal', 'form-submit');
                console.log('Success');
            });

        setOptions({
            date: getToWeekend(),
            time: '20:00',
            guests: '1',
        });
    };

    const handlerGuestText = () => {
        if (options.guests === '1') {
            return <p className={styles.text}>гость</p>;
        } else {
            return <p className={styles.text}>гостя</p>;
        }
    };

    const blurHandler = (e) => {
        switch (e.target.name) {
            case 'Name':
                setNameDirty(true);
                break;
            case 'Tel':
                setTelDirty(true);
                break;
            default:
                setNameDirty(false);
                setTelDirty(false);
        }
    };

    const nameHandler = (e) => {
        setName(e.target.value);
        const re = /^[а-яА-ЯёЁa-zA-Z'`'\-\s]{2,20}$/;
        if (!re.test(String(e.target.value))) {
            setNameError('Введите корректное имя от 2 до 20 символов');
        } else {
            setNameError('');
        }
    };

    const telHandler = (e) => {
        setTel(e.target.value);
        const re = /^((8|\+7)[\-]?)?(\(?\d{3}\)?[\-]?)?[\d\-]{7,10}$/;
        if (!re.test(String(e.target.value))) {
            setTelError('Введите корректный номер телефона');
        } else {
            setTelError('');
        }
    };

    const dropDownHandler = (e) => {
        e.preventDefault();
        setShowDropDown(!showDropDown);
    };
    const dropDownGuestsHandler = (e) => {
        e.preventDefault();
        setShowDropDownGuests(!showDropDownGuests);
    };

    const timeHandler = (e) => {
        setOptions({ ...options, time: e.target.dataset.value });
    };
    const guestsHandler = (e) => {
        setOptions({ ...options, guests: e.target.dataset.value });
    };

    function useOnClickOutside(ref, handler) {
        useEffect(() => {
            const listener = (event) => {
                if (!ref.current || ref.current.contains(event.target)) {
                    return;
                }
                handler(event);
            };
            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);
            return () => {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
            };
        }, [ref, handler]);
    }
    useOnClickOutside(refTime, (e) => setShowDropDown(false));
    useOnClickOutside(refGuests, (e) => setShowDropDownGuests(false));
    return (
        <Feedback>
            <form
                onSubmit={handlerFormSubmit}
                id="feedback-form"
                name="avatar-save"
                className={styles.form}
            >
                <fieldset className={styles.inputContainer}>
                    <label className={styles.textLabel}>
                        <input
                            autoComplete="off"
                            id="add-name"
                            type="text"
                            name="Name"
                            placeholder="Имя"
                            value={name}
                            onChange={(e) => nameHandler(e)}
                            onBlur={(e) => blurHandler(e)}
                            className={styles.textInput}
                        />
                        {nameDirty && nameError && (
                            <span className={styles.error}>{nameError}</span>
                        )}
                    </label>
                    <label className={styles.textLabel}>
                        <input
                            autoComplete="off"
                            type="tel"
                            name="Tel"
                            placeholder="Телефон"
                            value={tel}
                            onChange={(e) => telHandler(e)}
                            onBlur={(e) => blurHandler(e)}
                            className={styles.textInput}
                        />
                        {telDirty && telError && (
                            <span className={styles.error}>{telError}</span>
                        )}
                    </label>
                </fieldset>
                <fieldset className={styles.optionsContainer}>
                    <label className={styles.inputLabel}>
                        <img
                            className={styles.icon}
                            src={calendarPath}
                            alt="иконка календаря"
                        />
                        <input
                            min={getToWeekend()}
                            max={maxInterval}
                            type="date"
                            name="Data"
                            value={options.date}
                            onChange={(e) => handlerDate(e)}
                            className={styles.optionsInput}
                        />
                        {dateError && (
                            <span className={styles.errorDate}>
                                {dateError}
                            </span>
                        )}
                    </label>
                    <label className={styles.inputLabel}>
                        <img
                            src={clockPath}
                            alt="иконка часов"
                            className={styles.icon}
                        />
                        <div className={styles.dropDown} ref={refTime}>
                            <button
                                type="button"
                                onClick={dropDownHandler}
                                className={styles.dropDownButton}
                            >
                                {options.time}
                            </button>
                            {showDropDown && (
                                <ul className={styles.dropDownList}>
                                    {times.map((times) => (
                                        <li
                                            onClick={(e) => timeHandler(e)}
                                            className={styles.dropDownItem}
                                            data-value={times.time}
                                            key={times.id}
                                        >
                                            {times.time}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <input
                                type="text"
                                name="Time"
                                value={options.time}
                                onChange={(e) =>
                                    setOptions({
                                        ...options,
                                        time: e.target.value,
                                    })
                                }
                                className={styles.hiddenInput}
                            />
                        </div>
                    </label>
                    <label className={styles.guests}>
                        <img
                            src={userPath}
                            alt="иконка гостя"
                            className={styles.icon}
                        />
                        <div className={styles.dropDown} ref={refGuests}>
                            <button
                                type="button"
                                onClick={dropDownGuestsHandler}
                                className={styles.dropDownButton}
                            >
                                {options.guests}
                                {handlerGuestText()}
                            </button>
                            {showDropDownGuests && (
                                <ul className={styles.dropDownList}>
                                    {guests.map((guests) => (
                                        <li
                                            onClick={(e) => guestsHandler(e)}
                                            className={styles.dropDownItem}
                                            data-value={guests.guests}
                                            key={guests.id}
                                        >
                                            {guests.guests}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <input
                                type="text"
                                name="Guests"
                                value={options.guests}
                                onChange={(e) =>
                                    setOptions({
                                        ...options,
                                        guests: e.target.value,
                                    })
                                }
                                className={styles.hiddenInput}
                            />
                        </div>
                    </label>
                </fieldset>
                <fieldset className={styles.submitContainer}>
                    <button
                        disabled={!formValid}
                        onClick={() =>
                            window.ym(90093500, 'reachGoal', 'submit-click')
                        }
                        id="form-submit"
                        type="submit"
                        className={styles.submitButton}
                    >
                        {buttonText}
                    </button>
                </fieldset>
            </form>
        </Feedback>
    );
}
