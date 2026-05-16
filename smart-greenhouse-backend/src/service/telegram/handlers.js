import { getLatestSensorReadings, getInfoUserService, getAllDevice } from './dataService.js';
import { classifyTelegramIntent } from './nlp.js';
import deviceService from '../deviceService.js';

export const registerTelegramHandlers = (bot) => {
  bot.start(async (ctx) => {
    try {
      const user = await getInfoUserService(ctx.from?.id || '');
      if (!user) {
        await ctx.reply(`Bạn chưa kết nối với bot. Vui lòng cài đặt Telegram Chat ID tại ${process.env.REACT_URL}/settings \n\nChat ID của bạn: ${ctx.chat.id}`);
        return;
      }

      await ctx.reply(`Xin chào ${user.username}! Tôi là bot quản lý hệ thống Greenhouse của bạn. Tôi có thể giúp bạn theo dõi và quản lý hệ thống Greenhouse của bạn.`);
    } catch (error) {
      console.error('Error replying to /start:', error);
    }
  });

  bot.on('text', async (ctx) => {
    try {
      console.log('[Telegram] on text handler triggered');
      await ctx.sendChatAction('typing');

      const devices = await getAllDevice();
      console.log('devices: ', devices);

      const user = await getInfoUserService(ctx.from?.id || '');
      if (!user) {
        await ctx.reply(`Bạn chưa kết nối với bot. Vui lòng cài đặt Telegram Chat ID tại ${process.env.REACT_URL}/settings \n\nChat ID của bạn: ${ctx.chat.id}`);
        return;
      }

      const text = ctx.message?.text || '';

      // Dùng Gemini để hiểu intent tổng hợp (sensor data / điều khiển thiết bị / khác)
      const intent = await classifyTelegramIntent(text, devices);
      console.log('Telegram intent from Gemini:', intent);

      // Không hiểu / không thuộc 2 loại trên
      if (!intent || intent.intent === 'OTHER') {
        await ctx.reply('Xin lỗi, tôi không hiểu yêu cầu của bạn.');
        return;
      }

      // 1️⃣ Intent: hỏi dữ liệu cảm biến
      if (intent.intent === 'SENSOR_DATA') {
        const data = await getLatestSensorReadings();
        const json = JSON.stringify(data, null, 2);

        const maxLen = 3800;
        if (json.length <= maxLen) {
          await ctx.reply(
            `Dữ liệu cảm biến mới nhất ghi nhận được\n\n<pre>${json}</pre>`,
            { parse_mode: 'HTML' }
          );
        } else {
          let i = 0;
          while (i < json.length) {
            const chunk = json.slice(i, i + maxLen);
            await ctx.reply(`<pre>${chunk}</pre>`, { parse_mode: 'HTML' });
            i += maxLen;
          }
        }
        return;
      }

      // 2️⃣ Intent: điều khiển thiết bị
      if (intent.intent === 'DEVICE_CONTROL') {
        if (!intent.deviceId) {
          await ctx.reply('Tôi không xác định được thiết bị bạn muốn điều khiển.');
          return;
        }
        if (!intent.desiredStatus) {
          await ctx.reply('Tôi không xác định được bạn muốn bật hay tắt thiết bị.');
          return;
        }

        const target = devices.find((d) => d.id === intent.deviceId);
        if (!target) {
          await ctx.reply(`Không tìm thấy thiết bị với ID ${intent.deviceId}.`);
          return;
        }

        // Chuẩn hóa power mong muốn (0–100)
        let desiredPower = intent.desiredPower;
        if (desiredPower === null || desiredPower === undefined || Number.isNaN(desiredPower)) {
          desiredPower = intent.desiredStatus === 'ON' ? 100 : 0;
        }

        const currentPower = Number(target.power || 0);

        // Nếu đã đúng trạng thái + đúng power thì không cần hành động
        if (target.status === intent.desiredStatus && currentPower === desiredPower) {
          await ctx.reply(
            `Thiết bị "${target.deviceName}" hiện đã đang ở trạng thái ${intent.desiredStatus} với power ${currentPower}%.`
          );
          return;
        }

        // Gọi hàm điều khiển hỗ trợ power
        const result = await deviceService.controlDeviceFromTelegram(
          target.id,
          intent.desiredStatus,
          desiredPower
        );

        if (result?.EC === 0) {
          await ctx.reply(
            `Đã điều khiển thiết bị "${target.deviceName}". Trạng thái mới: ${result.DT?.status || intent.desiredStatus} với power ${result.DT?.power ?? desiredPower}%.`
          );
        } else if (result?.EC === 0 && result?.EM === 'Device already in desired status and power') {
          // Phòng trường hợp service trả về message này
          await ctx.reply(
            `Thiết bị "${target.deviceName}" hiện đã đang ở trạng thái ${intent.desiredStatus} với power ${desiredPower}%.`
          );
        } else {
          await ctx.reply(
            `Không thể điều khiển thiết bị "${target.deviceName}": ${
              result?.EM || 'Đã xảy ra lỗi'
            }`
          );
        }
        return;
      }
    } catch (error) {
      console.error('Error replying to Telegram message:', error);
      try { await ctx.reply('Đã xãy ra lỗi, vui lòng thử lại sau.'); } catch (_) { }
    }
  });
};


