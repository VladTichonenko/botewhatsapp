const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { getLanguageFromPhone, getTranslation, getCountryFromPhone } = require('./phone-utils');

// Создание клиента WhatsApp (нужно для safeReply)
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// Безопасная функция для отправки сообщений (обрабатывает разные форматы ID)
async function safeReply(msg, text) {
  // Проверяем, не является ли это каналом
  if (msg.from && msg.from.includes('@lid')) {
    console.log('⚠️ Попытка отправить сообщение в канал - не поддерживается');
    return; // Просто выходим, не пытаемся отправлять
  }

  try {
    // Пробуем обычный reply
    await msg.reply(text);
  } catch (error) {
    // Если это ошибка с каналом, просто пропускаем
    if (msg.from && msg.from.includes('@lid')) {
      console.log('⚠️ Канал не поддерживается для отправки сообщений');
      return;
    }
    
    // Если reply не работает, используем sendMessage напрямую
    console.log('⚠️ msg.reply() не сработал, используем client.sendMessage()');
    try {
      await client.sendMessage(msg.from, text);
    } catch (sendError) {
      // Если ошибка связана с каналом, просто логируем
      if (msg.from && msg.from.includes('@lid')) {
        console.log('⚠️ Канал не поддерживается для отправки сообщений');
        return;
      }
      console.error('❌ Ошибка отправки через sendMessage:', sendError);
      throw sendError;
    }
  }
}

// Хранилище для обработки команд (теперь с поддержкой языков)
const commandHandlers = {
  '/start': async (msg, language) => {
    const text = getTranslation(language, 'start');
    await safeReply(msg, text);
  },
  
  '/help': async (msg, language) => {
    const text = getTranslation(language, 'help');
    await safeReply(msg, text);
  },
  
  '/status': async (msg, language) => {
    try {
      const info = await msg.getChat();
      const statusText = getTranslation(language, 'status');
      await safeReply(msg, `${statusText}\n\nЧат: ${info.name || info.id.user || msg.from}`);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      const statusText = getTranslation(language, 'status');
      await safeReply(msg, statusText);
    }
  },
  
  '/time': async (msg, language) => {
    try {
      const now = new Date();
      // Определяем часовой пояс по стране
      const country = getCountryFromPhone(msg.from);
      const timeZone = getTimeZoneByCountry(country);
      
      const timeString = now.toLocaleString(language === 'ru' ? 'ru-RU' : language === 'es' ? 'es-ES' : 'en-US', { 
        timeZone: timeZone,
        dateStyle: 'full',
        timeStyle: 'long'
      });
      
      const timeText = getTranslation(language, 'time');
      const response = `${timeText} ${timeString}`;
      
      // Используем безопасный метод отправки
      await safeReply(msg, response);
    } catch (error) {
      console.error('Ошибка в команде /time:', error);
      throw error;
    }
  },
};

// Функция для определения часового пояса по стране
function getTimeZoneByCountry(countryCode) {
  const timeZones = {
    'RU': 'Europe/Moscow',
    'KZ': 'Asia/Almaty',
    'BY': 'Europe/Minsk',
    'UA': 'Europe/Kyiv',
    'ES': 'Europe/Madrid',
    'MX': 'America/Mexico_City',
    'AR': 'America/Argentina/Buenos_Aires',
    'US': 'America/New_York',
    'GB': 'Europe/London',
    'DE': 'Europe/Berlin',
    'FR': 'Europe/Paris',
    'IT': 'Europe/Rome',
    // Добавьте больше по необходимости
  };
  
  return timeZones[countryCode] || 'UTC';
}

// Обработка QR-кода для авторизации
client.on('qr', (qr) => {
  console.log('📱 Отсканируйте QR-код ниже для авторизации:');
  qrcode.generate(qr, { small: true });
});

// Обработка готовности клиента
client.on('ready', () => {
  console.log('✅ Бот готов к работе!');
  console.log('📱 WhatsApp бот запущен и готов получать сообщения');
});

// Обработка авторизации
client.on('authenticated', () => {
  console.log('✅ Авторизация успешна!');
});

// Обработка ошибок авторизации
client.on('auth_failure', (msg) => {
  console.error('❌ Ошибка авторизации:', msg);
});

// Обработка отключения
client.on('disconnected', (reason) => {
  console.log('⚠️ Бот отключен:', reason);
});

// Обработка входящих сообщений
client.on('message', async (msg) => {
  try {
    // Пропускаем сообщения от самого бота
    if (msg.from === 'status@broadcast') {
      return;
    }

    // Пропускаем каналы (@lid) - whatsapp-web.js не поддерживает отправку в каналы
    if (msg.from.includes('@lid')) {
      console.log(`⚠️ Пропущено сообщение из канала (не поддерживается): ${msg.from}`);
      return;
    }

    const messageText = msg.body.trim();
    const chatId = msg.from;
    
    // Определяем язык пользователя по номеру телефона
    const userLanguage = getLanguageFromPhone(chatId);
    const userCountry = getCountryFromPhone(chatId);
    
    console.log(`📨 Получено сообщение от ${chatId} (${userCountry || 'неизвестно'}, язык: ${userLanguage}): ${messageText}`);

    // Проверяем, является ли сообщение командой
    const trimmedMessage = messageText.toLowerCase();
    
    if (commandHandlers[trimmedMessage]) {
      // Выполняем команду с учетом языка пользователя
      console.log(`⚡ Выполнение команды: ${trimmedMessage} (язык: ${userLanguage})`);
      await commandHandlers[trimmedMessage](msg, userLanguage);
      console.log(`✅ Команда ${trimmedMessage} выполнена успешно`);
    } else {
      // Эхо-ответ на языке пользователя
      console.log(`📤 Отправка эхо-ответа на ${chatId} (язык: ${userLanguage})`);
      const echoText = getTranslation(userLanguage, 'echo');
      const useHelpText = getTranslation(userLanguage, 'useHelp');
      const response = `${echoText} "${messageText}"\n\n${useHelpText}`;
      await safeReply(msg, response);
      console.log(`✅ Сообщение отправлено успешно`);
    }
  } catch (error) {
    console.error('❌ Ошибка обработки сообщения:', error);
    
    try {
      // Определяем язык для сообщения об ошибке
      const userLanguage = getLanguageFromPhone(msg.from);
      const errorText = getTranslation(userLanguage, 'error');
      await safeReply(msg, errorText);
    } catch (replyError) {
      console.error('❌ Ошибка отправки ответа об ошибке:', replyError);
      // Последняя попытка - через client.sendMessage напрямую
      try {
        await client.sendMessage(msg.from, '❌ Произошла ошибка. Попробуйте позже.');
      } catch (finalError) {
        console.error('❌ Критическая ошибка отправки сообщения:', finalError);
      }
    }
  }
});

// Обработка ошибок
client.on('error', (error) => {
  console.error('❌ Ошибка клиента:', error);
});

// Инициализация клиента
console.log('🔄 Инициализация WhatsApp бота...');
client.initialize();

// Обработка завершения процесса
process.on('SIGINT', async () => {
  console.log('\n👋 Остановка бота...');
  await client.destroy();
  process.exit(0);
});
