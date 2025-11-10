# Виправлення проблем з нативними модулями (bcrypt, rollup)

## Проблема

1. **bcrypt** - не може знайти нативний модуль `bcrypt_lib.node`
2. **rollup** - не може знайти `@rollup/rollup-win32-x64-msvc`

## Рішення

### Крок 1: Дозволити виконання build scripts

Виконайте в терміналі:

```powershell
# Для API (bcrypt)
cd apps\api
pnpm approve-builds bcrypt

# Для Web (rollup)
cd ..\web
pnpm approve-builds rollup
```

### Крок 2: Перевстановити залежності з перебудовою

```powershell
# API - перебудувати bcrypt
cd apps\api
pnpm install --force
pnpm rebuild bcrypt

# Web - перевстановити з optional dependencies
cd ..\web
pnpm install --force
```

### Крок 3: Альтернативне рішення (якщо не працює)

Якщо вище не допомогло, спробуйте:

#### Для bcrypt - використати bcryptjs (JavaScript реалізація)

```powershell
cd apps\api
pnpm remove bcrypt @types/bcrypt
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

Потрібно оновити імпорти в `apps/api/src/lib/auth.ts`:
- Замінити `import bcrypt from 'bcrypt'` на `import bcrypt from 'bcryptjs'`

#### Для rollup - перевстановити Vite

```powershell
cd apps\web
pnpm remove vite
pnpm add vite@latest
```

### Крок 4: Повний перезапуск

```powershell
# З кореня проекту
cd ..\..
pnpm dev
```

## Якщо все ще не працює

Перевірте, чи встановлені інструменти для компіляції:

1. **Visual Studio Build Tools** (рекомендовано):
   - Завантажте з: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Встановіть "Desktop development with C++"

2. Або встановіть через npm (може не працювати на нових версіях Node.js):
   ```powershell
   npm install -g windows-build-tools
   ```

## Швидке рішення (рекомендовано)

```powershell
# 1. Дозволити build scripts
cd apps\api
pnpm approve-builds bcrypt
cd ..\web
pnpm approve-builds rollup

# 2. Перевстановити залежності
cd ..\api
pnpm install --force
cd ..\web
pnpm install --force

# 3. Перебудувати нативні модулі
cd ..\api
pnpm rebuild bcrypt

# 4. Запустити проект
cd ..\..
pnpm dev
```

