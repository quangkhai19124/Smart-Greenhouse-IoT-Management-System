import { Telegraf } from 'telegraf';
import { registerTelegramHandlers } from './telegram/handlers.js';

let telegramBot = null;

export const sendTelegramMessage = async (chatId, text, extra = {}) => {
  if (!telegramBot) {
    console.warn('Telegram bot is not initialized. Cannot send message.');
    return;
  }
  try {
    return await telegramBot.telegram.sendMessage(chatId, text, extra);
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
  }
};

export const initTelegramService = (app) => {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!telegramBotToken) {
    console.warn('TELEGRAM_BOT_TOKEN is not set. Telegram webhook is disabled.');
    return;
  }

  const bot = new Telegraf(telegramBotToken);
  telegramBot = bot;
  bot.catch((err, _ctx) => {
    console.error('Telegraf error while handling update', err);
  });

  bot.use(async (ctx, next) => {
    try {
      const fromId = ctx.from ? ctx.from.id : 'unknown';
      const chatId = ctx.chat ? ctx.chat.id : 'unknown';
      const text = ctx.message && ctx.message.text ? ctx.message.text : '';
      console.log(`[Telegram] updateType=${ctx.updateType} from=${fromId} chat=${chatId} text="${text}"`);
    } catch (_e) {}
    return next();
  });

  registerTelegramHandlers(bot);

  const defaultWebhookPath = '/telegram/webhook';
  let mountedWebhookPath = defaultWebhookPath;
  const fullWebhookUrl = process.env.TELEGRAM_WEBHOOK_URL;

  if (fullWebhookUrl) {
    try {
      const parsed = new URL(fullWebhookUrl);
      mountedWebhookPath = parsed.pathname || defaultWebhookPath;
    } catch (e) {
      console.warn('Invalid TELEGRAM_WEBHOOK_URL. Falling back to default path:', defaultWebhookPath);
    }
  }

  app.get('/telegram/health', (_req, res) => res.status(200).send('ok'));
  app.post(mountedWebhookPath, (req, res) => {
    try {
      const updateId = req.body && req.body.update_id ? req.body.update_id : 'unknown';
      console.log(`[Telegram] Webhook hit: ${mountedWebhookPath} update_id=${updateId}`);
    } catch (_e) {}
    res.status(200).send('ok');
    Promise.resolve(bot.handleUpdate(req.body)).catch((err) => {
      console.error('Error in bot.handleUpdate:', err);
    });
  });

  if (fullWebhookUrl) {
    bot.telegram.setWebhook(fullWebhookUrl)
      .then(() => console.log(`Telegram webhook set to: ${fullWebhookUrl}`))
      .catch((err) => console.error('Failed to set Telegram webhook:', err));
  } else {
    console.warn('TELEGRAM_WEBHOOK_URL is not set. Expose this server and set it to enable Telegram updates.');
  }
};


