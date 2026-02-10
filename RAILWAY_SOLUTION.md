# 🔧 Полное решение проблемы Puppeteer на Railway

## ❌ Ошибка:
```
Error: Failed to launch the browser process: Code: 127
libglib-2.0.so.0: cannot open shared object file: No such file or directory
```

## ✅ Решение 1: Обновить railway.json (САМОЕ ПРОСТОЕ)

Файл `railway.json` уже обновлен! Теперь Railway будет использовать Dockerfile автоматически.

### Что делать:

1. **Закоммитьте изменения в Git:**
   ```bash
   git add railway.json Dockerfile
   git commit -m "Fix Puppeteer dependencies for Railway"
   git push
   ```

2. **Railway автоматически пересоберет проект** после push

3. **Проверьте логи** - ошибка должна исчезнуть

---

## ✅ Решение 2: Вручную выбрать Dockerfile в Railway

Если автоматическое определение не сработало:

1. Откройте проект на Railway
2. Перейдите в **Settings** → **Service**
3. В разделе **"Build"** найдите **"Builder"**
4. Выберите **"Dockerfile"** вместо "Nixpacks"
5. Сохраните изменения
6. Перейдите в **Deployments** → нажмите **"Redeploy"**

---

## ✅ Решение 3: Использовать готовый образ Puppeteer

Если проблемы продолжаются, используйте готовый образ:

1. **Переименуйте файл:**
   - `Dockerfile.puppeteer` → `Dockerfile`
   - (или удалите старый Dockerfile и переименуйте)

2. **Закоммитьте изменения:**
   ```bash
   git add Dockerfile
   git commit -m "Use Puppeteer base image"
   git push
   ```

3. **Railway автоматически пересоберет** с новым Dockerfile

---

## ✅ Решение 4: Исправить nixpacks.toml

Если Railway все еще использует Nixpacks:

1. Убедитесь, что файл `nixpacks.toml` правильный (уже создан)
2. Удалите `railway.json` временно (чтобы Railway использовал nixpacks.toml)
3. Или явно укажите в Railway использовать Nixpacks, но с правильным nixpacks.toml

---

## 🎯 Рекомендуемый порядок действий:

### Шаг 1: Проверьте файлы
Убедитесь, что в корне проекта есть:
- ✅ `Dockerfile` (основной)
- ✅ `Dockerfile.puppeteer` (альтернативный)
- ✅ `railway.json` (обновлен для использования Dockerfile)
- ✅ `nixpacks.toml` (запасной вариант)

### Шаг 2: Закоммитьте изменения
```bash
git add .
git commit -m "Fix Puppeteer dependencies"
git push
```

### Шаг 3: Проверьте Railway
1. Откройте проект на Railway
2. Проверьте, что в **Settings → Service → Build** выбран **"Dockerfile"**
3. Если нет - выберите вручную и сохраните

### Шаг 4: Перезапустите деплой
1. Перейдите в **Deployments**
2. Нажмите **"Redeploy"**
3. Дождитесь завершения сборки

### Шаг 5: Проверьте логи
После перезапуска должно быть:
```
✅ Бот готов к работе!
📱 WhatsApp бот запущен и готов получать сообщения
```

И QR-код для авторизации.

---

## 🔍 Диагностика:

### Если ошибка все еще есть:

1. **Проверьте логи Railway:**
   - Откройте Deployments → View Logs
   - Найдите строки с "Error" или "Failed"

2. **Проверьте, какой builder используется:**
   - Settings → Service → Build → Builder
   - Должно быть "Dockerfile"

3. **Попробуйте удалить и создать проект заново:**
   - Удалите проект на Railway
   - Создайте новый проект
   - Подключите репозиторий
   - Railway автоматически определит Dockerfile

---

## 📝 Альтернатива: Использовать другой сервер

Если Railway продолжает вызывать проблемы, попробуйте:

1. **Render** (render.com) - часто лучше работает с Puppeteer
2. **Fly.io** (fly.io) - хорошая альтернатива
3. **Oracle Cloud Free Tier** - полный контроль

Инструкции для всех платформ: см. [DEPLOY.md](./DEPLOY.md)

---

## ✅ После успешного исправления:

Вы должны увидеть в логах:
- ✅ Успешная сборка Docker образа
- ✅ Установка зависимостей
- ✅ Запуск бота
- ✅ QR-код для авторизации

**Удачи! 🚀**

