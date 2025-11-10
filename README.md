# Booking System

Production-ready booking system with services, users, and time-based bookings.

## Tech Stack

### Backend
- Node.js + TypeScript
- Fastify
- Prisma (PostgreSQL)
- Zod
- JWT (access + refresh tokens)
- bcrypt
- Swagger/OpenAPI documentation

### Frontend
- React + TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Axios

### Infrastructure
- Docker (PostgreSQL)
- GitHub Actions (CI/CD)

## Features

- **Authentication**: Email/password with JWT tokens (access + refresh)
- **Roles**: ADMIN and CLIENT
- **Services**: Duration and price management
- **Bookings**: Time-based bookings with overlap prevention
- **Validation**: Zod schemas for all inputs
- **Security**: Password hashing, role-based access control
- **API Documentation**: Swagger UI available at `/docs`

## 🚀 Швидкий старт (3 кроки)

1. **Створіть .env файли:**
   ```powershell
   pnpm setup:env
   ```

2. **Запустіть базу даних:**
   ```powershell
   pnpm docker:up
   ```

3. **Запустіть проект:**
   ```powershell
   pnpm dev
   ```

4. **Відкрийте в браузері:**
   - Frontend: http://localhost:5173
   - API Docs: http://localhost:4000/docs

**Детальні інструкції дивіться нижче або у файлі [QUICK_START.md](./QUICK_START.md)**

---

## Детальний швидкий старт

### Крок 1: Перевірка вимог

