# 🚀 Инструкция по деплою WhatsApp бота

Этот документ содержит подробные инструкции по развертыванию WhatsApp бота на различных платформах.

## ⚠️ Важные замечания

**WhatsApp бот требует постоянного соединения**, поэтому:

1. **Netlify и Vercel (Serverless)** - НЕ РЕКОМЕНДУЮТСЯ для WhatsApp ботов, так как:
   - Они "засыпают" при отсутствии активности
   - Не поддерживают постоянные соединения
   - Ограничения по времени выполнения (таймауты)

2. **Рекомендуемые платформы:**
   - **Railway** (railway.app) - лучший вариант, бесплатный тариф
   - **Render** (render.com) - бесплатный тариф с автоматическим пробуждением
   - **Fly.io** (fly.io) - хорошая альтернатива
   - **Heroku** (heroku.com) - платный, но надежный
   - **VPS** (DigitalOcean, AWS EC2, etc.) - полный контроль

> 📚 **Полный список бесплатных серверов:** См. [БЕСПЛАТНЫЕ_СЕРВЕРЫ.md](./БЕСПЛАТНЫЕ_СЕРВЕРЫ.md) для детального сравнения всех доступных платформ

## 📋 Подготовка проекта

### 1. Установите зависимости

```bash
npm install
```

### 2. Настройте переменные окружения

Создайте файл `.env` на основе `.env.example`:

```env
SERVER_URL=http://localhost:3000
BOT_PORT=3001
NODE_ENV=production
```

### 3. Проверьте работу локально

```bash
npm start
```

Отсканируйте QR-код для авторизации WhatsApp.

---

## 🚂 Деплой на Railway (РЕКОМЕНДУЕТСЯ)

Railway - лучший вариант для WhatsApp ботов благодаря:
- Бесплатному тарифу
- Постоянному серверу (не засыпает)
- Простому деплою

### Шаги:

