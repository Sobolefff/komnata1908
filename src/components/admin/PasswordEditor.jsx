import { useState } from 'react';
import { changePassword } from '../../utils/adminApi';
import styles from './admin.module.css';

export default function PasswordEditor({ token, onUnauthorized }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setStatus('');
        if (newPassword.length < 8) {
            setStatus('Пароль должен быть не короче 8 символов');
            return;
        }
        if (newPassword !== confirmPassword) {
            setStatus('Пароли не совпадают');
            return;
        }
        changePassword(token, currentPassword, newPassword)
            .then(() => {
                setStatus('Пароль изменён');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch((err) => {
                if (err.message === 'unauthorized') return onUnauthorized();
                setStatus(err.message === 'invalid_current_password' ? 'Неверный текущий пароль' : 'Не удалось сменить пароль');
            });
    };

    return (
        <section className={styles.section}>
            <h2>Смена пароля</h2>
            <form onSubmit={handleSubmit} className={styles.passwordForm}>
                <input
                    type="password"
                    placeholder="Текущий пароль"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Новый пароль"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {status && <p className={styles.status}>{status}</p>}
                <button type="submit">Сменить пароль</button>
            </form>
        </section>
    );
}
