# 🚀 Деплой проекту на GitHub

## Крок 1: Перевірка та підготовка

### Перевірте .gitignore

Переконайтеся, що `.gitignore` містить всі необхідні виключення (вже оновлено).

---

## Крок 2: Ініціалізація Git репозиторію

```powershell
# Ініціалізувати git репозиторій
git init

# Додати всі файли
git add .

# Зробити перший commit
git commit -m "Initial commit: Booking System with Fastify, React, Prisma"
```

---

## Крок 3: Створення репозиторію на GitHub

### Варіант A: Через веб-інтерфейс GitHub

1. Відкрийте https://github.com
2. Натисніть **"New repository"** (або "+" → "New repository")
3. Заповніть форму:
   - **Repository name**: `booking-system` (або ваша назва)
   - **Description**: `Production-ready booking system with services, users, and time-based bookings`
   - **Visibility**: Public або Private (на ваш вибір)
   - **НЕ** додавайте README, .gitignore, або license (ми вже маємо)
4. Натисніть **"Create repository"**

### Варіант B: Через GitHub CLI (якщо встановлено)

```powershell
gh repo create booking-system --public --source=. --remote=origin --push
```

---

## Крок 4: Додавання remote та push

### Якщо створили репозиторій через веб-інтерфейс:

```powershell
# Додати remote (замініть YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/booking-system.git

# Або якщо використовуєте SSH:
# git remote add origin git@github.com:YOUR_USERNAME/booking-system.git

# Перейменувати гілку на main (якщо потрібно)
git branch -M main

# Зробити push
git push -u origin main
```

### Якщо використовували GitHub CLI:

Команда `gh repo create` вже зробила push автоматично.

---

## Крок 5: Перевірка

Відкрийте ваш репозиторій на GitHub:
```
https://github.com/YOUR_USERNAME/booking-system
```

Переконайтеся, що всі файли завантажені.

---

## Важливі примітки

### ✅ Що буде завантажено:
- Весь код проекту
- Конфігураційні файли (package.json, tsconfig.json, тощо)
- Документація (README.md, QUICK_START.md, тощо)
- Prisma схема та міграції
- Docker Compose файл

### ❌ Що НЕ буде завантажено (через .gitignore):
- `node_modules/` - залежності
- `.env` файли - конфігурація з секретами
- `dist/` та `build/` - зібрані файли
- Логи та тимчасові файли

---

## Після деплою

### Для інших розробників:

Після клонування репозиторію потрібно:

```powershell
# Клонувати репозиторій
git clone https://github.com/YOUR_USERNAME/booking-system.git
cd booking-system

# Встановити залежності
pnpm install

# Створити .env файли
pnpm setup:env

# Запустити базу даних
docker compose up -d

# Згенерувати Prisma Client
cd apps/api
pnpm prisma:generate
cd ../..

# Виконати міграції
cd apps/api
pnpm prisma:migrate
cd ../..

# Створити тестові послуги
cd apps/api
pnpm tsx prisma/seed.ts
cd ../..

# Запустити проект
pnpm dev
```

---

## Додавання README для GitHub

Якщо хочете додати README з інструкціями для GitHub, створіть або оновіть `README.md` у корені проекту (він вже існує).

---

## Оновлення коду на GitHub

Після змін у коді:

```powershell
# Додати зміни
git add .

# Зробити commit
git commit -m "Description of changes"

# Зробити push
git push
```

---

## Troubleshooting

### Помилка "remote origin already exists"

```powershell
# Видалити існуючий remote
git remote remove origin

# Додати новий
git remote add origin https://github.com/YOUR_USERNAME/booking-system.git
```

### Помилка аутентифікації

Якщо використовуєте HTTPS:
- Використайте Personal Access Token замість пароля
- Або налаштуйте SSH ключі

### Помилка "failed to push some refs"

```powershell
# Отримати зміни з GitHub
git pull origin main --allow-unrelated-histories

# Або якщо це перший push
git push -u origin main --force
```

---

**Готово!** 🎉 Ваш проект тепер на GitHub.

