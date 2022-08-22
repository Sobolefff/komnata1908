import { Children } from 'react';
import FeedbackForm from '../feedback-form/FeedbackForm';
import styles from './feedback.module.css';

export const Feedback = ({ children }) => {
        
    return (
        <section className={styles.feedback}>
           {children}
        </section>
    )
}

