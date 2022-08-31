import { useEffect, useState } from 'react';
import styles from './feedbackForm.module.css';
import moment from 'moment';
import axios from 'axios';
import { Feedback } from '../feedback/Feedback';
import { useNavigate } from 'react-router-dom';
import calendarPath from '../../images/icons/calendar.png';
import clockPath from '../../images/icons/clock.png';
import userPath from '../../images/icons/user.png';

export default function FeedbackForm() {
    const navigate = useNavigate();
    const maxInterval = moment().add(21, 'd').format('YYYY-MM-DD');
    const getToWeekend = () => {
        let weekend = Number(moment().format("d"));
        let sum = 0;
        if(weekend < 5) {
            sum = 5 - weekend;
            return weekend = moment().add(sum, 'd').format('YYYY-MM-DD')
        } else return weekend = moment().format('YYYY-MM-DD');
    }
    
    const [options, setOptions] = useState({
        date: getToWeekend(),
        time: '20:00',
        guests: '1'
    });

    const [name, setName] = useState('');
    const [tel, setTel] = useState('');
    const [nameDirty, setNameDirty] = useState(false);
    const [telDirty, setTelDirty] = useState(false);
    const [nameError, setNameError] = useState('Заполните имя');
    const [telError, setTelError] = useState('Заполните телефон');
    const [formValid, setFormValid] = useState(false);
    const [dateError, setDateError] = useState('');

    useEffect(() => {
        (nameError || telError || dateError) ? setFormValid(false) : setFormValid(true);
    }, [nameError, telError, dateError])
    
    const handlerDate = (e) => {
        setOptions({...options, date: e.target.value});
        const dayOfWeek = String(moment(e.target.value).format("dddd"));
        (dayOfWeek != 'Friday' && dayOfWeek != 'Saturday') ? setDateError('Принимаем бронь только на пятницу и субботу') : setDateError('');
    }

    const handlerFormSubmit = (e) => {
        e.preventDefault();
        const TOKEN = '5418369687:AAHCMy9pCFT7S1-BDWexPZZW1YS11CPd1I8';
        const CHAT_ID = '-1001736786651';
        const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        let message = `<b><i>Заявка с сайта:</i></b>\n\n`;
        message += `Отправитель: <b>${name}</b>\n`;
        message += `Телефон: <b>${tel}</b>\n`;
        message += `Желаемая дата: <b>${options.date}</b>\n`;
        message += `Желаемое время: <b>${options.time}</b>\n`;
        message += `Количество гостей: <b>${options.guests}</b>\n`;

        axios.post(URL_API, {
            chat_id: CHAT_ID,
            parse_mode: 'html',
            text: message,
            disable_notification: false,
        })
        .then((res) =>{
            navigate('/thanks');
        })
        .catch((err) => {
            console.warn(err);
        })
        .finally(() => {
            console.log('End');
        });

        setOptions({
            date: getToWeekend(),
            time: '',
            guests: '1'
        });
    }

    const handlerGuestText = () => {
        if(options.guests === '1') {
           return (
            <p className={styles.text}>гость</p>
           );
        } else {
            return (
                <p className={styles.text}>гостя</p>
            )
        }
    }
    
    const blurHandler = (e) => {
        switch (e.target.name) {
            case 'name':
                setNameDirty(true)
                break
            case 'tel':
                setTelDirty(true)
                break
        }
    }

    const nameHandler = (e) => {
        setName(e.target.value);
        const re = /^[а-яА-ЯёЁa-zA-Z'`'\-\s]{2,20}$/;
        if (!re.test(String(e.target.value))) {
            setNameError('Введите корректное имя от 2 до 20 символов');
        } else {
            setNameError('');
        }
    }

    const telHandler = (e) => {
        setTel(e.target.value);
        const re = /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/;
        !re.test(String(e.target.value)) ? setTelError('Введите корректный номер телефона') : setTelError('');
    }

    return (
        <Feedback>
            <form onSubmit={handlerFormSubmit} id="feedback-form" name="avatar-save" className={styles.form}>
                    <fieldset className={styles.inputContainer}>
                        <label className={styles.textLabel}>
                            <input 
                                autocomplete="off"
                                id="add-name" 
                                type="text" 
                                name="name" 
                                placeholder="Имя" 
                                value={name} 
                                onChange={e => nameHandler(e)}
                                onBlur={e => blurHandler(e)}
                                className={styles.textInput}
                            />
                            {(nameDirty && nameError) && <span className={styles.error}>{nameError}</span>}
                        </label>
                        <label className={styles.textLabel}>
                            <input 
                                autocomplete="off"
                                type="tel" 
                                name="tel" 
                                placeholder="Телефон" 
                                value={tel} 
                                onChange={e => telHandler(e)}
                                onBlur={e => blurHandler(e)}
                                className={styles.textInput}  
                            />
                            {(telDirty && telError) && <span className={styles.error}>{telError}</span>}
                        </label>
                    </fieldset>
                    <fieldset className={styles.optionsContainer}>
                        <label className={styles.inputLabel}>
                            <img className={styles.icon} src={calendarPath} alt="иконка календаря"/>
                            <input 
                                min={getToWeekend()} 
                                max={maxInterval} 
                                type="date" 
                                value={options.date} 
                                onChange={(e) => handlerDate(e)} 
                                className={styles.optionsInput} 
                                required
                            />
                            { dateError && <span className={styles.errorDate}>{dateError}</span> }
                        </label>
                        <label className={styles.inputLabel}>
                            <img src={clockPath} alt="иконка часов"/>
                            <input 
                                type="time" 
                                min="20:00" 
                                max="02:00" 
                                value={options.time} 
                                onChange={(e) => setOptions({...options, time: e.target.value})} 
                                className={styles.optionsInput} 
                                required 
                            />
                        </label>
                        <label className={styles.guests}><img src={userPath} alt="иконка гостя"/>
                            <select id="guests" value={options.guests} onChange={(e) => setOptions({...options, guests: e.target.value})} className={styles.optionsInput}>
                                <option className={styles.optionsBox} value="1">1</option>
                                <option className={styles.optionsBox} value="2">2</option>
                                <option className={styles.optionsBox} value="3">3</option>
                                <option className={styles.optionsBox} value="4">4</option>
                            </select>
                            {handlerGuestText()}
                        </label>
                    </fieldset>
                    <fieldset className={styles.submitContainer}>
                        <button disabled={!formValid} id="form-submit" type="submit" className={styles.submitButton}>Оставить заявку</button>
                    </fieldset>
            </form>
        </Feedback>
    );
}