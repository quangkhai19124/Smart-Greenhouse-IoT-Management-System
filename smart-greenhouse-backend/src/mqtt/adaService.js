import mqtt from 'mqtt';
import { fn, literal, Op } from 'sequelize';
import deviceService from '../service/deviceService.js';
import db from '../models/index.js';
import sensorEmitter from './sensorEmitter.js';
import setRuleService from '../service/setRuleService.js';
import moment from 'moment-timezone';

require('dotenv').config();
const AIO_USERNAME = process.env.AIO_USERNAME;
const AIO_KEY = process.env.AIO_KEY;
let adaClient = null;
export function initAdaService(io) {
    // MQTT client
    const client = mqtt.connect('mqtts://io.adafruit.com:8883', {
        username: AIO_USERNAME,
        password: AIO_KEY,
    });

    adaClient = client;


    // --- Hàm lấy toàn bộ feed từ database (thay cho Adafruit IO) ---
    async function getAllFeeds() {
        try {
            const feeds = await db.Sensor.findAll({
                attributes: ['sensorName', 'description', 'status'],
                where: { status: 'on' },
            });

            return feeds.map((f) => ({
                name: f.description,
                key: f.sensorName,
                status: f.status,
            }));
        } catch (err) {
            console.error('❌ Lỗi khi lấy danh sách feed từ DB:', err.message);
            return [];
        }
    }

    // --- Khi kết nối thành công ---
    client.on('connect', async () => {
        console.log('✅ Connected to Adafruit IO via MQTT');

        const feeds = await getAllFeeds();
        console.log(`📊 Hiện có ${feeds.length} feed trên Adafruit IO`);
        feeds.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f.name} (key: ${f.key})`);
        });

        // Subscribe tất cả feed
        feeds.forEach((f) => {
            const topic = `${AIO_USERNAME}/feeds/${f.key}`;
            client.subscribe(topic, (err) => {
                if (err) console.error('❌ Subscribe error:', err);
                else console.log(`📡 Subscribed to feed: ${topic}`);
            });
        });
        // Subcribe tất cả các device
        await subscribeDeviceFeeds();
        // Gửi dữ liệu trung bình 24h
        await emitHourlyAvg();

        // Gửi dữ liệu mới nhất của 4 feed
        await emitLatestData();
        // 🔹 Giả lập publish dữ liệu test mỗi 30s cho tất cả feed

        const state = {};
        feeds.forEach(f => {
            if (f.key.includes('temp')) state[f.key] = 25 + Math.random() * 5;
            else if (f.key.includes('humi')) state[f.key] = 50 + Math.random() * 20;
            else if (f.key.includes('light')) state[f.key] = 800 + Math.random() * 200;
            else state[f.key] = Math.random() * 100;
        });

        // setInterval(() => {
        //     feeds.forEach(f => {
        //         let current = state[f.key];
        //         let delta = 0;

        //         if (f.key.includes('temp')) delta = (Math.random() - 0.5) * 2;
        //         else if (f.key.includes('humi')) delta = (Math.random() - 0.5) * 5;
        //         else if (f.key.includes('light')) delta = (Math.random() - 0.5) * 80;
        //         else delta = (Math.random() - 0.5) * 15;

        //         current += delta;

        //         if (f.key.includes('temp')) current = Math.min(40, Math.max(15, current));
        //         else if (f.key.includes('humi')) current = Math.min(90, Math.max(30, current));
        //         else if (f.key.includes('light')) current = Math.min(800, Math.max(100, current));
        //         else current = Math.min(100, Math.max(0, current));

        //         state[f.key] = current;

        //         const fakeValue = f.key.includes('light')
        //             ? current.toFixed(0)
        //             : current.toFixed(2);

        //         console.log(`Push fake data -> ${f.key}: ${fakeValue}`);
        //         client.publish(`${AIO_USERNAME}/feeds/${f.key}`, fakeValue);
        //     });
        // }, 30000);
    });

    // --- Nhận dữ liệu từ feed ---
    client.on('message', async (topic, message) => {
        const raw = message.toString();
        console.log(`📩 Nhận từ topic [${topic}] -> ${raw}`);

        let value;
        try {
            value = parseFloat(JSON.parse(raw));
        } catch {
            value = parseFloat(raw);
        }
        // if (isNaN(value)) {
        //     console.warn(`⚠️ Giá trị không hợp lệ từ topic [${topic}]: ${raw}`);
        //     return;
        // }
        const now = new Date();
        const feedKey = topic.split('/').pop();
        // Lấy danh sách sensor feed và device feed
        const feedSensor = await db.Sensor.findAll({ attributes: ['sensorName'] });
        const feedDevice = await db.Device.findAll({ attributes: ['adaDevName', 'deviceName', 'mode'] });
        let sensorData = null;
        let deviceData = null;
        // Kiểm tra feedKey thuộc loại sensor hay device
        for (let i = 0; i < feedSensor.length; i++) {
            if (feedKey === feedSensor[i].sensorName) {
                sensorData = feedKey;
                break;
            }
        }
        for (let i = 0; i < feedDevice.length; i++) {
            if (feedKey === feedDevice[i].adaDevName) {
                deviceData = feedKey;
                break;
            }
        }
        // const sensorName = feedKey;

        //     console.log(`[${now.toLocaleTimeString()}] 🔹 Sensor: ${sensorName} | Value: ${value}`);
        // Nếu là feed của device -> kiểm tra tiếp xem data là của BE hay remote
        if (deviceData) {
            console.log(`🎮 Feed Device: ${deviceData} -> raw=${raw}`);

            const device = feedDevice.find(d => d.adaDevName === deviceData);
            const parsed = parseDevicePayload(raw);


            if (parsed.source === "BE") {
                console.log(`🚫 Bỏ qua tín hiệu BE gửi lên: ${device.deviceName}`);
                return;
            }

            // Remote điều khiển
            console.log(`📡 Remote điều khiển ${device.deviceName}: value=${parsed.value}, power=${parsed.power}`);

            await db.Device.update(
                { status: parsed.value === 1 ? "ON" : "OFF", mode: "MANUAL" },
                { where: { adaDevName: deviceData } }
            );

            io.emit("deviceStatusChanged", {
                deviceName: device.deviceName,
                status: parsed.value
            });

            return;
        }
        // nếu là feed sensor -> sử lý như thường 
        if (sensorData) {
            const sensorName = sensorData;
            try {
                let sensor = await db.Sensor.findOne({ where: { sensorName } });
                if (!sensor) {
                    sensor = await db.Sensor.create({
                        sensorName,
                        description: sensorName,
                        status: 'on',
                    });
                    console.log(`🆕 Tạo mới sensor: ${sensorName}`);
                }
                const lastData = await db.SensorData.findOne({
                    order: [['SDataId', 'DESC']],
                });
                const newSDataId = lastData ? lastData.SDataId + 1 : 1;
                await db.SensorData.create({
                    SDsensorId: sensor.id,
                    SDataId: newSDataId,
                    time: now,
                    value: value,
                });

                console.log('💾 Đã lưu dữ liệu vào DB thành công!');
                io.emit('sensorData', {
                    sensorName,
                    value,
                    time: now,
                });
                // 🔹 NEW: Bắn realtime nội bộ cho AUTO mode xử lý
                sensorEmitter.emit('sensorData', { sensorName, value, time: now });
                console.log('📤 Đã gửi realtime data lên FE!');

                // 🧮 NEW: Tính trung bình 15 phút gần nhất của sensor này
                const fifteenMinutesAgo = new Date(now.getTime());
                const recentData = await db.SensorData.findAll({
                    where: {
                        SDsensorId: sensor.id,
                        time: { [Op.gte]: fifteenMinutesAgo }
                    },
                    attributes: ['value']
                });

                let avgValue = value;
                if (recentData.length > 0) {
                    const sum = recentData.reduce((acc, d) => acc + parseFloat(d.value || 0), 0);
                    avgValue = sum / recentData.length;
                }
                console.log(`📊 Trung bình 15 phút gần nhất của ${sensorName}: ${avgValue.toFixed(2)}`);
                // 🔔 Kiểm tra và gửi thông báo nếu cụm rule nào được thỏa
                const relatedSets = await db.setRule.findAll({
                    include: [{
                        model: db.Rule,
                        where: { sensorID: sensor.id },
                        attributes: []
                    },
                    {
                        model: db.Device, // lấy thông tin device liên quan
                        attributes: ['id', 'deviceName', 'adaDevName', 'status', 'description', 'mode']
                    }
                    ],
                    attributes: ['id', 'emailNotification', 'status', 'description', 'setType', 'dev_Id']
                });
                const avgValueMap = { [sensorName]: avgValue };
                for (const set of relatedSets) {
                    await setRuleService.notifyIfSetRuleSatisfied(set, avgValueMap);
                }
                await emitHourlyAvg();
            } catch (e) {
                console.error('❌ Lỗi khi lưu dữ liệu:', e);
            }
        }
    });

    // --- Log lỗi kết nối MQTT ---
    client.on('error', (err) => {
        console.error('❌ MQTT Error:', err);
    });

    io.on('connection', async (socket) => {
        try {
            await emitHourlyAvg(socket);
            await emitLatestData(socket);
        } catch (e) {
            console.error('Lỗi khi emit avg cho client mới kết nối:', e);
        }
    });

    async function emitLatestData(target = io) {
        try {
            const feeds = await getAllFeeds();
            if (!feeds.length) return;

            const latestData = [];

            for (const f of feeds) {
                const sensor = await db.Sensor.findOne({ where: { sensorName: f.key } });
                if (!sensor) continue;

                const lastRecord = await db.SensorData.findOne({
                    where: { SDsensorId: sensor.id },
                    order: [['time', 'DESC']],
                    limit: 1,
                });

                latestData.push({
                    sensorName: f.key,
                    value: lastRecord ? lastRecord.value : null,
                    time: lastRecord ? lastRecord.time : null,
                });
            }

            target.emit('sensorLatestData', latestData);
            console.log('📤 Đã gửi dữ liệu mới nhất của các feed:', latestData);
        } catch (e) {
            console.error('❌ Lỗi khi lấy dữ liệu mới nhất:', e);
        }
    }

    async function emitHourlyAvg(target = io) {
        try {
            // Dùng moment-timezone để xử lý timezone linh hoạt (hoạt động với mọi server location)
            const now = moment().tz('Asia/Ho_Chi_Minh');
            
            // Lấy giờ hiện tại (không làm tròn xuống)
            const currentHour = now.hour();
            
            // Tính thời gian bắt đầu: 24 giờ trước từ giờ hiện tại (làm tròn xuống)
            const nowFloor = now.clone().startOf('hour');
            const startTime = nowFloor.clone().subtract(23, 'hours');

            const feeds = await getAllFeeds();
            if (!feeds.length) return;
            const feedKeys = feeds.map((f) => f.key);

            const avgAttrs = feedKeys.map((feedKey) => [
                fn('AVG', literal(`CASE WHEN Sensor.sensorName='${feedKey}' THEN value END`)),
                feedKey,
            ]);

            const avgData = await db.SensorData.findAll({
                include: [{ model: db.Sensor, attributes: [] }],
                where: { time: { [Op.gte]: startTime.clone().subtract(7, 'hours').toDate() } },
                attributes: [
                    [fn('DATE_FORMAT', literal(`CONVERT_TZ(time, '+00:00', '+07:00')`), '%H:00'), 'hour'],
                    ...avgAttrs,
                ],
                group: ['hour'],
                raw: true,
            });

            const dataMap = {};
            avgData.forEach((r) => {
                dataMap[r.hour] = r;
            });

            const result = [];
            // Chỉ lấy từ 23 giờ trước đến giờ hiện tại (không bao gồm giờ tương lai)
            for (let i = 23; i >= 0; i--) {
                const dt = nowFloor.clone().subtract(i, 'hours');
                const hourStr = dt.format('HH:00');
                const dtHour = dt.hour();
                
                // Chỉ thêm vào result nếu giờ <= giờ hiện tại
                if (dtHour <= currentHour) {
                    const row = { time: hourStr };
                    const record = dataMap[hourStr] || {};
                    feedKeys.forEach((feedKey) => {
                        row[feedKey] =
                            record[feedKey] !== undefined && record[feedKey] !== null
                                ? parseFloat(record[feedKey].toFixed(2))
                                : null;
                    });
                    result.push(row);
                }
            }

            target.emit('sensorHourlyAvg', result);
        } catch (e) {
            console.error('❌ Lỗi khi tính trung bình 24h:', e);
        }
    }
    async function subscribeDeviceFeeds() {
        let devices = await db.Device.findAll({
            attributes: ['adaDevName', 'deviceName']
        })
        // Subscribe tất cả feed của device
        devices.forEach(device => {
            if (device.adaDevName) {
                const deviceFeed = `${AIO_USERNAME}/feeds/${device.adaDevName}`;
                client.subscribe(deviceFeed, (err) => {
                    if (err) console.error('❌ Subscribe error:', err);
                    else console.log(`Subscribe device feed: ${deviceFeed}`);
                })
            }
        })
    }
    function parseDevicePayload(raw) {
        // Ví dụ raw = "BE:1:50" hoặc chỉ "1"
        if (typeof raw !== "string") raw = raw.toString();

        // Nếu đúng định dạng có dấu :
        if (raw.includes(":")) {
            const [source, value, power] = raw.split(":");
            return {
                source: source === "BE" ? "BE" : "IOT",
                value: parseInt(value),
                power: parseInt(power || 0)
            };
        }

        // Nếu chỉ gửi mỗi số từ thiết bị
        return {
            source: "REMOTE",
            value: parseInt(raw),
            power: null
        };
    }
}

export function unsubscribeFromFeed(sensorName) {
    if (!adaClient || !adaClient.connected) {
        console.error('❌ MQTT client chưa sẵn sàng để unsubscribe');
        return;
    }

    const topic = `${AIO_USERNAME}/feeds/${sensorName}`;
    adaClient.unsubscribe(topic, (err) => {
        if (err) console.error(`❌ Lỗi khi unsubscribe ${topic}:`, err);
        else console.log(`🧹 Đã unsubscribe khỏi feed: ${topic}`);
    });
}


/**
* 📡 Hàm xuất để các service khác (như DeviceService) gọi bật/tắt thiết bị
* @param {string} feedName - tên feed của thiết bị (vd: 'switch')
* @param {string|number} value - giá trị gửi ('1' bật, '0' tắt)
*/
export function publishToFeed(feedName, value, power) {
    if (!adaClient || !adaClient.connected) {
        console.error('❌ MQTT client chưa kết nối hoặc chưa sẵn sàng!');
        return false;
    }

    const pw = value === '1' ? power : 0

    const payload = {
        value: `BE:${value}:${pw}`,
    }
    const topic = `${AIO_USERNAME}/feeds/${feedName}`;
    adaClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (err) => {
        if (err) console.error(`⚠️ Publish error to ${topic}:`, err);
        else console.log(`📤 Gửi tín hiệu tới Adafruit: ${topic} → ${JSON.stringify(payload)}`);
    });

    return true;
}

// Biến nhớ thời gian gửi gần nhất (debounce)
const lastSafePublish = new Map();
const SAFE_COOLDOWN_MS = 10 * 1000; // ví dụ 8 giây giữa 2 lệnh
/**
* 📡 publishSafeToFeed - dành cho AUTO / SCHEDULE mode
* - Kiểm tra trạng thái hiện tại của device trong DB
* - Chỉ gửi nếu trạng thái cần gửi khác với trạng thái hiện tại
* - Có cooldown để tránh gửi lặp liên tục (trừ khi skipCooldown = true)
* @param {Object} device - instance của Device (hoặc có id + adaDevName)
* @param {'ON'|'OFF'} desiredStatus - trạng thái mong muốn
* @param {number|string} power - mức công suất mong muốn
* @param {Object} options
* @param {boolean} [options.skipCooldown=false] - bỏ qua cooldown (dùng cho SCHEDULE)
* @returns {Promise<boolean>} true nếu publish thành công
*/
export async function publishSafeToFeed(device, desiredStatus, power, options = {}) {
    const { skipCooldown = false } = options;
    try {
        if (!device || !device.adaDevName) {
            console.warn("⚠️ publishSafeToFeed: device thiếu thông tin adaDevName");
            return false;
        }

        // kiểm tra cooldown (trừ khi được yêu cầu bỏ qua, ví dụ từ SCHEDULE)
        if (!skipCooldown) {
            const lastTime = lastSafePublish.get(device.id) || 0;
            console.log("Now: ", Date.now());
            console.log("lastTime: ", lastTime);

            if (Date.now() - lastTime < SAFE_COOLDOWN_MS) {
                console.log(`⏳ Bỏ qua publishSafeToFeed cho ${device.deviceName} (cooldown).`);
                return false;
            }
        }

        // Lấy trạng thái mới nhất từ DB để chắc chắn
        const fresh = await db.Device.findByPk(device.id);
        if (!fresh) {
            console.warn(`⚠️ Không tìm thấy device ID ${device.id}`);
            return false;
        }

        if (fresh.status === desiredStatus && fresh.power === power) {
            console.log(`⚙️ ${fresh.deviceName} đã ở trạng thái ${desiredStatus}, không gửi nữa.`);
            return false;
        }

        // Đảm bảo power có giá trị hợp lệ (mặc định 100 nếu không có hoặc = 0)
        const powerValue = power && power > 0 ? power : 100;
        
        const mqttValue = {
            // value: desiredStatus === "ON" ? "1" : "0",
            value: desiredStatus === "ON" ? `BE:1:${powerValue}` : `BE:0:${powerValue}`,

        }
        const topic = `${process.env.AIO_USERNAME}/feeds/${fresh.adaDevName}`;

        if (!adaClient || !adaClient.connected) {
            console.error("❌ MQTT client chưa kết nối!");
            return false;
        }

        // Gửi lên Adafruit IO (sử dụng publish gốc)
        const success = await new Promise((resolve) => {
            adaClient.publish(topic, JSON.stringify(mqttValue), { qos: 1 }, async (err) => {
                if (err) {
                    console.error(`⚠️ publishSafeToFeed lỗi gửi tới ${topic}:`, err);
                    resolve(false);
                } else {
                    console.log(`📤 [SAFE] Gửi tới ${topic} → ${mqttValue}`);
                    await db.Device.update({ status: desiredStatus }, { where: { id: device.id } });
                    // chỉ cập nhật lastSafePublish nếu không skipCooldown
                    if (!skipCooldown) {
                        lastSafePublish.set(device.id, Date.now());
                    }
                    console.log(`💾 DB cập nhật ${device.deviceName} → ${desiredStatus}`);
                    if (global.io) {
                        global.io.emit("deviceStatusChange", { id: device.id, status: desiredStatus });
                    }
                    resolve(true);
                }
            });
        });

        return success;

    } catch (err) {
        console.error("❌ Lỗi trong publishSafeToFeed:", err);
        return false;
    }
}

export async function getDeviceFeeds() {
    try {
        const url = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;
        const res = await fetch(url, {
            headers: { 'X-AIO-Key': AIO_KEY },
        });
        const data = await res.json();
        return data.filter(feed => feed.description === "device").map(feed => ({
            name: feed.name
        }));
    } catch (e) {
        console.error('❌ Lỗi khi lấy danh sách feed thiết bị:', e);
        return [];
    }
}

export async function getSensorFeeds() {
    try {
        const url = `https://io.adafruit.com/api/v2/${AIO_USERNAME}/feeds`;
        const res = await fetch(url, {
            headers: { 'X-AIO-Key': AIO_KEY },
        });
        const data = await res.json();
        return data.filter(feed => feed.description === "sensor").map(feed => ({
            name: feed.name
        }));
    } catch (e) {
        console.error('❌ Lỗi khi lấy danh sách feed cảm biến:', e);
        return [];
    }
}


