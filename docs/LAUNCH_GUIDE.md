# 🚀 Покроковий гайд запуску проекту

## Передумови

Переконайтеся, що встановлено:
- ✅ Node.js 20+ (`node --version`)
- ✅ pnpm (`pnpm --version`)
- ✅ Docker Desktop (запущений)

---

## Крок 1: Створення .env файлів

```powershell
pnpm setup:env
```

Це створить:
- `apps/api/.env` - конфігурація API
- `apps/web/.env` - конфігурація Web

**Якщо команда не працює**, створіть файли вручну:

### `apps/api/.env`:
```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### `apps/web/.env`:
```env
VITE_API_URL=http://localhost:4000
```

---

## Крок 2: Запуск бази даних PostgreSQL

```powershell
docker compose up -d
```

**Перевірка:**
```powershell
docker ps
```

Має бути контейнер `booking_system-db-1` зі статусом `Up`.

---

## Крок 3: Встановлення залежностей

```powershell
pnpm install
```

Це автоматично встановить залежності для всіх підпроектів.

---

## Крок 4: Налаштування нативних модулів

### Для API (bcrypt та Prisma):

```powershell
cd apps\api
pnpm approve-builds bcrypt @prisma/client prisma
cd ..\..
```

### Для Web (rollup - зазвичай не потрібно):

```powershell
cd apps\web
pnpm approve-builds rollup
cd ..\..
```

---

## Крок 5: Генерація Prisma Client

```powershell
cd apps\api
pnpm prisma:generate
cd ..\..
```

---

## Крок 6: Виконання міграцій бази даних

```powershell
cd apps\api
pnpm prisma:migrate
cd ..\..
```

Якщо міграції вже виконані, побачите: `Already in sync, no schema change or pending migration was found.`

---

## Крок 7: Створення тестових послуг (seed)

```powershell
cd apps\api
pnpm tsx prisma/seed.ts
cd ..\..
```

Це створить 4 тестові послуги:
- Haircut (30 min, $25.00)
- Haircut & Styling (60 min, $40.00)
- Beard Trim (15 min, $15.00)
- Full Service (90 min, $55.00)

**Примітка:** Seed скрипт не створює дублікати, якщо послуги вже існують.

---

## Крок 8: Запуск проекту

```powershell
pnpm dev
```

Це запустить:
- **API сервер** на `http://localhost:4000`
- **Web додаток** на `http://localhost:5173`

**Перевірка успішного запуску:**

У терміналі має бути:
```
🚀 Server running on http://localhost:4000
Local: http://localhost:5173/
```

---

## Крок 9: Перевірка роботи

### 1. Health Check API:
Відкрийте в браузері: `http://localhost:4000/health`
- Має повернути: `{"status":"ok"}`

### 2. Swagger UI:
Відкрийте в браузері: `http://localhost:4000/docs`
- Має відкритися документація API

### 3. Frontend:
Відкрийте в браузері: `http://localhost:5173`
- Має відкритися сторінка входу/реєстрації

### 4. Перевірка послуг:
Відкрийте в браузері: `http://localhost:4000/api/services`
- Має повернути масив з 4 послугами

---

## Швидкий старт (всі команди разом)

Якщо все вже налаштовано, достатньо:

```powershell
# 1. Запустити базу даних
docker compose up -d

# 2. Запустити проект
pnpm dev
```

---

## Troubleshooting

### Помилка "Cannot find module 'bcrypt_lib.node'"

```powershell
cd apps\api
pnpm approve-builds bcrypt
pnpm rebuild bcrypt
cd ..\..
```

### Помилка "PrismaClient is not defined"

```powershell
cd apps\api
pnpm approve-builds @prisma/client prisma
pnpm prisma:generate
cd ..\..
```

### Помилка "Port already in use"

- Змініть `PORT` у `apps/api/.env`
- Або зупиніть процес, який використовує порт

### Помилка підключення до бази даних

```powershell
# Перевірте статус контейнера
docker ps

# Перезапустіть контейнер
docker compose restart

# Перевірте логи
docker compose logs db
```

### Послуги не відображаються

```powershell
# Створіть послуги через seed
cd apps\api
pnpm tsx prisma/seed.ts
cd ..\..

# Перезапустіть сервер
# (Ctrl+C, потім pnpm dev)
```

---

## Структура URL-адрес

- **Frontend**: http://localhost:5173
- **API Base**: http://localhost:4000
- **API Health**: http://localhost:4000/health
- **Swagger UI**: http://localhost:4000/docs
- **API Services**: http://localhost:4000/api/services
- **API Auth**: http://localhost:4000/api/auth

---

## Після першого запуску

Надалі для запуску достатньо:

```powershell
# 1. Запустити базу даних (якщо не запущена)
docker compose up -d

# 2. Запустити проект
pnpm dev
```

Кроки 1-7 потрібні лише один раз (або після змін у конфігурації/схемі БД).

---

## Корисні команди

```powershell
# Зупинити Docker контейнери
docker compose down

# Перезапустити Docker контейнери
docker compose restart

# Відкрити Prisma Studio (візуальний редактор БД)
cd apps\api
pnpm prisma:studio
# Відкриється в браузері на http://localhost:5555

# Перевірити логи бази даних
docker compose logs db

# Перевірити статус контейнерів
docker ps
```

---

**Готово!** 🎉 Проект має працювати.

Якщо виникли проблеми, дивіться розділ Troubleshooting або перевірте детальні інструкції у файлі `QUICK_START.md`.