1. **Зарегистрируйтесь на [railway.app](https://railway.app)**

2. **Создайте новый проект:**
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo" (или "Empty Project")

3. **Подключите репозиторий:**
   - Если выбрали GitHub: выберите ваш репозиторий
   - Если выбрали Empty: загрузите код через Railway CLI

4. **Настройте переменные окружения:**
   - Перейдите в Settings → Variables
   - Добавьте:
     ```
     SERVER_URL=ваш_сервер_url
     BOT_PORT=3001
     NODE_ENV=production
     ```

5. **Настройте деплой:**
   - Railway автоматически определит Node.js проект
   - **ВАЖНО:** В Settings → Service → Build выберите "Dockerfile" (для поддержки Puppeteer)
   - Убедитесь, что команда запуска: `npm start`
   - Порт будет автоматически определен

6. **Деплой:**
   - Railway автоматически задеплоит проект
   - Проверьте логи в разделе "Deployments"
   - Найдите QR-код в логах и отсканируйте его

> ⚠️ **Если возникла ошибка с Puppeteer:** См. [RAILWAY_FIX.md](./RAILWAY_FIX.md) для решения проблемы с `libglib-2.0.so.0`

7. **Настройте домен (опционально):**
   - Settings → Domains
   - Railway предоставит бесплатный домен

---

## 🎨 Деплой на Render

Render также подходит для WhatsApp ботов.

### Шаги:

1. **Зарегистрируйтесь на [render.com](https://render.com)**

2. **Создайте новый Web Service:**
   - New → Web Service
   - Подключите GitHub репозиторий

3. **Настройте сервис:**
   - **Name:** whatsapp-bot
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (или выберите платный)

4. **Добавьте переменные окружения:**
   - Environment → Environment Variables
   - Добавьте все переменные из `.env`

5. **Настройте Health Check:**
   - Advanced → Health Check Path: `/api/health`
   - Это предотвратит "засыпание" сервиса

6. **Деплой:**
   - Нажмите "Create Web Service"
   - Дождитесь завершения деплоя
   - Проверьте логи и отсканируйте QR-код

---

## ✈️ Деплой на Fly.io

### Шаги:

1. **Установите Fly CLI:**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   
   # Mac/Linux
   curl -L https://fly.io/install.sh | sh
   ```

2. **Войдите в Fly.io:**
   ```bash
   fly auth login
   ```

3. **Создайте приложение:**
   ```bash
   fly launch
   ```

4. **Настройте переменные окружения:**
   ```bash
   fly secrets set SERVER_URL=ваш_сервер_url
   fly secrets set BOT_PORT=3001
   fly secrets set NODE_ENV=production
   ```

5. **Деплой:**
   ```bash
   fly deploy
   ```

6. **Проверьте логи:**
   ```bash
   fly logs
   ```

---

## 🌐 Деплой на VPS (DigitalOcean, AWS EC2, etc.)

### Шаги:

1. **Подключитесь к серверу:**
   ```bash
   ssh user@your-server-ip
   ```

2. **Установите Node.js:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Установите PM2 (менеджер процессов):**
   ```bash
   sudo npm install -g pm2
   ```

4. **Клонируйте репозиторий:**
   ```bash
   git clone ваш_репозиторий
   cd botewhatsapp
   ```

5. **Установите зависимости:**
   ```bash
   npm install
   ```

6. **Создайте .env файл:**
   ```bash
   nano .env
   # Добавьте переменные окружения
   ```

7. **Запустите с PM2:**
   ```bash
   pm2 start index.js --name whatsapp-bot
   pm2 save
   pm2 startup
   ```

8. **Настройте автозапуск:**
   ```bash
   pm2 startup
   # Выполните команду, которую выведет PM2
   ```

---

## 🔧 Настройка Keep-Alive (предотвращение "засыпания")

Бот уже имеет встроенный механизм keep-alive, который:
- Делает запросы к `/api/health` каждые 30 секунд
- Предотвращает "засыпание" на serverless платформах

### Дополнительная настройка (опционально):

#### Использование внешнего сервиса для пинга:

1. **UptimeRobot** (uptimerobot.com):
   - Создайте аккаунт
   - Добавьте монитор типа "HTTP(s)"
   - URL: `https://ваш-домен.com/api/health`
   - Интервал: 5 минут

2. **Cron-job.org**:
   - Создайте задачу
   - URL: `https://ваш-домен.com/api/health`
   - Расписание: каждые 5 минут

3. **GitHub Actions** (если используете GitHub):
   ```yaml
   # .github/workflows/keep-alive.yml
   name: Keep Alive
   on:
     schedule:
       - cron: '*/5 * * * *' # Каждые 5 минут
   jobs:
     ping:
       runs-on: ubuntu-latest
       steps:
         - name: Ping server
           run: curl https://ваш-домен.com/api/health
   ```

---

## 📊 Мониторинг и логи

### Проверка статуса бота:

```bash
# Через API
curl https://ваш-домен.com/api/status

# Ответ:
{
  "success": true,
  "ready": true,
  "state": "CONNECTED",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600
}
```

### Просмотр логов:

**Railway:**
- Откройте проект → Deployments → View Logs

**Render:**
- Откройте сервис → Logs

**Fly.io:**
```bash
fly logs
```

**VPS (PM2):**
```bash
pm2 logs whatsapp-bot
```

---

## 🔐 Безопасность

1. **Никогда не коммитьте `.env` файл в Git**
2. **Используйте переменные окружения на платформе**
3. **Ограничьте доступ к API endpoints** (добавьте авторизацию)
4. **Регулярно обновляйте зависимости:**
   ```bash
   npm audit
   npm update
   ```

---

## 🐛 Решение проблем

### Бот не отвечает:

1. **Проверьте логи** на наличие ошибок
2. **Проверьте статус:** `GET /api/status`
3. **Проверьте подключение WhatsApp:**
   - Убедитесь, что QR-код отсканирован
   - Проверьте, что телефон с WhatsApp подключен к интернету

### Бот "засыпает":

1. **Убедитесь, что keep-alive работает:**
   - Проверьте логи на наличие `[KEEP-ALIVE]`
   - Настройте внешний сервис для пинга

2. **Для Render:**
   - Включите Health Check в настройках
   - Убедитесь, что путь `/api/health` доступен

3. **Для Railway:**
   - Railway не засыпает, но проверьте, что сервис запущен

### Ошибки авторизации:

1. **Удалите папку `.wwebjs_auth`:**
   ```bash
   rm -rf .wwebjs_auth
   ```

2. **Перезапустите бота**

3. **Отсканируйте QR-код заново**

---

## 📝 Чек-лист перед деплоем

- [ ] Все зависимости установлены (`npm install`)
- [ ] Переменные окружения настроены
- [ ] Бот работает локально
- [ ] QR-код отсканирован и авторизация прошла
- [ ] Health check endpoint работает (`/api/health`)
- [ ] Keep-alive механизм активен
- [ ] Логи доступны для просмотра
- [ ] Мониторинг настроен (опционально)

---

## 🎉 Готово!

После успешного деплоя ваш бот будет:
- ✅ Работать 24/7
- ✅ Не засыпать благодаря keep-alive
- ✅ Автоматически переподключаться при сбоях
- ✅ Отвечать на сообщения в WhatsApp

**Удачи с деплоем! 🚀**

