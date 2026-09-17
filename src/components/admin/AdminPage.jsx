import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { getSession, saveSession, clearSession } from '../../utils/adminAuth';
import { login } from '../../utils/adminApi';
import AdminDashboard from './AdminDashboard';
import styles from './admin.module.css';

export default function AdminPage() {
    const [token, setToken] = useState(() => getSession());
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        login(password)
            .then(({ token, expiresIn }) => {
                saveSession(token, expiresIn);
                setToken(token);
                setPassword('');
            })
            .catch(() => setError('Неверный пароль'))
            .finally(() => setSubmitting(false));
    };

    const handleLogout = () => {
        clearSession();
        setToken(null);
    };

    return (
        <div className={styles.page}>
            <Helmet>
                <title>Админка — Komnata 1908</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            {token ? (
                <AdminDashboard token={token} onLogout={handleLogout} />
            ) : (
                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <h1>Вход в админку</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Пароль"
                        autoFocus
                        required
                    />
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" disabled={submitting}>
                        {submitting ? 'Входим...' : 'Войти'}
                    </button>
                </form>
            )}
        </div>
    );
}
