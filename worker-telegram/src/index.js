// Cloudflare Worker: принимает заявки на бронирование с сайта и
// пересылает их в Telegram-чат администраторов через Bot API.
//
// Деплоится отдельно от воркера komnata1908-admin, чтобы баг здесь
// не мог сломать /admin, и наоборот.
//
// Bindings expected (см. wrangler.jsonc):
//   secret   TELEGRAM_BOT_TOKEN  токен бота, выданный @BotFather
//   secret   TELEGRAM_CHAT_ID    id чата/группы, куда слать заявки
//   secret   ALLOWED_ORIGIN      разрешённые Origin через запятую,
//                                например: https://komnata1908.ru,https://www.komnata1908.ru

export default {
    async fetch(request, env) {
        const origin = request.headers.get('Origin');
        const allowedOrigin = isAllowedOrigin(origin, env) ? origin : null;

        if (request.method === 'OPTIONS') {
            return new Response(null, {
                status: allowedOrigin ? 204 : 403,
                headers: corsHeaders(allowedOrigin),
            });
        }

        if (request.method !== 'POST') {
            return new Response('Method not allowed', { status: 405 });
        }

        if (!allowedOrigin) {
            return new Response('Forbidden', { status: 403 });
        }

        let data;
        try {
            data = await request.json();
        } catch (e) {
            return jsonResponse({ ok: false, error: 'invalid_json' }, 400, allowedOrigin);
        }

        const name = String(data.name || '').slice(0, 100);
        const tel = String(data.tel || '').slice(0, 40);
        const date = String(data.date || '').slice(0, 40);
        const time = String(data.time || '').slice(0, 20);
        const guests = String(data.guests || '').slice(0, 10);
        const utm = data.utm || {};

        if (!name || !tel) {
            return jsonResponse({ ok: false, error: 'missing_fields' }, 400, allowedOrigin);
        }

        let message = `<b><i>Заявка с сайта:</i></b>\n`;
        message += `<i>Основная информация:</i>\n`;
        message += `Отправитель: <b>${escapeHtml(name)}</b>\n`;
        message += `Телефон: <b>${escapeHtml(tel)}</b>\n`;
        message += `Желаемая дата: <b>${escapeHtml(date)}</b>\n`;
        message += `Желаемое время: <b>${escapeHtml(time)}</b>\n`;
        message += `Количество гостей: <b>${escapeHtml(guests)}</b>\n`;

        if (utm.utm_source || utm.utm_medium || utm.utm_campaign || utm.utm_content || utm.utm_term) {
            message += `<i>Дополнительная информация:</i>\n`;
            message += `UTM source: <b>${escapeHtml(utm.utm_source)}</b>\n`;
            message += `UTM medium: <b>${escapeHtml(utm.utm_medium)}</b>\n`;
            message += `UTM campaign: <b>${escapeHtml(utm.utm_campaign)}</b>\n`;
            message += `UTM content: <b>${escapeHtml(utm.utm_content)}</b>\n`;
            message += `UTM term: <b>${escapeHtml(utm.utm_term)}</b>\n`;
        }

        const tgResponse = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: env.TELEGRAM_CHAT_ID,
                parse_mode: 'html',
                text: message,
                disable_notification: false,
            }),
        });

        if (!tgResponse.ok) {
            return jsonResponse({ ok: false, error: 'telegram_error' }, 502, allowedOrigin);
        }

        return jsonResponse({ ok: true }, 200, allowedOrigin);
    },
};

function isAllowedOrigin(origin, env) {
    if (!origin) return false;
    const allowed = String(env.ALLOWED_ORIGIN || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return allowed.includes(origin);
}

function corsHeaders(origin) {
    const headers = {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
        Vary: 'Origin',
    };
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    return headers;
}

function jsonResponse(body, status, origin) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders(origin),
        },
    });
}

function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
