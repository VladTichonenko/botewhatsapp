const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Хранилище для обработки команд
const commandHandlers = {
  '/start': async (msg) => {
    await msg.reply('👋 Привет! Я ваш WhatsApp бот. Введите /help для списка команд.');
  },
  
  '/help': async (msg) => {
    const helpText = `📋 Доступные команды:
/start - Начать работу с ботом
/help - Показать справку
/status - Проверить состояние бота
/time - Текущее время

Просто напишите мне любое сообщение, и я отвечу!`;
    await msg.reply(helpText);
  },
  
  '/status': async (msg) => {
    try {
      const info = await msg.getChat();
      await msg.reply(`✅ Бот работает! Статус: готов к работе\n\nЧат: ${info.name || info.id.user}`);
    } catch (error) {
      console.error('Ошибка проверки статуса:', error);
      await msg.reply('✅ Бот работает!');
    }
  },
  
  '/time': async (msg) => {
    const now = new Date();
    const timeString = now.toLocaleString('ru-RU', { 
      timeZone: 'Europe/Moscow',
      dateStyle: 'full',
      timeStyle: 'long'
    });
    await msg.reply(`🕐 Текущее время: ${timeString}`);
  },
};

// Создание клиента WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: './.wwebjs_auth'
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

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

    const messageText = msg.body.trim();
    const chatId = msg.from;
    
    console.log(`📨 Получено сообщение от ${chatId}: ${messageText}`);

    // Проверяем, является ли сообщение командой
    const trimmedMessage = messageText.toLowerCase();
    
    if (commandHandlers[trimmedMessage]) {
      // Выполняем команду
      console.log(`⚡ Выполнение команды: ${trimmedMessage}`);
      await commandHandlers[trimmedMessage](msg);
      console.log(`✅ Команда ${trimmedMessage} выполнена успешно`);
    } else {
      // Эхо-ответ
      console.log(`📤 Отправка эхо-ответа на ${chatId}`);
      const response = `Вы написали: "${messageText}"\n\nИспользуйте /help для списка команд.`;
      await msg.reply(response);
      console.log(`✅ Сообщение отправлено успешно`);
    }
  } catch (error) {
    console.error('❌ Ошибка обработки сообщения:', error);
    
    try {
      await msg.reply('❌ Произошла ошибка при обработке сообщения. Попробуйте еще раз.');
    } catch (replyError) {
      console.error('❌ Ошибка отправки ответа об ошибке:', replyError);
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
