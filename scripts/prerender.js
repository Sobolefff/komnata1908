// Пререндер продакшен-сборки: поднимает build/ на локальном сервере,
// открывает "/" в headless Chromium, ждёт реальной отрисовки React
// и сохраняет получившийся HTML обратно в build/index.html.
//
// Зачем: сайт — чистый CSR (create-react-app), и без этого шага
// поисковый бот в первую очередь видит пустой <div id="root"></div> —
// весь текст (H1, описание бара и т.д.) появляется только после
// выполнения JS. Так в build/index.html сразу лежит уже готовый HTML,
// а на клиенте React подхватывает его через hydrateRoot (см. src/index.tsx).
//
// PRERENDER_BASE_PATH нужен только для сборки под GitHub Pages
// (PUBLIC_URL=/komnata1908) — см. package.json.

const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const buildDir = path.join(__dirname, '..', 'build');
const basePath = (process.env.PRERENDER_BASE_PATH || '').replace(/\/$/, '');
const port = 45678;

const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain; charset=utf-8',
    '.xml': 'application/xml',
};

function serve(req, res) {
    let urlPath = decodeURIComponent(req.url.split('?')[0]);
    if (basePath && urlPath.startsWith(basePath)) {
        urlPath = urlPath.slice(basePath.length) || '/';
    }

    let filePath = path.join(buildDir, urlPath);
    if (!filePath.startsWith(buildDir)) {
        res.writeHead(403).end();
        return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(buildDir, 'index.html');
    }

    res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream');
    fs.createReadStream(filePath).pipe(res);
}

async function main() {
    if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
        throw new Error('build/index.html не найден — сначала выполните react-scripts build');
    }

    const server = await new Promise((resolve) => {
        const s = http.createServer(serve).listen(port, () => resolve(s));
    });

    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    try {
        const page = await browser.newPage();

        // Не даём странице реально сходить в Яндекс.Метрику, к воркеру
        // конфигурации и т.п. во время сборки — только сам локальный build/.
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const reqUrl = new URL(req.url());
            if (reqUrl.hostname === 'localhost') {
                req.continue();
            } else {
                req.abort();
            }
        });

        await page.goto(`http://localhost:${port}${basePath}/`, { waitUntil: 'networkidle0' });
        await page.waitForSelector('h1');

        // page.content() уже включает "<!DOCTYPE html>" сам по себе.
        const html = await page.content();
        fs.writeFileSync(path.join(buildDir, 'index.html'), html);
        console.log('Пререндер готов: build/index.html обновлён статическим HTML.');
    } finally {
        await browser.close();
        server.close();
    }
}

main().catch((err) => {
    console.error('Пререндер не удался:', err);
    process.exit(1);
});
