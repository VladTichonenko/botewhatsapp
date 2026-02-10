# 🔧 Решение проблемы с Puppeteer на Railway

## ❌ Ошибка:

```
Error: Failed to launch the browser process: Code: 127
libglib-2.0.so.0: cannot open shared object file: No such file or directory
```

## ✅ Решение:

Эта ошибка возникает потому, что на Railway не установлены системные библиотеки, необходимые для Chrome/Puppeteer.

### Вариант 1: Использовать Dockerfile (РЕКОМЕНДУЕТСЯ)

1. **Убедитесь, что файл `Dockerfile` есть в корне проекта** (уже создан)

2. **В настройках Railway:**
   - Откройте ваш проект на Railway
   - Перейдите в Settings → Service
   - В разделе "Build" выберите "Dockerfile" вместо "Nixpacks"
   - Сохраните изменения

3. **Перезапустите деплой:**
   - Railway автоматически пересоберет проект с Dockerfile
   - Все необходимые библиотеки будут установлены

### Вариант 2: Использовать nixpacks.toml

1. **Убедитесь, что файл `nixpacks.toml` есть в корне проекта** (уже создан)

2. **Railway автоматически использует этот файл** при следующем деплое

3. **Если не работает, попробуйте:**
   - Удалите проект на Railway
   - Создайте новый проект
   - Подключите репозиторий заново

### Вариант 3: Ручная установка через build команду

Если Dockerfile и nixpacks.toml не работают:

1. **В настройках Railway:**
   - Settings → Variables
   - Добавьте переменную: `RAILWAY_BUILD_COMMAND`
   - Значение:
   ```bash
   apt-get update && apt-get install -y wget gnupg ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 libatk1.0-0 libatspi2.0-0 libcups2 libdbus-1-3 libdrm2 libgbm1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release xdg-utils && npm install
   ```

2. **Перезапустите деплой**

## 🚀 Быстрое решение (пошагово):

### Шаг 1: Проверьте файлы
Убедитесь, что в корне проекта есть:
- ✅ `Dockerfile` (уже создан)
- ✅ `nixpacks.toml` (уже создан)

### Шаг 2: Настройте Railway
1. Откройте ваш проект на Railway
2. Settings → Service → Build → выберите "Dockerfile"
3. Сохраните

### Шаг 3: Перезапустите
1. Deployments → нажмите "Redeploy"
2. Дождитесь завершения сборки
3. Проверьте логи - ошибка должна исчезнуть

## 📝 Альтернативное решение: Использовать другой образ

Если проблемы продолжаются, можно использовать готовый образ с Puppeteer:

### Обновить Dockerfile:

```dockerfile
FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "index.js"]
```

Этот образ уже содержит все необходимые зависимости для Puppeteer.

## ⚠️ Важные замечания:

1. **Dockerfile предпочтительнее** - он более надежный и быстрый
2. **После изменения настроек** обязательно перезапустите деплой
3. **Проверьте логи** после перезапуска - должны исчезнуть ошибки про libglib

## 🐛 Если проблема не решена:

1. **Проверьте логи Railway:**
   - Откройте Deployments → View Logs
   - Найдите ошибки

2. **Попробуйте другой подход:**
   - Используйте готовый образ: `ghcr.io/puppeteer/puppeteer:latest`
   - Или используйте другую платформу (Render, Fly.io)

3. **Проверьте версию Node.js:**
   - Railway должен использовать Node.js 18
   - В Settings → Variables можно установить `NODE_VERSION=18`

## ✅ После исправления:

После успешного деплоя вы должны увидеть в логах:
```
✅ Бот готов к работе!
📱 WhatsApp бот запущен и готов получать сообщения
```

И QR-код для авторизации.

---

**Нужна помощь?** Проверьте логи Railway и убедитесь, что Dockerfile используется для сборки.

