# Практичний курс «Розробка клієнт-серверних застосунків на Node.js» — репозиторій практики

> **TL;DR**
> Це навчальний репозиторій із мінімалістичним Fastify-сервером (Node.js 22) та Nginx як зворотнім проксі. Ви отримаєте готову основу для практичних робіт: Echo-endpoint та CRUD для сутності `Resource` (in-memory), локальну розробку через Docker Compose з hot-reload, налаштований логер (pino) і базові HTML-сторінки для швидкого старту.
> Мета — навчити студентів будувати й розширювати продакшн-готові API: валідація, пагінація, помилки, версіонування, тести, CI/CD, спостережуваність і т. ін. Кожен модуль супроводжується задачами-челенджами.

---

## Зміст

* [Що всередині](#що-всередині)
* [Швидкий старт](#швидкий-старт)
* [Архітектура та директорії](#архітектура-та-директорії)
* [Запуск у Docker/Docker Compose](#запуск-у-dockerdocker-compose)
* [Налаштування середовища](#налаштування-середовища)
* [Скрипти npm](#скрипти-npm)
* [API довідник](#api-довідник)

  * [/echo](#echo)
  * [/resources (CRUD)](#resources-crud)
* [Логи та обробка помилок](#логи-та-обробка-помилок)
* [Статичні сторінки та Nginx](#статичні-сторінки-та-nginx)
* [Практичні завдання (челенджі)](#практичні-завдання-челенджі)
* [Внесок, стиль коду та форматування](#внесок-стиль-коду-та-форматування)
* [Ліцензія та застереження](#ліцензія-та-застереження)

---

## Що всередині

* **Node.js 22 + Fastify 5** — сучасний високопродуктивний HTTP-фреймворк.
* **In-memory репозиторій** (`Map`) для ресурсу `Resource` — ідеальний старт для міграції на БД.
* **Маршрути**:

  * `POST /echo`, `GET /echo` — перевірка транспорту й middleware.
  * `GET/POST/GET:id/PUT/PATCH/DELETE /resources` — повний CRUD.
* **Nginx** як API-проксі та статичний сервер (порт `80`), проброс до Node-додатку на `3000`.
* **Готова локальна розробка**: Dockerfile + `docker-compose.yml` з hot-reload (`nodemon`) і відкритим дебаг-портом `9229`.
* **Логування**: `pino` з компактним prettifier’ом та запит-логером у dev-режимі.
* **Якість коду**: ESLint (neostandard), Prettier, Husky pre-commit, EditorConfig.
* **HTML-шаблони**: `index.html`, `home.html`, кастомний `404.html`.
* **Аліаси шляху**: `@/* → src/*` (через `module-alias` та `jsconfig.json`).

---

## Швидкий старт

**Варіант A: npm (без контейнерів)**

```bash
# 1) Клон і залежності
git clone https://github.com/sai308/client-server-architecture-practice-2025.git
cd client-server-architecture-practice-2025
cp .env.example .env
npm install

# 2) Dev-режим з hot-reload і дебаггером на 9229
npm run dev

# 3) Відкрити браузер до Nginx (якщо запускаєте лише Node, див. B)
# http://localhost
```

**Варіант B: Docker Compose (рекомендовано для курсу)**

```bash
# 1) Клон і .env
git clone https://github.com/sai308/client-server-architecture-practice-2025.git
cd client-server-architecture-practice-2025
cp .env.example .env

# 2) Підняти стек (nginx + app)
docker compose up --build

# 3) Перевірити
# Браузер:          http://localhost
# Echo (POST):      curl -sS -X POST http://localhost/api/echo -H 'Content-Type: application/json' -d '{"hello":"world"}'
# Health (GET):     curl -sS http://localhost/api/echo
# Resources (GET):  curl -sS http://localhost/api/resources
```

> За замовчуванням Nginx слухає `80:80`, проксить `/api` на Fastify `app:3000`.

---

## Архітектура та директорії

```
/
├─ src/
│  ├─ app.js            # Ініціалізація Fastify (плагіни, роутинг, логер)
│  ├─ server.js         # Точка входу, graceful shutdown, сигнали, помилки
│  ├─ config.js         # ENV: APP_PORT, APP_HOST, NODE_ENV
│  ├─ logger.js         # pino + pretty transport
│  ├─ routes/
│  │  ├─ echo.js        # /echo (GET/POST)
│  │  ├─ resources/     # CRUD для Resource
│  │  └─ index.js       # Підключення всіх маршрутів + error handler
│  └─ repositories/
│     ├─ resources/     # In-memory репозиторій
│     └─ types.d.ts     # Типи для редактора (JSDoc + d.ts)
├─ nginx/default.conf   # Проксі /api → app:3000, статика, 404
├─ html/                # index.html, home.html, 404.html
├─ static/              # favicon.svg та інше для Nginx
├─ docker-compose.yml   # Сервіси: app (Node), nginx
├─ Dockerfile           # Node 22, nodemon, USER node, EXPOSE 3000 9229
├─ eslint.config.js     # neostandard + ignores з .gitignore
├─ .husky/pre-commit    # npm run lint
├─ .prettierrc          # форматування
├─ .editorconfig        # базові стильові налаштування
└─ package.json         # скрипти, залежності, alias "@":"src"
```

---

## Запуск у Docker/Docker Compose

* **Гарячий перезапуск**: розробляєте локально, код мапиться в контейнер `app` (`volumes: - ./:/srv/app`), процес запускається через `nodemon`.
* **Дебаггер**: порт `9229` "прокинуто" (`- "9229:9229"`). Під’єднуйтесь з VS Code/Chrome DevTools.
* **Порт Nginx**: `80:80`. Front (статичні html + статика) і `/api` доступні з хост-машини.

---

## Налаштування середовища

Файл **`.env`** (приклад у `.env.example`):

```env
APP_ENV_LOADED=1
APP_PORT=3000
APP_HOST=0.0.0.0
```

`NODE_ENV` задається у Dockerfile/Compose (за замовчуванням `development`).
Конфіг зчитується у `src/config.js` та експортує прапорці `IS_DEV_ENV`, `IS_PROD_ENV`.

---

## Скрипти npm

```json
{
  "start": "node ./src/server.js",                   // продакшн-режим
  "dev": "nodemon --inspect=0.0.0.0:9229 ./src/server.js", // dev + debug
  "lint": "eslint ./src --fix",                      // лінт і автофікс
  "format": "prettier --write ./src",                // форматування
  "prepare": "husky install"                         // pre-commit hook
}
```

---

## API довідник

> **База для прикладів:** якщо працюєте через Nginx — `http://localhost`,
> якщо напряму до Fastify (без Nginx) — `http://localhost:3000`.

### `/echo`

* **POST** `/api/echo` — повертає тіло запиту як є (echo).

```bash
curl -sS -X POST http://localhost/api/echo \
  -H 'Content-Type: application/json' \
  -d '{"message":"Hello, NodeJS!"}'
```

**Відповідь** `200`:

```json
{ "message": "Hello, NodeJS!" }
```

* **GET** `/api/echo` — простий health-check.

**Відповідь** `200`:

```json
{ "message": "Echo GET endpoint is working!" }
```

### `/resources` (CRUD)

**Модель** (in-memory):

```ts
type Resource = {
  id: string;            // uuid
  name: string;
  type: string;
  amount: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Створити

* **POST** `/api/resources`

Тіло:

```json
{ "name": "Paper", "type": "supply", "amount": 10, "price": 4.5 }
```

Відповідь `201` — створений об’єкт `Resource`.

#### Отримати список

* **GET** `/api/resources` → `200` масив ресурсів.

#### Отримати за `id`

* **GET** `/api/resources/:id` → `200` ресурс або `404`, якщо не знайдено.

#### Повне оновлення

* **PUT** `/api/resources/:id`
  Тіло (усі поля обов’язкові):

  ```json
  { "name": "Paper A4", "type": "supply", "amount": 50, "price": 4.9 }
  ```

#### Часткове оновлення

* **PATCH** `/api/resources/:id`
  Тіло: **лише** `amount` та/або `price`:

  ```json
  { "amount": 60, "price": 4.8 }
  ```

> **Примітка:** у схемі валідації PATCH наразі зазначені `required: ['name','type']`, але по факту маршрут приймає **лише** `amount`/`price`. Це відкрите **TODO** :).

#### Видалити

* **DELETE** `/api/resources/:id` → `200` із видаленим ресурсом (для зручності).

---

## Логи та обробка помилок

* **Prod/dev рівні**: у `dev` — `debug`, у `prod` — `info`.
* **Транспорти**: `@mgcrea/pino-pretty-compact` для читабельних логів під час розробки.
* **Request-логер**: `@mgcrea/fastify-request-logger` (вмикається в `IS_DEV_ENV`).
* **Глобальний error handler** (`src/routes/index.js`) перехоплює помилки Fastify/валидації та повертає:

  * `400` з `{ error: 'Invalid request', message }` для помилок валідації,
  * `500` з `{ error: 'Internal Server Error' }` для решти випадків.
* **Graceful shutdown**: перехоплення `SIGINT`/`SIGTERM`, `unhandledRejection`, `uncaughtException` у `server.js`.

---

## Статичні сторінки та Nginx

* **Маршрути статичних HTML**:

  * `/` → `html/index.html`
  * `/home` → `html/home.html`
  * `favicon` переадресовано на `favicon.svg`

* **Кастомний 404**: `error_page 404 /404.html` (віддається внутрішньо).

* **Статика**: директорія `static/` монтується як `/usr/share/nginx/static`, доступна через `/`.

* **API-проксі**: усі запити на `/api/**` переписуються (стрипається префікс `/api`) і йдуть до `app:3000`.

---

## Внесок, стиль коду та форматування

* **Стиль**: ESLint (neostandard без style-правил) + Prettier.
* **pre-commit**: Husky запускає `npm run lint`.
* **EditorConfig**: LF, UTF-8, одинарні лапки, `indent_size=2`.
* **Аліаси**: імпорти з `@/..` (див. `jsconfig.json` та `_moduleAliases` у `package.json`).
* Pull-requests вітаються: **маленькі**, зі зрозумілим описом, тестами та оновленою документацією.

---

## Ліцензія та застереження

* **Ліцензія**: MIT (див. `LICENSE`).
* **Навчальна мета**: код орієнтовано на демонстрацію архітектурних рішень і підготовку до продакшн-впроваджень.
* **Безпека**: не зберігає дані, in-memory сховище призначене лише для практики.

---

### Додаток: корисні команди

```bash
# Локальні curl-приклади
curl -sS http://localhost/api/echo
curl -sS -X POST http://localhost/api/echo -H 'Content-Type: application/json' -d '{"ping":1}'

# Створити ресурс
curl -sS -X POST http://localhost/api/resources \
  -H 'Content-Type: application/json' \
  -d '{"name":"Paper","type":"supply","amount":10,"price":4.5}'

# Оновити повністю
curl -sS -X PUT http://localhost/api/resources/<id> \
  -H 'Content-Type: application/json' \
  -d '{"name":"Paper A4","type":"supply","amount":50,"price":4.9}'

# Часткове оновлення (після виправлення схеми)
curl -sS -X PATCH http://localhost/api/resources/<id> \
  -H 'Content-Type: application/json' \
  -d '{"amount":60}'
```

---

**Успіхів у навчанні!** Цей шаблон створено як стартову платформу: розширюйте, рефакторте, додавайте тести й автоматизацію — саме так народжується продакшн-якість.
