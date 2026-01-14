import express from 'express';
import dotenv from 'dotenv';
import GreenAPI from './green-api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для парсинга JSON
app.use(express.json());

// Инициализация Green-API
const greenAPI = new GreenAPI();

// Хранилище для обработки команд (можно заменить на базу данных)
const commandHandlers = {
  '/start': async (chatId, greenAPI) => {
    await greenAPI.sendMessage(chatId, '👋 Привет! Я ваш WhatsApp бот. Введите /help для списка команд.');
  },
  
  '/help': async (chatId, greenAPI) => {
    const helpText = `
📋 Доступные команды:
/start - Начать работу с ботом
/help - Показать справку
/status - Проверить состояние бота
/time - Текущее время

Просто напишите мне любое сообщение, и я отвечу!
    `.trim();
    await greenAPI.sendMessage(chatId, helpText);
  },
  
  '/status': async (chatId, greenAPI) => {
    try {
      const state = await greenAPI.getStateInstance();
      await greenAPI.sendMessage(
        chatId, 
        `✅ Статус бота: ${state.stateInstance || 'Неизвестно'}`
      );
    } catch (error) {
      await greenAPI.sendMessage(chatId, '❌ Ошибка проверки статуса');
    }
  },
  
  '/time': async (chatId, greenAPI) => {
    const now = new Date();
    const timeString = now.toLocaleString('ru-RU', { 
      timeZone: 'Europe/Moscow',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    await greenAPI.sendMessage(chatId, `🕐 Текущее время: ${timeString}`);
  },
};

// Основная функция обработки сообщений
async function handleMessage(notification) {
  console.log('🔍 Обработка уведомления:', JSON.stringify(notification, null, 2));
  
  if (!notification?.body) {
    console.log('⚠️ Уведомление без body, пропускаем');
    return;
  }

  const { typeWebhook, body } = notification.body;
  console.log(`📋 Тип webhook: ${typeWebhook}`);

  // Обрабатываем только входящие сообщения
  if (typeWebhook === 'incomingMessageReceived') {
    const messageData = body.messageData;
    
    if (!messageData) {
      console.log('⚠️ Нет messageData, пропускаем');
      return;
    }

    const chatId = body.senderData?.chatId;
    console.log(`👤 ChatId: ${chatId}`);
    console.log(`📝 Тип сообщения: ${messageData.typeMessage}`);
    
    let messageText = '';

    // Обработка текстовых сообщений
    if (messageData.typeMessage === 'textMessage') {
      messageText = messageData.textMessageData?.textMessage || '';
    }
    // Обработка расшифровки голосовых сообщений
    else if (messageData.typeMessage === 'extendedTextMessage') {
      messageText = messageData.extendedTextMessageData?.text || '';
    }

    if (!chatId || !messageText) {
      console.log(`⚠️ Нет chatId (${chatId}) или messageText (${messageText}), пропускаем`);
      return;
    }

    console.log(`✅ Получено сообщение от ${chatId}: ${messageText}`);

    try {
      // Проверяем, является ли сообщение командой
      const trimmedMessage = messageText.trim().toLowerCase();
      console.log(`🔎 Проверка команды: "${trimmedMessage}"`);
      
      if (commandHandlers[trimmedMessage]) {
        // Выполняем команду
        console.log(`⚡ Выполнение команды: ${trimmedMessage}`);
        await commandHandlers[trimmedMessage](chatId, greenAPI);
        console.log(`✅ Команда ${trimmedMessage} выполнена успешно`);
      } else {
        // Эхо-ответ (можно заменить на логику с AI)
        console.log(`📤 Отправка эхо-ответа на ${chatId}`);
        const response = `Вы написали: "${messageText}"\n\nИспользуйте /help для списка команд.`;
        const result = await greenAPI.sendMessage(chatId, response);
        console.log(`✅ Сообщение отправлено успешно:`, result);
      }
    } catch (error) {
      console.error('❌ Ошибка обработки сообщения:', error.message);
      if (error.response) {
        console.error('Детали ошибки:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      }
      
      // Если ошибка 466 (номер не в контактах)
      if (error.response?.status === 466 || error.response?.data?.error === 466) {
        console.error('⚠️ Ошибка 466: Номер не в контактах или лимит превышен');
        // В этом случае бот не может ответить, но может логировать
      }
    }
  } else {
    console.log(`⚠️ Игнорируем тип webhook: ${typeWebhook}`);
  }
}

// Функция опроса уведомлений (Long Polling)
let pollCount = 0;
async function pollNotifications() {
  console.log('🔄 Начало опроса уведомлений (Long Polling)...');
  while (true) {
    try {
      pollCount++;
      // Логируем каждые 10 запросов, чтобы видеть, что polling работает
      if (pollCount % 10 === 0) {
        console.log(`🔄 Опрос уведомлений... (запрос #${pollCount})`);
      }
      
      const notification = await greenAPI.receiveNotification();
      
      if (notification) {
        console.log('📨 Получено уведомление:', JSON.stringify(notification, null, 2));
        await handleMessage(notification);
        
        // Удаляем обработанное уведомление из очереди
        if (notification.receiptId) {
          await greenAPI.deleteNotification(notification.receiptId);
          console.log('✅ Уведомление удалено из очереди');
        }
      } else {
        // Логируем каждые 50 запросов, когда нет уведомлений
        if (pollCount % 50 === 0) {
          console.log(`⏳ Ожидание уведомлений... (запрос #${pollCount}, уведомлений нет)`);
        }
      }
      
      // Небольшая задержка перед следующим запросом
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ Ошибка опроса уведомлений:', error.message);
      if (error.response) {
        console.error('Детали ошибки:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else {
        console.error('Полная ошибка:', error);
      }
      // Задержка при ошибке увеличивается
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// Webhook endpoint (альтернативный способ получения уведомлений)
app.post('/webhook', async (req, res) => {
  try {
    const notification = req.body;
    console.log('Получен webhook:', JSON.stringify(notification, null, 2));
    
    await handleMessage(notification);
    
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const state = await greenAPI.getStateInstance();
    res.json({ 
      status: 'ok', 
      botState: state.stateInstance,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
  console.log(`💚 Green-API Instance ID: ${process.env.ID_INSTANCE}`);
  
  // Проверка состояния аккаунта и настроек
  greenAPI.getStateInstance()
    .then(state => {
      console.log(`✅ Состояние аккаунта: ${state.stateInstance}`);
      if (state.stateInstance === 'authorized') {
        console.log('✅ Бот готов к работе!');
      } else {
        console.log('⚠️ Аккаунт не авторизован. Отсканируйте QR-код в личном кабинете Green-API');
      }
      
      // Проверка настроек (webhook)
      return greenAPI.getSettings();
    })
    .then(settings => {
      if (settings?.webhookUrl) {
        console.log(`⚠️ ВНИМАНИЕ: Настроен webhook URL: ${settings.webhookUrl}`);
        console.log('⚠️ Если webhook настроен, то входящие сообщения идут на webhook, а не через receiveNotification()');
        console.log('⚠️ Решение: либо удалите webhook URL из настроек инстанса, либо используйте webhook endpoint вместо polling');
      } else {
        console.log('✅ Webhook не настроен, используется Long Polling (receiveNotification)');
      }
    })
    .catch(error => {
      console.error('❌ Ошибка проверки состояния/настроек:', error.message);
    });
  
  // Запуск опроса уведомлений (если не используете webhook)
  // Если используете webhook, закомментируйте следующую строку
  pollNotifications();
});

// Обработка завершения процесса
process.on('SIGINT', () => {
  console.log('\n👋 Остановка бота...');
  process.exit(0);
});