Переконайтеся, що встановлено:
- **Node.js 20+** ([завантажити](https://nodejs.org/))
- **pnpm** ([завантажити](https://pnpm.io/installation)) - менеджер пакетів
- **Docker Desktop** для Windows ([завантажити](https://www.docker.com/products/docker-desktop/))

#### Встановлення Docker Desktop (якщо не встановлено)

1. Завантажте Docker Desktop з офіційного сайту
2. Встановіть Docker Desktop (потрібні права адміністратора)
3. Перезапустіть PowerShell після встановлення
4. Перевірте встановлення:
   ```powershell
   docker --version
   docker compose version
   ```
5. Запустіть Docker Desktop (він має працювати в фоновому режимі)

### Крок 2: Встановлення залежностей

Відкрийте PowerShell у кореневій папці проекту та виконайте:

```powershell
# Встановлення кореневих залежностей
pnpm install

# Встановлення залежностей API
cd apps/api
pnpm install
cd ../..

# Встановлення залежностей Web
cd apps/web
pnpm install
cd ../..
```

**Або встановіть все одночасно з кореня:**
```powershell
pnpm install
```
pnpm автоматично встановить залежності для всіх підпроектів.

### Крок 3: Налаштування змінних оточення

#### Автоматичне створення (рекомендовано)

Використайте вбудований скрипт для автоматичного створення `.env` файлів:

```powershell
pnpm setup:env
```

Це створить обидва `.env` файли з правильними налаштуваннями.

#### Ручне створення (альтернатива)

Якщо потрібно створити файли вручну:

**API (`apps/api/.env`):**
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**Web (`apps/web/.env`):**
```env
VITE_API_URL=http://localhost:4000
```

**⚠️ ВАЖЛИВО:** Після створення файлів змініть `JWT_SECRET` та `JWT_REFRESH_SECRET` у `apps/api/.env` на безпечні випадкові значення (мінімум 32 символи).

### Крок 4: Запуск бази даних PostgreSQL

#### Варіант A: Використання Docker (рекомендовано)

1. Перевірте наявність Docker:
   ```powershell
   pnpm docker:check
   ```

2. Запустіть PostgreSQL через Docker:
   ```powershell
   pnpm docker:up
   ```

   Це запустить PostgreSQL на порту `5432`.

#### Варіант B: Локальне встановлення PostgreSQL

Якщо Docker не встановлено:

1. Завантажте та встановіть PostgreSQL 15+ для Windows
2. Під час встановлення встановіть:
   - Порт: `5432` (за замовчуванням)
   - Пароль для користувача `postgres`: `postgres`
3. Створіть базу даних:
   ```powershell
   psql -U postgres -c "CREATE DATABASE booking;"
   ```
4. Оновіть `DATABASE_URL` у `apps/api/.env` якщо пароль відрізняється

### Крок 5: Налаштування нативних модулів (якщо потрібно)

Після першого встановлення залежностей може знадобитися дозволити build scripts:

```powershell
# Для API (bcrypt та Prisma)
cd apps/api
pnpm approve-builds bcrypt @prisma/client prisma

# Для Web (rollup) - зазвичай не потрібно
cd ../web
pnpm approve-builds rollup
cd ../..
```

### Крок 6: Налаштування бази даних

Виконайте міграції Prisma:

```powershell
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
cd ../..
```

**Примітка:** Якщо міграції вже виконані, цей крок можна пропустити.

### Крок 7: Запуск додатку

#### Запуск обох серверів одночасно (рекомендовано)

З кореневої папки проекту:

```powershell
pnpm dev
```

Це запустить:
- **API** на `http://localhost:4000`
- **Web** на `http://localhost:5173`

#### Або запуск окремо

**API** (в окремому терміналі):
```powershell
cd apps/api
pnpm dev
```

**Web** (в окремому терміналі):
```powershell
cd apps/web
pnpm dev
```

### Крок 8: Перегляд додатку

1. Відкрийте браузер та перейдіть за адресою:
   ```
   http://localhost:5173
   ```

2. Ви побачите сторінку входу/реєстрації

3. Створіть новий акаунт або увійдіть, якщо вже маєте

4. Після входу ви потрапите на Dashboard з можливістю:
   - Переглядати послуги
   - Створювати нові бронювання
   - Переглядати свої бронювання

5. API документація доступна за адресою:
   ```
   http://localhost:4000/docs
   ```

### Корисні команди

```powershell
# Створити .env файли автоматично
pnpm setup:env

# Зупинити Docker контейнери
pnpm docker:down

# Запустити Docker контейнери знову
pnpm docker:up

# Відкрити Prisma Studio (візуальний редактор БД)
cd apps/api
pnpm prisma:studio

# Запустити тести API
cd apps/api
pnpm test

# Згенерувати Prisma Client
cd apps/api
pnpm prisma:generate

# Виконати міграції Prisma
cd apps/api
pnpm prisma:migrate
```

## Troubleshooting

### Помилка підключення до бази даних

- Переконайтеся, що Docker Desktop запущений
- Перевірте, що контейнер PostgreSQL працює: `docker ps`
- Перевірте правильність `DATABASE_URL` у `apps/api/.env`

### Помилка "Port already in use"

- API займає порт 4000: змініть `PORT` у `apps/api/.env`
- Web займає порт 5173: Vite автоматично запропонує інший порт

### Помилка міграцій Prisma

- Переконайтеся, що база даних запущена
- Перевірте підключення: `pnpm docker:up`
- Спробуйте виконати міграції знову: `cd apps/api && pnpm prisma:migrate`

### Помилка з нативними модулями (bcrypt, rollup)

Якщо бачите помилки типу `Cannot find module 'bcrypt_lib.node'`:

```powershell
# Дозволити build scripts
cd apps/api
pnpm approve-builds bcrypt
cd ../web
pnpm approve-builds rollup

# Перебудувати модулі
cd ../api
pnpm rebuild bcrypt
```

### Помилка сумісності версій Swagger

Якщо бачите помилку `expected '5.x' fastify version`:

```powershell
cd apps/api
pnpm install @fastify/swagger@^8.15.0 @fastify/swagger-ui@^2.1.0
```

### Помилка "PrismaClient is not defined"

```powershell
cd apps/api
pnpm approve-builds @prisma/client prisma
pnpm prisma:generate
```

Детальні інструкції дивіться у файлі **QUICK_START.md** (розділ Troubleshooting).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services (public)
- `GET /api/services/:id` - Get service by ID (public)
- `POST /api/services` - Create service (ADMIN only)
- `PUT /api/services/:id` - Update service (ADMIN only)
- `DELETE /api/services/:id` - Delete service (ADMIN only)

### Bookings
- `POST /api/bookings` - Create booking (authenticated)
- `GET /api/bookings` - Get bookings (user's bookings, or all for ADMIN)
- `PUT /api/bookings/:id/status` - Update booking status

### Documentation
- `GET /docs` - Swagger UI documentation
- `GET /docs/json` - OpenAPI JSON specification

## Testing

Run API tests:
```powershell
cd apps/api
pnpm test
```

## Database

Access Prisma Studio:
```powershell
cd apps/api
pnpm prisma:studio
```

## Production Build

Build both API and Web:
```powershell
pnpm build
```

## Project Structure

```
booking_system/
├── apps/
│   ├── api/              # Backend API
│   │   ├── src/
│   │   │   ├── config/       # Environment configuration
│   │   │   ├── lib/          # Utilities (auth, jwt, prisma)
│   │   │   ├── middleware/   # Auth middleware, error handler
│   │   │   ├── routes/       # API routes
│   │   │   └── index.ts      # Entry point
│   │   ├── prisma/
│   │   │   └── schema.prisma # Database schema
│   │   └── package.json
│   └── web/              # Frontend Web App
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── lib/         # API client, utilities
│       │   ├── pages/       # Page components
│       │   ├── App.tsx      # Main app component
│       │   └── main.tsx     # Entry point
│       └── package.json
├── docker-compose.yml
└── package.json
```

## Deployment

### Frontend: GitHub Pages

Frontend автоматично деплоїться на GitHub Pages при push до `main` гілки.

**URL:** `https://skalevskyi.github.io/booking-system/`

**Налаштування:**
1. Settings → Pages → Source: `GitHub Actions`
2. Settings → Secrets → Actions → Додайте `VITE_API_URL` з URL вашого backend

Детальні інструкції: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

### Backend: Render/Railway

Backend можна задеплоїти на Render або Railway.

**Render:** Використайте `render.yaml` для автоматичного деплою
**Railway:** Використайте `railway.json` для автоматичного деплою

Детальні інструкції: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## License

MIT
