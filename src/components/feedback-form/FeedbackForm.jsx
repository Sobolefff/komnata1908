import { useState } from 'react';
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
        } else return moment().format('YYYY-MM-DD');
    } 

    const [state, setState] = useState({
        name: '',
        tel: '',
        date: getToWeekend(),
        time: '20:00',
        guests: '1'
    });
    const dayOfWeek = moment(state.date).format("dddd");

    

    const handlerFormSubmit = (e) => {
        e.preventDefault();
        const TOKEN = '5418369687:AAHCMy9pCFT7S1-BDWexPZZW1YS11CPd1I8';
        const CHAT_ID = '-1001736786651';
        const URL_API = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        let message = `<b><i>Заявка с сайта:</i></b>\n\n`;
        message += `Отправитель: <b>${state.name}</b>\n`;
        message += `Телефон: <b>${state.tel}</b>\n`;
        message += `Желаемая дата: <b>${state.date}</b>\n`;
        message += `Желаемое время: <b>${state.time}</b>\n`;
        message += `Количество гостей: <b>${state.guests}</b>\n`;

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

        setState({
            name: '',
            tel: '',
            date: getToWeekend(),
            time: '',
            guests: '1'
        });
    }

    const handlerGuestText = () => {
        if(state.guests === '1') {
           return (
            <p className={styles.text}>гость</p>
           );
        } else {
            return (
                <p className={styles.text}>гостя</p>
            )
        }
    }
    

    return (
        <Feedback>
            <form onSubmit={handlerFormSubmit} id="feedback-form" name="avatar-save" className={styles.form}>
                    <fieldset className={styles.inputContainer}>
                        <label>
                            <input 
                                id="add-name" 
                                type="text" 
                                name="name" 
                                minLength="2" 
                                maxLength="25"
                                placeholder="Имя" 
                                value={state.name} 
                                onChange={(e) => setState({...state, name: e.target.value})} 
                                className={styles.textInput} 
                                required 
                            />
                            <span className="form__error" id="add-name-error"></span>
                        </label>
                        <label>
                            <input 
                                type="tel" 
                                name="tel" 
                                pattern='^\s*([-+]*[0-9]*(?:[.,][0-9]+)?)\s*$' 
                                minLength="7" 
                                maxLength="12" 
                                placeholder="Телефон" 
                                value={state.tel} 
                                onChange={(e) => setState({...state, tel: e.target.value})} 
                                className={styles.textInput} 
                                required 
                            />
                            <span className="form__error" id="add-tel-error"></span>
                        </label>
                    </fieldset>
                    <fieldset className={styles.optionsContainer}>
                        <label className={styles.inputLabel}>
                            <img className={styles.icon} src={calendarPath} alt="иконка календаря"/>
                            <input 
                                min={getToWeekend()} 
                                max={maxInterval} 
                                type="date" 
                                value={state.date} 
                                onChange={(e) => setState({...state, date: e.target.value})} 
                                className={styles.optionsInput} 
                                required
                            />
                            { dayOfWeek == 'Friday' || dayOfWeek == 'Saturday' ? <></> : <span className={styles.error}>Принимаем бронь только на пятницу и субботу</span> }
                        </label>
                        <label className={styles.inputLabel}>
                            <img src={clockPath} alt="иконка часов"/>
                            <input 
                                type="time" 
                                min="20:00" 
                                max="02:00" 
                                value={state.time} 
                                onChange={(e) => setState({...state, time: e.target.value})} 
                                className={styles.optionsInput} 
                                required 
                            />
                        </label>
                        <label className={styles.guests}><img src={userPath} alt="иконка гостя"/>
                            <select id="guests" value={state.guests} onChange={(e) => setState({...state, guests: e.target.value})} className={styles.optionsInput}>
                                <option className={styles.optionsBox} value="1">1</option>
                                <option className={styles.optionsBox} value="2">2</option>
                                <option className={styles.optionsBox} value="3">3</option>
                                <option className={styles.optionsBox} value="4">4</option>
                            </select>
                            {handlerGuestText()}
                        </label>
                    </fieldset>
                    <fieldset className={styles.submitContainer}>
                        <button id="form-submit" type="submit" className={styles.submitButton}>Оставить заявку</button>
                    </fieldset>
            </form>
        </Feedback>
    );
}