# komnata1908-admin worker

Отдельный Cloudflare Worker для страницы `/admin`. Хранит в KV ссылки
хедера/футера, расписание бронирования (повторяющиеся открытые дни недели,
переключатель будущих недель, переопределения для текущей/следующей недели
и исключения по конкретным датам) и хеш пароля администратора. Специально
сделан отдельным воркером от `komnata1908-telegram`, чтобы баг здесь не мог
сломать приём заявок.

## Деплой (один раз)

```bash
cd worker
npm install -g wrangler   # если ещё не установлен
wrangler login

# создать KV-неймспейс и подставить его id в wrangler.toml
wrangler kv namespace create CONFIG_KV

# секреты (не попадают в репозиторий)
wrangler secret put ADMIN_TOKEN_SECRET       # любая случайная строка, напр.: openssl rand -hex 32
wrangler secret put ADMIN_INITIAL_PASSWORD   # пароль для первого входа в /admin, потом сменить в самой админке

wrangler deploy
```

После деплоя Cloudflare даст адрес вида
`https://komnata1908-admin.<account>.workers.dev`. Его нужно указать
фронтенду в переменной окружения `REACT_APP_ADMIN_API_URL` (см. `.env.example`
в корне репозитория) перед сборкой.

## Эндпоинты

- `GET /config` — публичный, отдаёт `{ links, booking }`, где
  `booking = { openWeekdays, allowFutureWeeks, weekOverrides: { current, next }, dateOverrides }`
  (дни недели — числа 0-6, 0 = воскресенье; `dateOverrides` — словарь `"YYYY-MM-DD": true|false`).
- `POST /login` — `{ password }` → `{ token, expiresIn }`.
- `POST /config` — требует `Authorization: Bearer <token>`, сохраняет новый конфиг.
- `POST /password` — требует токен, `{ currentPassword, newPassword }`.

Пароль администратора при первом запросе автоматически берётся из секрета
`ADMIN_INITIAL_PASSWORD` и хешируется (PBKDF2) в KV; сам секрет после этого
больше не используется — новый пароль хранится только как хеш.
