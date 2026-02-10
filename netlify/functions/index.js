// Netlify Functions wrapper для WhatsApp бота
// Этот файл используется только для Netlify деплоя

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const express = require('express');
const serverless = require('serverless-http');

// Импортируем основной код из корневого index.js
// ВАЖНО: Netlify Functions не поддерживают постоянные соединения
// Рекомендуется использовать Railway или Render вместо Netlify

const app = express();
app.use(express.json());

// Простой health check для Netlify
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Netlify Functions не поддерживают постоянные соединения WhatsApp',
    recommendation: 'Используйте Railway или Render для деплоя WhatsApp бота',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    success: false,
    message: 'WhatsApp бот не может работать на Netlify Functions из-за ограничений serverless архитектуры',
    recommendation: 'Используйте Railway (railway.app) или Render (render.com) для деплоя'
  });
});

// Экспортируем для Netlify Functions
module.exports.handler = serverless(app);

