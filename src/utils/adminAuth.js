const STORAGE_KEY = 'admin_session';

export function saveSession(token, expiresIn) {
    const expiresAt = Date.now() + expiresIn * 1000;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expiresAt }));
}

export function getSession() {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const { token, expiresAt } = JSON.parse(raw);
        if (!token || Date.now() >= expiresAt) {
            sessionStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return token;
    } catch {
        return null;
    }
}

export function clearSession() {
    sessionStorage.removeItem(STORAGE_KEY);
}
