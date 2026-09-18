# Komnata 1908 — лэндинг секретного бара

Одностраничный сайт-лэндинг секретного бара в центре Санкт-Петербурга:
описание бара, меню напитков, форма бронирования столика с интеграцией
в Telegram и Google Sheets, и отдельная закрытая страница `/admin` для
управления расписанием бронирования и ссылками без правки кода.

Этот файл — точка входа для того, кто продолжит вести проект вместо
меня: что где лежит, как всё связано между собой, как деплоить и на что
обратить внимание, если что-то сломается.

## Содержание

- [Как устроен проект](#как-устроен-проект)
- [Стек](#стек)
- [Быстрый старт (разработка)](#быстрый-старт-разработка)
- [Форма бронирования](#форма-бронирования)
- [Страница /admin и воркер komnata1908-admin](#страница-admin-и-воркер-komnata1908-admin)
- [Воркер komnata1908-telegram (приём заявок)](#воркер-komnata1908-telegram-приём-заявок)
- [Переменные окружения](#переменные-окружения)
- [Деплой](#деплой)
- [Структура репозитория](#структура-репозитория)
- [Известные особенности и грабли](#известные-особенности-и-грабли)

## Как устроен проект

Всего в системе три независимых части:

1. **Фронтенд** (этот репозиторий, корень) — статический React-сайт.
   Собирается в обычный `build/`, который можно закинуть на любой
   статический хостинг (сейчас — reg.ru, раньше был GitHub Pages).
2. **`worker/` — воркер `komnata1908-admin`**. Отдельный Cloudflare
   Worker, который хранит в KV расписание бронирования и ссылки
   хедера/футера, обслуживает страницу `/admin`. Исходники — в
   `worker/src/index.js`.
3. **`worker-telegram/` — воркер `komnata1908-telegram`**. Отдельный
   Cloudflare Worker, который принимает заявку на бронь из формы на
   сайте (`https://komnata1908-telegram.petr-sobolew.workers.dev`,
   см. `src/utils/bookingApi.js`) и пересылает её в Telegram-чат
   администраторов бара через Bot API. Исходники — в
   `worker-telegram/src/index.js`.

Сайт и обе бэкенд-части — **три независимых деплоя**. Правка в
`worker/` не пересобирает и не переразворачивает фронтенд, и наоборот.
После правки бэкенда конфигурации фронтенду ничего пересобирать не
нужно (он ходит в воркер по HTTP в рантайме), а вот после правки
фронтенда его обязательно нужно собрать и залить на хостинг заново —
см. [Деплой](#деплой).

## Стек

- **React 18** + **Create React App** (`react-scripts 5.0.1`), TypeScript
  подключён только для типов конфигурации (`tsconfig.json`), сам код —
  на JS/JSX.
- **React Router v6** — единственный клиентский роут, который важен:
  `/admin`.
- **moment.js** + `moment/locale/ru` — работа с датами; используется
  формат `dddd`/`ddd`, поэтому при подключённой русской локали он
  выводит русские названия дней. Из-за этого в проекте есть свой
  набор `WEEKDAY_LABELS`/`WEEKDAY_VALUES` (см.
  `src/utils/bookingWindow.js`) для единообразных **коротких**
  подписей дней недели (Пн–Вс) — используйте `shortWeekdayLabel()`,
  а не `moment().format('dddd')`, если нужно короткое имя дня.
- **axios** — запрос бронирования в Telegram-воркер.
  `fetch` — запросы к admin-воркеру (`src/utils/adminApi.js`).
  Различие внутреннее, унификации ради его трогать не обязательно.
- **CSS Modules** (`*.module.css`) — стили компонентов, без
  CSS-фреймворка.
- **react-helmet-async** — управление `<title>`/meta по страницам
  (например, `noindex` на `/admin` и `/thanks`).
- **Яндекс.Метрика** — цели шлются через `window.ym` в
  `src/utils/analytics.js` (счётчик `90093500`).
- **Google Apps Script** (`SHEET_URL` в `bookingApi.js`) — заявки
  дополнительно дублируются в Google Таблицу через веб-приложение
  Apps Script.
- **Cloudflare Workers + Workers KV** — бэкенд `/admin` (см. ниже).
- **gh-pages** — раньше использовался для деплоя на GitHub Pages
  (скрипты `deploy`/`deploy:ghpages` в `package.json` ещё рабочие),
  сейчас основной хостинг — reg.ru (обычный shared-хостинг по
  Apache/`.htaccess`, без Node на сервере).

## Быстрый старт (разработка)

```bash
npm install
cp .env.example .env.local        # указать актуальный REACT_APP_ADMIN_API_URL
npm start                          # http://localhost:3000
```

Без `REACT_APP_ADMIN_API_URL` сайт всё равно откроется и будет
работать (бронирование, меню и т.д.), но `/admin` не сможет ни
загрузить, ни сохранить конфиг — запросы будут падать, а форма
бронирования будет использовать дефолтные значения
(`DEFAULT_SITE_CONFIG` / `DEFAULT_BOOKING_CONFIG` из
`src/context/SiteConfigContext.jsx` и `src/utils/bookingWindow.js`) —
это осознанный fallback, чтобы сайт не падал целиком при недоступном
воркере.

Продакшен-сборка:

```bash
npm run build       # обычная сборка → build/
```

После `react-scripts build` автоматически (через npm-хук `postbuild`)
запускается `scripts/prerender.js` — он поднимает `build/` на локальном
сервере, открывает `/` в headless Chromium (пакет `puppeteer`) и
перезаписывает `build/index.html` уже отрисованным HTML. Это сделано
для SEO: сайт — чистый CSR, и без пререндера поисковый бот в первую
очередь видит пустой `<div id="root"></div>`, а весь текст (H1,
описание бара и т.д.) появляется только после выполнения JS. На
клиенте React подхватывает готовую разметку через `hydrateRoot`
(см. `src/index.tsx`), а не рендерит её заново с нуля.

При первом запуске `puppeteer` сам скачает совместимый Chromium (нужен
доступ в интернет и ~300 МБ на диск) — это выполняется один раз на
`npm install`. Если сборка идёт в среде без интернета или со своим
Chromium/Chrome, укажите путь к нему через переменную окружения
`PUPPETEER_EXECUTABLE_PATH` перед `npm run build`.

## Форма бронирования

Основная логика — в хуке `src/hooks/useFeedbackForm.js` и в
`src/components/feedback-form/*`:

- `ContactFields` — имя и телефон (маска в `src/utils/phoneMask.js`,
  валидация в `src/utils/validators.js`).
- `DateField` — календарь с ограничением дат: какие дни доступны для
  брони, решает `isDateBookable()` из `src/utils/bookingWindow.js` на
  основе конфига, загруженного из admin-воркера через
  `SiteConfigContext`. Приоритет правил (сверху вниз):
  1. `dateOverrides["YYYY-MM-DD"]` — точечное исключение на
     конкретную дату (true — открыто, false — закрыто), задаётся в
     `/admin` → «Исключения по датам».
  2. `weekOverrides.current` / `weekOverrides.next` — переопределение
     списка открытых дней недели только для текущей/следующей
     календарной недели (считается по `isoWeek`, понедельник —
     первый день).
  3. `openWeekdays` — общее повторяющееся расписание (по умолчанию —
     открыты все 7 дней).
  Дни недели везде кодируются числами `0..6`, где `0 = воскресенье`
  (это `moment().day()`, не зависит от локали).
- `TimeField`, `GuestsField` — выбор времени и числа гостей,
  доступные значения — в `src/hooks/useBookingOptions.js`.
- `SubmitButton` — сабмит; при успехе показывается страница `/thanks`.

При отправке (`src/utils/bookingApi.js`):

1. `submitBooking()` — `POST` в `komnata1908-telegram` воркер с
   `{ name, tel, date, time, guests, utm }` (дата форматируется как
   `ddd DD.MM.YYYY`, например `Чт 18.09.2026`).
2. `submitToSheet()` — параллельно (или последовательно, смотри
   `useFeedbackForm.js`) те же данные форма шлёт как обычный
   `FormData` POST в Google Apps Script Web App (`SHEET_URL`) — это
   резервная копия заявок в гугл-таблице, независимая от Telegram.

## Страница /admin и воркер komnata1908-admin

`/admin` (см. `src/components/admin/`) — закрытая (не в сайтмапе,
`noindex`) страница управления сайтом без деплоя кода:

- **`AdminPage.jsx`** — экран логина. Пароль отправляется в
  `POST /login`, токен кладётся в `sessionStorage` (см.
  `src/utils/adminAuth.js`, живёт до закрытия вкладки или истечения
  `expiresIn`, сейчас 12 часов).
- **`AdminDashboard.jsx`** — сам дашборд, состоит из:
  - `LinksEditor` — ссылки Instagram/Telegram/WhatsApp в хедере/футере;
  - `WeekdaysEditor` — общее повторяющееся расписание (`openWeekdays`);
  - `WeekOverrideEditor` (×2, «эта неделя» / «следующая неделя») —
    временное переопределение расписания;
  - `DateExceptionsEditor` — точечные исключения по датам;
  - `PasswordEditor` — смена пароля админки (требует текущий пароль).
  - Кнопка «Сохранить изменения» шлёт весь конфиг разом в
    `POST /config`. Сайт (не только `/admin`) читает этот конфиг через
    `GET /config` при каждой загрузке (`SiteConfigProvider`), так что
    изменения применяются сразу всем посетителям, без пересборки
    фронтенда.

Бэкенд — `worker/` (Cloudflare Worker, отдельный от воркера приёма
броней, специально, чтобы баг в админке не мог сломать приём заявок):

- **Хранилище** — Workers KV (`CONFIG_KV`): один ключ `config`
  (JSON `{ links, booking }`) и один ключ `admin:password` (хеш
  пароля, PBKDF2-SHA256, соль хранится вместе с хешем).
- **Пароль** сеется автоматически из секрета `ADMIN_INITIAL_PASSWORD`
  при первом обращении, дальше секрет не используется — только хеш в
  KV; менять пароль нужно через саму админку (`/password`).
- **Токены** — HMAC-подписанные (`ADMIN_TOKEN_SECRET`), без внешних
  зависимостей (`crypto.subtle` из Workers runtime), время жизни 12
  часов, не обновляются автоматически — по истечении нужно перелогиниться.
- **Эндпоинты**: `GET /config` (публичный), `POST /login`,
  `POST /config` (нужен токен), `POST /password` (нужен токен). Полное
  описание форматов — в `worker/README.md`.

### Деплой/обновление воркера admin

```bash
cd worker
npm install -g wrangler      # если ещё не установлен
wrangler login

# только при первом деплое (или если KV-неймспейс утрачен):
wrangler kv namespace create CONFIG_KV
# и подставить выданный id в worker/wrangler.toml -> kv_namespaces

# секреты — задаются один раз, не хранятся в репозитории:
wrangler secret put ADMIN_TOKEN_SECRET       # напр.: openssl rand -hex 32
wrangler secret put ADMIN_INITIAL_PASSWORD   # пароль для первого входа

wrangler deploy
```

После любого изменения `worker/src/index.js` достаточно повторить
`wrangler deploy` — KV и секреты не затрагиваются. Адрес воркера
(`https://komnata1908-admin.<account>.workers.dev`) не меняется между
деплоями, поэтому фронтенд пересобирать не нужно, если только сам
адрес не поменялся.

## Воркер komnata1908-telegram (приём заявок)

Исходники — в `worker-telegram/` (структура и подход к секретам —
по аналогии с `worker/`). Подробное описание эндпоинта, формата
сообщения и защиты от чужих запросов — в `worker-telegram/README.md`;
здесь только самое важное:

- URL: `https://komnata1908-telegram.petr-sobolew.workers.dev`
  (тот же Cloudflare-аккаунт, что и у `komnata1908-admin`, но
  отдельный воркер).
- Единственный маршрут — `POST /`, принимает JSON
  `{ name, tel, date, time, guests, utm }`, форвардит эти данные в
  Telegram-чат администраторов бара через Bot API (`sendMessage`).
- Секреты воркера: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`,
  `ALLOWED_ORIGIN` (список разрешённых доменов через запятую — это и
  есть единственная защита от чужих запросов, отдельного пароля у
  воркера нет).

### Деплой/обновление воркера telegram

```bash
cd worker-telegram
npm install -g wrangler   # если ещё не установлен
wrangler login

# секреты — задаются один раз, не хранятся в репозитории:
wrangler secret put TELEGRAM_BOT_TOKEN
wrangler secret put TELEGRAM_CHAT_ID
wrangler secret put ALLOWED_ORIGIN   # напр.: https://komnata1908.ru,https://www.komnata1908.ru

wrangler deploy
```

После изменений в `worker-telegram/src/index.js` достаточно повторить
`wrangler deploy`. Если поменяется сам адрес воркера — его нужно
обновить в `src/utils/bookingApi.js` (`PROXY_API`) и пересобрать
фронтенд.

## Переменные окружения

Единственная переменная фронтенда — `REACT_APP_ADMIN_API_URL`
(см. `.env.example`), это **build-time** переменная CRA: она
запекается в JS-бандл на этапе `npm run build` и не может быть
изменена после сборки без пересборки. Указывает на адрес воркера
`komnata1908-admin`.

Секреты воркера `komnata1908-admin` (`ADMIN_TOKEN_SECRET`,
`ADMIN_INITIAL_PASSWORD`) и секреты воркера `komnata1908-telegram`
(`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `ALLOWED_ORIGIN`) хранятся
только в Cloudflare (`wrangler secret put`) — ни в репозитории, ни в
`.env`-файлах их быть не должно.

## Деплой

Основной прод — **reg.ru** (обычный shared-хостинг, Apache,
`.htaccess` из `public/.htaccess` отвечает за SPA-фолбэк на
`index.html` и кеширование хэшированных ассетов). Процесс:

1. Собрать фронтенд из актуального `master`:
   ```bash
   npm run build
   ```
   Убедиться, что при сборке указан правильный
   `REACT_APP_ADMIN_API_URL` (через `.env.production.local` или
   переменную окружения) — если он не совпадает с реально
   задеплоенным адресом воркера, `/admin` на проде перестанет
   работать молча (без ошибки в консоли сборки).
2. Содержимое `build/` (включая пересобранные `.htaccess`-совместимые
   файлы) загрузить на reg.ru поверх текущих файлов сайта — вручную
   через FTP/файловый менеджер хостинга, или синхронизацией.
3. В этом репозитории для истории и удобства ведётся отдельная ветка
   **`deploy/reg-ru-build`**, в которой закоммичен именно тот
   `build/`, что сейчас реально лежит на reg.ru (обратите внимание:
   `build/` в `.gitignore` для `master`, но **принудительно
   закоммичен** в этой ветке через `git add -f build`). Она нужна,
   чтобы:
   - быстро посмотреть, что именно сейчас в проде, без пересборки;
   - при необходимости откатиться на предыдущий билд, просто взяв
     предыдущий коммит этой ветки.

   Обновление этой ветки при новом деплое:
   ```bash
   # в отдельном скретч-воркдире, если master уже занят в основном:
   git worktree add --detach /tmp/build-scratch master
   cd /tmp/build-scratch
   echo "REACT_APP_ADMIN_API_URL=<реальный адрес воркера>" > .env.production.local
   npm ci && npm run build
   cd /home/user/komnata1908
   git checkout deploy/reg-ru-build
   rm -rf build && cp -r /tmp/build-scratch/build .
   git add -f build
   git commit -m "Update build for reg.ru: <что изменилось>"
   git push -u origin deploy/reg-ru-build
   ```
   Перед коммитом стоит свериться, что:
   - хэш JS-файла одинаковый в `build/index.html` и
     `build/asset-manifest.json`;
   - в собранном JS присутствуют оба ожидаемых адреса воркеров
     (`komnata1908-admin...workers.dev`,
     `komnata1908-telegram...workers.dev`) ровно по одному разу;
   - в собранном JS нет похожих на секреты строк (`sk-...`,
     `AKIA...`, «secret» рядом с `REACT_APP_`/`process.env`) — билд
     публичный, всё что в нём есть, видно любому посетителю сайта.

Альтернативный/резервный хостинг — **GitHub Pages** (ветка
`gh-pages`, поддерживается пакетом `gh-pages`):

```bash
npm run deploy:ghpages   # сборка с PUBLIC_URL=/komnata1908, деплой в gh-pages
```

Обратите внимание: `build:ghpages` собирает сайт с
`PUBLIC_URL=/komnata1908` (сайт живёт в подпапке
`<user>.github.io/komnata1908`), это **другой билд**, чем прод на
reg.ru (там сайт живёт в корне домена) — билды из `deploy/reg-ru-build`
и `gh-pages` не взаимозаменяемы.

## Структура репозитория

```
.
├── public/                  статические файлы (иконки, .htaccess, sitemap, manifest)
├── src/
│   ├── components/
│   │   ├── admin/           страница /admin и её виджеты
│   │   ├── feedback-form/   форма бронирования
│   │   ├── feedback/        обёртка секции формы
│   │   ├── header, footer, header-button, social-links, about, drinks, thanks, secret, app
│   ├── context/              SiteConfigContext — конфиг сайта из admin-воркера
│   ├── hooks/                useFeedbackForm, useBookingOptions, useDropdown, ...
│   ├── utils/                bookingWindow (правила доступности дат), bookingApi
│   │                          (отправка брони), adminApi (клиент admin-воркера),
│   │                          adminAuth (сессия админки), validators, phoneMask, ...
│   └── vendor/                шрифты/normalize, подключаемые напрямую
├── worker/                   исходники воркера komnata1908-admin (см. выше)
│   ├── src/index.js
│   ├── wrangler.toml
│   └── README.md
├── worker-telegram/          исходники воркера komnata1908-telegram (см. выше)
│   ├── src/index.js
│   ├── wrangler.jsonc
│   └── README.md
├── .env.example
└── package.json
```

Ветки репозитория:

- **`master`** — основная ветка с исходным кодом фронтенда и `worker/`.
- **`deploy/reg-ru-build`** — снапшоты реальных билдов, лежащих на
  reg.ru (см. [Деплой](#деплой)).
- **`gh-pages`** — билды для GitHub Pages (обслуживается пакетом
  `gh-pages`, обновляется командой `deploy:ghpages`, вручную трогать
  не нужно).
- **`feature/admin-panel`**, **`claude/project-review-suggestions-t9gd5r`**
  — рабочие/исторические ветки разработки; после мержа в `master`
  можно удалять, если не нужна история конкретно по ним.

## Известные особенности и грабли

- **`moment/locale/ru` глобально меняет вывод `dddd`/`ddd`** для
  всего приложения, как только импортирован хоть где-то (сейчас — в
  `FeedbackForm.jsx`). Если нужно короткое имя дня недели —
  используйте `shortWeekdayLabel()`/`WEEKDAY_LABELS` из
  `bookingWindow.js`, а не `moment().format('dddd')`, иначе получите
  полное русское название вместо короткого.
- **`REACT_APP_ADMIN_API_URL` запекается в бандл на этапе сборки.**
  Смена адреса воркера требует пересборки и передеплоя фронтенда —
  просто поменять переменную на сервере недостаточно (это не Node,
  сервер её не читает).
- **`.htaccess`**: сознательно не форсит HTTPS через `%{HTTPS}`
  редирект — на reg.ru SSL терминируется на прокси перед Apache, и
  такой редирект уходил в бесконечный цикл. Если понадобится
  принудительный HTTPS — включайте через панель хостинга или
  проверяйте `%{HTTP:X-Forwarded-Proto}`, не `%{HTTPS}`.
- **`build/` в `.gitignore`** для `master`, но принудительно
  закоммичен на ветке `deploy/reg-ru-build` — `git add build` там
  ничего не даст, нужен `git add -f build`.
- **Два воркера физически разделены специально**: `komnata1908-admin`
  и `komnata1908-telegram` — независимые деплои под одним
  Cloudflare-аккаунтом, так что баг в форме бронирования не может
  положить админку и наоборот. Не объединяйте их в один воркер.
- **У `komnata1908-telegram` нет пароля/токена авторизации** — только
  проверка заголовка `Origin` против `ALLOWED_ORIGIN` (см.
  `worker-telegram/README.md`). Это защищает от запросов с чужих
  доменов, но не от спама/накрутки заявок с самого сайта — rate
  limiting не реализован в коде воркера.
- **`ALLOWED_ORIGIN` заведён на проде как секрет**, а не как обычная
  переменная (`vars`), хотя по смыслу секретом не является — деталь
  текущей конфигурации, не баг (подробнее в
  `worker-telegram/README.md`).
- **Токен админки живёт в `sessionStorage`**, а не `localStorage` —
  сессия обнуляется при закрытии вкладки, это осознанное решение
  (не хранить токен админки дольше, чем нужно).
