// Cloudflare Worker: backend for the /admin panel.
//
// Stores site config (header/footer links + the booking schedule: recurring
// open weekdays, a future-weeks on/off switch, this/next week overrides and
// per-date exceptions) and the admin password hash in KV, and issues
// short-lived signed tokens for admin requests. Deployed separately from the
// Telegram booking-proxy worker so a bug here can never affect the booking
// flow.
//
// Bindings expected (see wrangler.toml):
//   KV namespace  CONFIG_KV
//   secret        ADMIN_TOKEN_SECRET     (random string, used to sign tokens)
//   secret        ADMIN_INITIAL_PASSWORD (used once, to seed the password on first run)

const CONFIG_KEY = 'config';
const PASSWORD_KEY = 'admin:password';
const TOKEN_TTL_SECONDS = 60 * 60 * 12; // 12 hours

const DEFAULT_CONFIG = {
    links: {
        instagram: 'https://instagram.com/komnata_1908?igshid=YmMyMTA2M2Y=',
        telegram: 'https://t.me/komnata1908',
        whatsapp: 'whatsapp://send?phone=79650726145',
    },
    booking: {
        openWeekdays: [0, 1, 2, 3, 4, 5, 6], // все дни; 0 = воскресенье ... 6 = суббота
        weekOverrides: { current: null, next: null },
        dateOverrides: {},
    },
};

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin || '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        Vary: 'Origin',
    };
}

function json(data, status, origin) {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
}

function toBase64Url(bytes) {
    let str = '';
    for (const b of bytes) str += String.fromCharCode(b);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str) {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4);
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
}

async function hmacKey(secret) {
    return crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
    );
}

async function issueToken(secret) {
    const payload = JSON.stringify({ exp: Date.now() + TOKEN_TTL_SECONDS * 1000 });
    const payloadBytes = new TextEncoder().encode(payload);
    const key = await hmacKey(secret);
    const sig = await crypto.subtle.sign('HMAC', key, payloadBytes);
    return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(sig))}`;
}

async function verifyToken(token, secret) {
    if (!token || !token.includes('.')) return false;
    const [payloadPart, sigPart] = token.split('.');
    try {
        const payloadBytes = fromBase64Url(payloadPart);
        const sigBytes = fromBase64Url(sigPart);
        const key = await hmacKey(secret);
        const ok = await crypto.subtle.verify('HMAC', key, sigBytes, payloadBytes);
        if (!ok) return false;
        const { exp } = JSON.parse(new TextDecoder().decode(payloadBytes));
        return typeof exp === 'number' && exp > Date.now();
    } catch {
        return false;
    }
}

async function hashPassword(password, saltBytes) {
    const salt = saltBytes || crypto.getRandomValues(new Uint8Array(16));
    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        256
    );
    return `${toBase64Url(salt)}:${toBase64Url(new Uint8Array(bits))}`;
}

async function verifyPassword(password, stored) {
    if (!stored || !stored.includes(':')) return false;
    const [saltPart, hashPart] = stored.split(':');
    const salt = fromBase64Url(saltPart);
    const recomputed = await hashPassword(password, salt);
    const [, recomputedHash] = recomputed.split(':');
    return recomputedHash === hashPart;
}

async function getOrSeedPasswordHash(env) {
    let stored = await env.CONFIG_KV.get(PASSWORD_KEY);
    if (!stored) {
        if (!env.ADMIN_INITIAL_PASSWORD) {
            throw new Error('Admin password is not set. Configure the ADMIN_INITIAL_PASSWORD secret.');
        }
        stored = await hashPassword(env.ADMIN_INITIAL_PASSWORD);
        await env.CONFIG_KV.put(PASSWORD_KEY, stored);
    }
    return stored;
}

async function requireAuth(request, env) {
    const auth = request.headers.get('Authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
    return verifyToken(token, env.ADMIN_TOKEN_SECRET);
}

function isWeekdayArray(value) {
    return Array.isArray(value) && value.every((d) => Number.isInteger(d) && d >= 0 && d <= 6);
}

function isValidConfig(data) {
    if (!data || typeof data !== 'object') return false;
    const { links, booking } = data;

    if (!links || typeof links !== 'object') return false;
    for (const key of ['instagram', 'telegram', 'whatsapp']) {
        if (typeof links[key] !== 'string') return false;
    }

    if (!booking || typeof booking !== 'object') return false;
    if (!isWeekdayArray(booking.openWeekdays)) return false;

    const { weekOverrides, dateOverrides } = booking;
    if (!weekOverrides || typeof weekOverrides !== 'object') return false;
    for (const key of ['current', 'next']) {
        if (weekOverrides[key] !== null && !isWeekdayArray(weekOverrides[key])) return false;
    }

    if (!dateOverrides || typeof dateOverrides !== 'object' || Array.isArray(dateOverrides)) return false;
    for (const [dateKey, value] of Object.entries(dateOverrides)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || typeof value !== 'boolean') return false;
    }

    return true;
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin');

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders(origin) });
        }

        try {
            if (url.pathname === '/config' && request.method === 'GET') {
                const stored = await env.CONFIG_KV.get(CONFIG_KEY, 'json');
                return json(stored || DEFAULT_CONFIG, 200, origin);
            }

            if (url.pathname === '/login' && request.method === 'POST') {
                const { password } = await request.json();
                const stored = await getOrSeedPasswordHash(env);
                const ok = typeof password === 'string' && (await verifyPassword(password, stored));
                if (!ok) return json({ error: 'invalid_password' }, 401, origin);
                const token = await issueToken(env.ADMIN_TOKEN_SECRET);
                return json({ token, expiresIn: TOKEN_TTL_SECONDS }, 200, origin);
            }

            if (url.pathname === '/config' && request.method === 'POST') {
                if (!(await requireAuth(request, env))) return json({ error: 'unauthorized' }, 401, origin);
                const data = await request.json();
                if (!isValidConfig(data)) return json({ error: 'invalid_config' }, 400, origin);
                await env.CONFIG_KV.put(CONFIG_KEY, JSON.stringify(data));
                return json({ ok: true }, 200, origin);
            }

            if (url.pathname === '/password' && request.method === 'POST') {
                if (!(await requireAuth(request, env))) return json({ error: 'unauthorized' }, 401, origin);
                const { currentPassword, newPassword } = await request.json();
                const stored = await getOrSeedPasswordHash(env);
                if (typeof currentPassword !== 'string' || !(await verifyPassword(currentPassword, stored))) {
                    return json({ error: 'invalid_current_password' }, 401, origin);
                }
                if (typeof newPassword !== 'string' || newPassword.length < 8) {
                    return json({ error: 'weak_password' }, 400, origin);
                }
                await env.CONFIG_KV.put(PASSWORD_KEY, await hashPassword(newPassword));
                return json({ ok: true }, 200, origin);
            }

            return json({ error: 'not_found' }, 404, origin);
        } catch (err) {
            return json({ error: 'server_error', message: String(err && err.message) }, 500, origin);
        }
    },
};
