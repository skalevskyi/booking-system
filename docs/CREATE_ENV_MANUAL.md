# Створення .env файлів вручну

Якщо `pnpm setup:env` не працює через проблеми з кодуванням, створіть файли вручну.

## Крок 1: Створіть файл `apps/api/.env`

Створіть файл `apps/api/.env` з таким вмістом:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**ВАЖЛИВО:** 
- `JWT_SECRET` та `JWT_REFRESH_SECRET` мають бути мінімум 32 символи
- Змініть їх на безпечні випадкові значення для production

## Крок 2: Створіть файл `apps/web/.env`

Створіть файл `apps/web/.env` з таким вмістом:

```env
VITE_API_URL=http://localhost:4000
```

## Альтернатива через PowerShell (якщо працює)

```powershell
# API .env
@"
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booking?schema=public
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-long-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
"@ | Out-File -FilePath "apps\api\.env" -Encoding utf8 -NoNewline

# Web .env
@"
VITE_API_URL=http://localhost:4000
"@ | Out-File -FilePath "apps\web\.env" -Encoding utf8 -NoNewline
```

## Перевірка

Після створення файлів перезапустіть сервер:

```powershell
# Зупиніть поточний процес (Ctrl+C)
# Запустіть знову
pnpm dev
```

