import { useNavigate } from "react-router-dom";
import { Feedback } from "../feedback/Feedback";
import styles from './thanks.module.css';

export default function Thanks() {
    const navigate = useNavigate();
    const handlerClose = () => {
        navigate('/');
    }
    return (
        <Feedback>
            <div className={styles.thanks}>
                <h2 className={styles.title}>Спасибо за заявку!</h2>
                <h3 className={styles.subtitle}>В ближайшее время мы свяжемся с вами для уточнения деталей брони.</h3>
                <p className={styles.text}>Мы ценим особую атмосферу этого закрытого пространства, поэтому адрес мы сообщим только по телефону при подтверждении бронирования.</p>
                <button type="button" className={styles.close} onClick={handlerClose}></button>
            </div>
        </Feedback>
    )
}