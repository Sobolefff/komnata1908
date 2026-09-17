const ADMIN_API = process.env.REACT_APP_ADMIN_API_URL || '';

async function parseJson(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        throw new Error(`unexpected_response_${response.status}`);
    }
    const data = await response.json().catch(() => {
        throw new Error('invalid_json_response');
    });
    if (!response.ok) {
        throw new Error(data.error || `request_failed_${response.status}`);
    }
    return data;
}

export const fetchConfig = () => fetch(`${ADMIN_API}/config`).then(parseJson);

export const login = (password) =>
    fetch(`${ADMIN_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
    }).then(parseJson);

export const saveConfig = (token, config) =>
    fetch(`${ADMIN_API}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(config),
    }).then(parseJson);

export const changePassword = (token, currentPassword, newPassword) =>
    fetch(`${ADMIN_API}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword }),
    }).then(parseJson);
