/* eslint-env node */
import db from '../models/index';
import { Op, where } from 'sequelize';
import { publishToFeed, publishSafeToFeed } from "../mqtt/adaService";
import sensorEmitter from '../mqtt/sensorEmitter.js';
import moment from 'moment-timezone';
import { raw } from 'body-parser';
import { sendTelegramMessage } from './telegramService.js';
import device from '../models/device.js';
import axios from 'axios';
require('dotenv').config();
const AI_API_URL = process.env.AI_POWER_API || '';
const getAllDevice = async () => {
    try {
        // Lấy danh sách device
        let devices = await db.Device.findAll({
            attributes: ['id', 'adaDevName', 'deviceName', 'description', 'power', 'status', 'mode', 'updatedAt'],
            include: [
                {
                    model: db.setRule,
                    attributes: ['id', 'status'],
                    // where: { status: 'ON' },
                    // limit: 1, // Giới hạn số lượng Rule lấy về (nếu cần)
                    required: false, // không bắt buộc phải có Rule
                },
                {
                    model: db.Schedule,
                    attributes: [
                        'id',
                        [db.Sequelize.literal("CONCAT('Scheduled on: ', `Schedules`.`actionDay`)"), 'actionDay'],
                        'status'],
                    // limit: 1, // Giới hạn số lượng Schedule lấy về (nếu cần)
                    required: false, // không bắt buộc
                },
            ],
        });

        // Lọc và include theo mode
        // const result = devices.map((dev) => {
        //   const plainDev = dev.get({ plain: true }); // convert to object

        //   // nếu mode = AUTO → chỉ lấy Rule
        //   if (plainDev.mode === 'AUTO') {
        //     delete plainDev.Schedules;
        //   }
        //   // nếu mode = SCHEDULE → chỉ lấy Schedule
        //   else if (plainDev.mode === 'SCHEDULE') {
        //     delete plainDev.setRules;
        //   }
        //   // nếu mode khác → không lấy gì
        //   else {
        //     delete plainDev.setRules;
        //     delete plainDev.Schedules;
        //   }

        //   return plainDev;
        // });
        const result = devices;
        if (result) {
            return {
                EM: 'Get all device successfully',
                EC: 0,
                DT: result,
            };
        } else {
            return {
                EM: 'Device not found',
                EC: 1,
                DT: [],
            };
        }
    } catch (e) {
        console.log('Check error in getAllDevice: ', e);
        return {
            EM: 'Something wrongs in service',
            EC: -1,
            DT: [],
        };
    }
};

const toggleDeviceService = async (deviceId) => {
    try {
        let device = await db.Device.findOne({
            where: { id: deviceId },
            raw: true
        });

        if (!device.power) {
            device.power = '100';
        };

        if (!device) {
            return {
                EM: 'Can not find device with deviceId',
                EC: 1,
                DT: '',
            }
        }
        // if (device.mode !== 'MANUAL') {
        //     return {
        //         EM: 'Mode do not have permission to control device',
        //         EC: 2,
        //         DT: '',
        //     }
        // }
        if (!device.adaDevName) {
            return {
                EM: "Missing adaDevName (feed name)",
                EC: 3,
                DT: null
            };
        }
        // Toggle trạng thái
        const newStatus = device.status === "ON" ? "OFF" : "ON";
        const mqttService = newStatus === "ON" ? "1" : "0"; // adafruit nhận "0"/ "1"
        const newPower = newStatus === "ON" ? '100' : '0'
        // Gửi lệnh MQTT với adafruit IO
        console.log('Gửi lệnh MQTT với adafruit IO: ', device.adaDevName, mqttService, newPower);
        const success = publishToFeed(device.adaDevName, mqttService, newPower);

        if (!success) {
            return {
                EM: "Failed to send command to Adafruit",
                EC: 4,
                DT: null
            };
        }

        // Lưu vào DB
        await db.Device.update(
            {
                mode: 'MANUAL',
                status: newStatus,
                power: newPower
            },
            { where: { id: device.id } }
        );
        // 🧾 Lưu log riêng cho Manual Mode
        await db.Log.create({
            dev_Id: device.id,
            value: newStatus,
            time: new Date(),
            description: `Người dùng điều khiển thủ công thiết bị ${device.deviceName}.`,
            mode: 'MANUAL',
        });
        return {
            EM: `Device "${device.deviceName}" turned ${newStatus}`,
            EC: 0,
            DT: { id: device.id, status: newStatus },
        };
    }
    catch (e) {
        console.log('Check error in toggleDeviceService: ', e);
        return {
            EM: 'Something wrongs in service',
            EC: -1,
            DT: [],
        };
    }
};

// Điều khiển thiết bị từ Telegram với trạng thái + power mong muốn
const controlDeviceFromTelegram = async (deviceId, desiredStatus, desiredPower) => {
    try {
        const device = await db.Device.findByPk(deviceId);

        if (!device) {
            return {
                EM: 'Can not find device with deviceId',
                EC: 1,
                DT: '',
            };
        }

        if (!device.adaDevName) {
            return {
                EM: "Missing adaDevName (feed name)",
                EC: 3,
                DT: null
            };
        }

        const currentPower = Number(device.power || 0);
        const targetPower =
            desiredPower !== null && desiredPower !== undefined && !Number.isNaN(Number(desiredPower))
                ? Number(desiredPower)
                : desiredStatus === 'ON'
                    ? 100
                    : 0;

        // Nếu cùng trạng thái + cùng power thì bỏ qua
        if (device.status === desiredStatus && currentPower === targetPower) {
            return {
                EM: 'Device already in desired status and power',
                EC: 0,
                DT: { id: device.id, status: device.status, power: currentPower },
            };
        }

        // Gửi MQTT + cập nhật DB
        const success = await publishSafeToFeed(device, desiredStatus, targetPower);

        if (!success) {
            return {
                EM: "Failed to send command to Adafruit",
                EC: 4,
                DT: null
            };
        }

        await db.Device.update(
            {
                mode: 'MANUAL',
                status: desiredStatus,
                power: String(targetPower),
            },
            { where: { id: device.id } }
        );

        await db.Log.create({
            dev_Id: device.id,
            value: desiredStatus,
            time: new Date(),
            description: `Người dùng điều khiển thiết bị ${device.deviceName} qua Telegram.`,
            mode: 'MANUAL',
        });

        return {
            EM: `Device "${device.deviceName}" set to ${desiredStatus} with power ${targetPower}`,
            EC: 0,
            DT: { id: device.id, status: desiredStatus, power: targetPower },
        };
    } catch (e) {
        console.log('Check error in controlDeviceFromTelegram: ', e);
        return {
            EM: 'Something wrongs in service',
            EC: -1,
            DT: [],
        };
    }
};

const getExacDeviceInforService = async (deviceId) => {
    try {
        if (!deviceId) {
            return {
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            };
        }
        let deviceInfor = await db.Device.findOne({
            where: { id: deviceId },
            attributes: ['id', 'description', 'deviceName', 'power', 'adaDevName', 'status', 'mode'],
            raw: true
        })
        if (!deviceInfor) {
            return {
                EM: 'Device not found',
                EC: 1,
                DT: '',
            };
        }
        // 🔹 2. Lấy danh sách SetRule theo thiết bị
        let setRule = await db.setRule.findAll({
            where: { dev_Id: deviceId },
            attributes: ['id', 'power', 'status'],
            raw: true,
        });
        // Nếu có SetRule thì lấy ra toàn bộ Rule tương ứng
        let allRules = [];
        if (setRule.length > 0) {
            const setRuleIds = setRule.map((r) => r.id); // lấy danh sách id của SetRule

            // 🔹 3. Lấy các Rule thuộc các SetRule trên
            allRules = await db.Rule.findAll({
                where: { setID: { [Op.in]: setRuleIds } },
                attributes: ['id', 'setID', 'operator', 'condition', 'sensorID'],
                raw: true,
            });

            // 4️⃣ Lấy tất cả sensor liên quan
            const sensorIds = allRules.map((r) => r.sensorID).filter((id) => !!id);
            let sensors = [];

            if (sensorIds.length > 0) {
                sensors = await db.Sensor.findAll({
                    where: { id: { [Op.in]: sensorIds } },
                    attributes: ['id', 'sensorName', 'name', 'description', 'status'],
                    raw: true,
                });
            }

            // 5️⃣ Gắn sensor vào từng rule
            allRules.forEach((rule) => {
                rule.sensor = sensors.find((s) => s.id === rule.sensorID) || null;
            });

            // ✅ Ghép rule tương ứng vào từng setRule
            setRule.forEach((sr) => {
                sr.rules = allRules.filter((rule) => rule.setID === sr.id);
            });
        }
        let schedules = await db.Schedule.findAll({
            where: { dev_Id: deviceId },
            attributes: ['id', 'timeStart', 'timeEnd', 'actionDay', 'status', 'power'],
            raw: true,
        });
        const result = {
            ...deviceInfor,
            setRule: setRule,
            schedules: schedules,
        };
        return {
            EM: 'Get device infor success',
            EC: 0,
            DT: result,
        };
    } catch (e) {
        console.log('Check error in toggleDeviceService: ', e);
        return {
            EM: 'Something wrongs in service',
            EC: -1,
            DT: '',
        };
    }
};

// ======================================================
// GLOBAL MAPS: Lưu trạng thái đang chạy cho từng thiết bị
// ======================================================
const activeAutoListeners = new Map(); // deviceId → listener
const scheduleIntervals = new Map(); // nếu bạn có SCHEDULE
// ======================================================
// 🔹 Hàm đổi chế độ hoạt động của thiết bị
// ======================================================
const changeModeService = async (mode, deviceId) => {
    try {
        const validModes = ['MANUAL', 'AUTO', 'SCHEDULE', 'AI_POWERED'];
        if (!validModes.includes(mode))
            return { EC: 1, EM: 'Invalid mode', DT: '' };

        const device = await db.Device.findByPk(deviceId);
        if (!device)
            return { EC: 1, EM: 'Device not found', DT: '' };

        console.log(`⚙️ [MODE CHANGE] ${device.deviceName} → ${mode}`);

        // 🧹 Dừng AUTO listener cũ
        if (activeAutoListeners.has(device.id)) {
            sensorEmitter.removeListener('sensorData', activeAutoListeners.get(device.id));
            activeAutoListeners.delete(device.id);
            console.log(`🧹 AUTO listener stopped for ${device.deviceName}`);
        }

        // 🧹 Dừng schedule interval cũ
        if (scheduleIntervals.has(device.id)) {
            clearInterval(scheduleIntervals.get(device.id));
            scheduleIntervals.delete(device.id);
            console.log(`🧹 Schedule interval stopped for ${device.deviceName}`);
        }

        // Cập nhật mode
        device.mode = mode;
        await device.save();

        // Gửi MQTT để tắt thiết bị khi đổi mode (tuỳ logic bạn muốn)
        if (device.adaDevName) {
            publishToFeed(device.adaDevName, '0', 0);
            await db.Device.update(
                {
                    status: "OFF",
                    updatedAt: new Date()
                },
                { where: { id: device.id } }
            );
        }

        // Kích hoạt mode mới
        switch (mode) {
            case 'AUTO':
                await registerRealtimeAuto(device);
                break;
            case 'SCHEDULE':
                await registerRealtimeSchedule(device);
                break;
            case 'MANUAL':
                console.log(`✋ ${device.deviceName} chuyển sang MANUAL.`);
                break;
            case 'AI_POWERED':
                await registerAiPowerMode(device);
                break;
        }

        return { EC: 0, EM: `Đã chuyển sang chế độ ${mode}`, DT: device };
    } catch (err) {
        console.error('❌ Error in changeModeService:', err);
        return { EC: -1, EM: 'Error in changeModeService', DT: '' };
    }
};
// =======================
// 🔹 Đánh giá logic của nhiều quy tắc bên trong một setRule
// =======================
const evaluateSetRules = (rules, sensorValues) => {
    if (!rules || rules.length === 0) return false;
    // Lưu kết quả rule đầu tiên
    let firstRule = rules[0];
    let firstSensorValue = sensorValues[firstRule.Sensor?.sensorName];
    let result = checkCondition(firstSensorValue, firstRule.operator, firstRule.condition);

    // Duyệt các rule còn lại
    for (let i = 1; i < rules.length; i++) {
        const r = rules[i];
        const sensorVal = sensorValues[r.Sensor?.sensorName];
        const currentResult = checkCondition(sensorVal, r.operator, r.condition);

        const logicOp = r.logicOp ? r.logicOp.toUpperCase() : 'AND'; // mặc định AND nếu null

        if (logicOp === 'AND') {
            result = result && currentResult;
        } else if (logicOp === 'OR') {
            result = result || currentResult;
        }

        // 👉 Dừng sớm nếu OR đã true hoặc AND đã false (tối ưu)
        if (result === true && logicOp === 'OR') break;
        if (result === false && logicOp === 'AND') break;
    }

    return result;
}

// ======================================================
// 🔹 AUTO MODE: Lắng nghe sensor realtime và xử lý rule
// ======================================================
const registerRealtimeAuto = async (device) => {
    console.log(`🧠 AUTO mode activated for ${device.deviceName}`);

    // Xoá listener cũ nếu có
    if (activeAutoListeners.has(device.id)) {
        sensorEmitter.removeListener('sensorData', activeAutoListeners.get(device.id));
        activeAutoListeners.delete(device.id);
    }

    // Lấy toàn bộ rule + sensor liên quan
    const sets = await db.setRule.findAll({
        where: { dev_Id: device.id, status: 'ON', setType: 'AUTO_CONTROL' },
        include: [{
            model: db.Rule,
            include: [db.Sensor],
            required: false
        }]
    });

    if (!sets.length) {
        console.log(`⚠️ ${device.deviceName} chưa có rule nào.`);
        return;
    }

    const relatedSensors = new Set();
    sets.forEach(set => {
        set.Rules.forEach(rule => {
            if (rule.Sensor) relatedSensors.add(rule.Sensor.sensorName);
        });
    });

    // Bộ nhớ tạm lưu realtime value mới nhất của từng sensor
    // Khởi tạo với giá trị mới nhất từ DB cho tất cả sensors liên quan
    const latestValues = {};
    const sensorNames = Array.from(relatedSensors);
    
    // Load giá trị ban đầu từ DB cho tất cả sensors
    for (const sensorName of sensorNames) {
        try {
            const sensor = await db.Sensor.findOne({ where: { sensorName } });
            if (sensor) {
                const latestData = await db.SensorData.findOne({
                    where: { SDsensorId: sensor.id },
                    order: [['time', 'DESC']],
                    attributes: ['value'],
                    raw: true
                });
                if (latestData) {
                    latestValues[sensorName] = parseFloat(latestData.value);
                    console.log(`📊 [AUTO] ${device.deviceName} - Khởi tạo ${sensorName} = ${latestValues[sensorName]}`);
                }
            }
        } catch (err) {
            console.error(`❌ Lỗi khi load giá trị ban đầu cho ${sensorName}:`, err);
        }
    }

    // Hàm helper để đánh giá và áp dụng rule
    const evaluateAndApplyRules = async (triggerSensorName = null) => {
        // 🔄 Reload sets từ DB mỗi lần đánh giá để đảm bảo có rules mới nhất
        const currentSets = await db.setRule.findAll({
            where: { dev_Id: device.id, status: 'ON', setType: 'AUTO_CONTROL' },
            include: [{
                model: db.Rule,
                include: [db.Sensor],
                required: false
            }]
        });

        if (!currentSets.length) {
            console.log(`⚠️ [AUTO] ${device.deviceName} không còn rule nào, dừng listener.`);
            // Xóa listener nếu không còn rule
            if (activeAutoListeners.has(device.id)) {
                sensorEmitter.removeListener('sensorData', activeAutoListeners.get(device.id));
                activeAutoListeners.delete(device.id);
            }
            return;
        }

        let ruleMatched = false;
        let powerLevel = 100;

        for (const set of currentSets) {
            const sensorValues = {};

            // Gom các giá trị realtime từ bộ nhớ
            let hasAllValues = true;
            for (const rule of set.Rules) {
                if (rule.Sensor) {
                    const name = rule.Sensor.sensorName;
                    const val = latestValues[name];
                    if (val === undefined || val === null) {
                        hasAllValues = false;
                        break;
                    }
                    sensorValues[name] = val;
                }
            }

            // Chỉ đánh giá rule khi đã có đủ giá trị cho tất cả sensors
            if (!hasAllValues) {
                if (triggerSensorName) {
                    console.log(`⏳ [AUTO] ${device.deviceName} → Chưa đủ dữ liệu sensor, bỏ qua đánh giá rule`);
                }
                continue;
            }

            // Kiểm tra logic toàn bộ set
            const isSetMatched = evaluateSetRules(set.Rules, sensorValues);

            if (isSetMatched) {
                ruleMatched = true;
                powerLevel = set.power || 100;
                console.log(`✅ [AUTO] ${device.deviceName} → SetRule ${set.id} THỎA điều kiện.`);
                break;
            } else {
                console.log(`❌ [AUTO] ${device.deviceName} → SetRule ${set.id} KHÔNG THỎA.`);
            }
        }

        // 🔄 Lấy lại device từ DB để tránh xung đột
        const freshDevice = await db.Device.findByPk(device.id);
        if (!freshDevice || freshDevice.mode !== 'AUTO') return;

        // 🧠 Log kết quả
        if (triggerSensorName) {
            if (ruleMatched) {
                console.log(`✅ [AUTO] ${device.deviceName} → Điều kiện ĐÚNG (${triggerSensorName}: ${latestValues[triggerSensorName]})`);
            } else {
                console.log(`❌ [AUTO] ${device.deviceName} → Điều kiện KHÔNG THỎA (${triggerSensorName}: ${latestValues[triggerSensorName]})`);
            }
        }

        // ⚙️ So sánh và hành động
        if (ruleMatched) {
            if (freshDevice.status === 'OFF') {
                await applyDeviceAction(freshDevice, 'ON', powerLevel);
            } else {
                console.log(`⚙️ ${freshDevice.deviceName} đã ở trạng thái ON, bỏ qua.`);
            }
        } else {
            if (freshDevice.status === 'ON') {
                await applyDeviceAction(freshDevice, 'OFF', 0);
            } else {
                console.log(`⚙️ ${freshDevice.deviceName} đã ở trạng thái OFF, bỏ qua.`);
            }
        }
    };

    const listener = async ({ sensorName, value, time }) => {
        // Cập nhật giá trị sensor vào bộ nhớ
        latestValues[sensorName] = parseFloat(value) || 0;
        
        // Đánh giá và áp dụng rule khi có sensor data mới
        // (evaluateAndApplyRules sẽ tự reload sets từ DB và chỉ đánh giá nếu sensor có trong rule)
        await evaluateAndApplyRules(sensorName);
    };

    sensorEmitter.on('sensorData', listener);
    activeAutoListeners.set(device.id, listener);

    console.log(`🎧 Listening realtime AUTO for ${device.deviceName}`);
};


// ======================================================
// 🔹 SCHEDULE MODE (vẫn chạy theo interval)
// ======================================================
const registerRealtimeSchedule = async (device) => {
    console.log(`📅 Theo dõi lịch cho ${device.deviceName}`);

    if (scheduleIntervals.has(device.id)) {
        clearInterval(scheduleIntervals.get(device.id));
        scheduleIntervals.delete(device.id);
    }

    // Hàm check và apply schedule
    const checkAndApplySchedule = async () => {
        const fresh = await db.Device.findByPk(device.id);
        if (!fresh || fresh.mode !== 'SCHEDULE') {
            if (scheduleIntervals.has(device.id)) {
                clearInterval(scheduleIntervals.get(device.id));
                scheduleIntervals.delete(device.id);
            }
            return;
        }

        const TIMEZONE = 'Asia/Ho_Chi_Minh';
        const now = moment().tz(TIMEZONE);
        const currentDay = now.format('dddd');
        console.log(`currenDay: ${currentDay}`)
        const currentTime = now.format('HH:mm:ss');
        console.log(`currentTime: ${currentTime}`)

        const schedules = await db.Schedule.findAll({
            where: { dev_Id: device.id, status: 'ACTIVE' },
            raw: true,
        });

        if (schedules.length === 0) {
            if (fresh.status === 'ON') {
                const turnedOff = await applyDeviceAction(fresh, 'OFF', 0);
                if (turnedOff) fresh.status = 'OFF';
            }
            console.log(`⏹️ ${device.deviceName} no longer has active schedules. Interval cleared.`);
            if (scheduleIntervals.has(device.id)) {
                clearInterval(scheduleIntervals.get(device.id));
                scheduleIntervals.delete(device.id);
            }
            return;
        }

        let hasValidSchedule = false;
        let shouldStayOn = false;

        for (const sch of schedules) {
            // 🔁 Re-check schedule to ensure it still exists/active before processing
            const latestSchedule = await db.Schedule.findOne({
                where: { id: sch.id, dev_Id: device.id, status: 'ACTIVE' },
                raw: true,
            });
            if (!latestSchedule) {
                console.log(`⚠️ Schedule ${sch.id} removed before execution, skip.`);
                continue;
            }

            hasValidSchedule = true;

            let days = [];
            try {
                days = JSON.parse(latestSchedule.actionDay);
            } catch {
                days = (latestSchedule.actionDay || '').split(',').map(d => d.trim()).filter(Boolean);
            }
            
            console.log(`📅 Schedule ${latestSchedule.id} - actionDay: ${latestSchedule.actionDay}, parsed days:`, days, `currentDay: ${currentDay}`);
            
            // Check case-insensitive và normalize day names
            const normalizedCurrentDay = currentDay.toLowerCase();
            const normalizedDays = days.map(d => d.toLowerCase());
            
            if (!normalizedDays.includes(normalizedCurrentDay)) {
                console.log(`⏭️ Schedule ${latestSchedule.id} không match ngày (${normalizedCurrentDay} không có trong ${normalizedDays.join(',')})`);
                continue;
            }

            // Parse timeStart và timeEnd từ DB (format HH:mm:ss hoặc HH:mm)
            // Tạo moment objects cùng timezone với now để so sánh chính xác
            const today = now.clone().startOf('day');
            
            // Parse timeStart và timeEnd (có thể là HH:mm:ss hoặc HH:mm)
            const startTimeStr = String(latestSchedule.timeStart || '');
            const endTimeStr = String(latestSchedule.timeEnd || '');
            
            // Parse với nhiều format có thể, ép timezone Asia/Ho_Chi_Minh
            const startMoment = moment.tz(startTimeStr, ["HH:mm:ss", "HH:mm"], true, TIMEZONE);
            const endMoment = moment.tz(endTimeStr, ["HH:mm:ss", "HH:mm"], true, TIMEZONE);
            
            if (!startMoment.isValid() || !endMoment.isValid()) {
                console.log(`Schedule ${latestSchedule.id} có thời gian không hợp lệ: ${startTimeStr} - ${endTimeStr}`);
                continue;
            }
            
            // Set cùng ngày với today
            startMoment.set({
                year: today.year(),
                month: today.month(),
                date: today.date()
            });
            endMoment.set({
                year: today.year(),
                month: today.month(),
                date: today.date()
            });
            const currentMoment = now.clone();

            console.log(`📅 Schedule ${latestSchedule.id}: ${startTimeStr} (${startMoment.format('HH:mm:ss')}) - ${endTimeStr} (${endMoment.format('HH:mm:ss')}), Current: ${currentTime} (${currentMoment.format('HH:mm:ss')})`);

            if (currentMoment.isSameOrAfter(startMoment) && currentMoment.isSameOrBefore(endMoment)) {
                shouldStayOn = true;
                // Đảm bảo power có giá trị hợp lệ
                const schedulePower = latestSchedule.power && latestSchedule.power > 0 ? latestSchedule.power : 100;
                console.log(`Schedule ${latestSchedule.id} yêu cầu power: ${schedulePower}`);
                // Với SCHEDULE: bỏ cooldown để tránh bị chặn bởi SAFE_COOLDOWN_MS
                const turnedOn = await applyDeviceAction(fresh, 'ON', schedulePower, { skipCooldown: true });
                if (turnedOn) {
                    fresh.status = 'ON';
                    fresh.power = schedulePower;
                }
            } else if (currentMoment.isAfter(endMoment)) {
                // Khi ra khỏi khoảng thời gian schedule, cũng bỏ cooldown để đảm bảo tắt ngay
                const turnedOff = await applyDeviceAction(fresh, 'OFF', 0, { skipCooldown: true });
                if (turnedOff) fresh.status = 'OFF';
            }
        }

        if (!hasValidSchedule) {
            if (fresh.status === 'ON') {
                const turnedOff = await applyDeviceAction(fresh, 'OFF', 0);
                if (turnedOff) fresh.status = 'OFF';
            }
            console.log(`⏹️ No valid schedules left for ${device.deviceName}. Interval cleared.`);
            if (scheduleIntervals.has(device.id)) {
                clearInterval(scheduleIntervals.get(device.id));
                scheduleIntervals.delete(device.id);
            }
            return;
        }

        if (!shouldStayOn && fresh.status === 'ON') {
            const turnedOff = await applyDeviceAction(fresh, 'OFF', 0);
            if (turnedOff) fresh.status = 'OFF';
        }
    };

    // Chạy ngay lập tức khi register (không đợi interval)
    await checkAndApplySchedule();

    // Sau đó chạy interval mỗi 5 giây để check định kỳ (giảm delay)
    const intervalId = setInterval(checkAndApplySchedule, 5 * 1000);

    scheduleIntervals.set(device.id, intervalId);
};


const SENSOR_MAP = {
    dht20temp: "temperature",
    dht20humi: "humidity",
    soilhumi: "soil_moisture",
    lightsensor: "light"
};

const registerAiPowerMode = async (device) => {
    // Xử lý device có thể là Sequelize instance hoặc plain object
    const deviceId = device.id || device.dataValues?.id;
    const adaDevName = device.adaDevName || device.dataValues?.adaDevName;
    const deviceName = device.deviceName || device.dataValues?.deviceName;

    if (!deviceId || !adaDevName) {
        console.error("❌ registerAiPowerMode: thiếu thông tin device");
        return;
    }

    if (adaDevName === 'switch' || adaDevName === 'switch1') {
        console.log(`🤖 AI_POWERED activated for ${deviceName}`);

        // Xoá listener cũ nếu có
        if (activeAutoListeners.has(deviceId)) {
            sensorEmitter.removeListener("sensorData", activeAutoListeners.get(deviceId));
            activeAutoListeners.delete(deviceId);
        }

        // Lấy toàn bộ sensor từ DB
        const sensors = await db.Sensor.findAll({
            attributes: ["sensorName"],
            raw: true
        });

        const systemSensors = sensors
            .map(s => s.sensorName)
            .filter(name => SENSOR_MAP[name]); // chỉ lấy sensor có mapping

        if (!systemSensors.length) {
            console.log("⚠️ Không có sensor hợp lệ cho AI.");
            return;
        }

        // Khởi tạo latestData với giá trị từ DB
        let latestData = {};
        for (const sensorName of systemSensors) {
            try {
                const sensor = await db.Sensor.findOne({ where: { sensorName } });
                if (sensor) {
                    const latestRecord = await db.SensorData.findOne({
                        where: { SDsensorId: sensor.id },
                        order: [['time', 'DESC']],
                        attributes: ['value'],
                        raw: true
                    });
                    latestData[sensorName] = latestRecord ? parseFloat(latestRecord.value) : null;
                } else {
                    latestData[sensorName] = null;
                }
            } catch (err) {
                console.error(`❌ Lỗi khi load giá trị ban đầu cho ${sensorName}:`, err);
                latestData[sensorName] = null;
            }
        }

        const listener = async ({ sensorName, value }) => {
            if (!systemSensors.includes(sensorName)) return;

            latestData[sensorName] = parseFloat(value) || 0;

            // Chưa đủ sensor → đợi tiếp
            if (Object.values(latestData).some(v => v === null || v === undefined)) {
                console.log(`⏳ [AI] Chưa đủ dữ liệu sensor, đang chờ...`);
                return;
            }

            try {
                // 🔥 Build payload theo format mà API AI yêu cầu
                const aiPayload = {};

                for (const sensor of systemSensors) {
                    const aiKey = SENSOR_MAP[sensor];
                    aiPayload[aiKey] = latestData[sensor];
                }

                console.log("📤 Payload gửi AI:", aiPayload);

                // Gửi yêu cầu tới mô hình AI
                const aiRes = await axios.post(AI_API_URL, aiPayload, {
                    headers: { "Content-Type": "application/json" },
                    timeout: 10000 // 10s timeout
                });
                
                const aiDecision = aiRes?.data;
                if (!aiDecision) {
                    console.error("⚠️ AI không trả về dữ liệu");
                    return;
                }

                // Normalize giá trị về số (AI có thể trả về string hoặc number)
                const pumpValue = parseInt(aiDecision.pump) || 0;
                const lightValue = parseInt(aiDecision.light) || 0;
                const pumpPower = parseInt(aiDecision.pump_power) || 100;
                const lightPower = parseInt(aiDecision.light_power) || 100;

                // Kiểm tra giá trị hợp lệ
                if ((pumpValue !== 0 && pumpValue !== 1) || (lightValue !== 0 && lightValue !== 1)) {
                    console.error("⚠️ AI trả về dữ liệu sai:", { pump: pumpValue, light: lightValue });
                    return;
                }

                // Kiểm tra trạng thái device
                const freshDevice = await db.Device.findByPk(deviceId);
                if (!freshDevice || freshDevice.mode !== "AI_POWERED") {
                    console.log(`⚠️ Device ${deviceName} không còn ở chế độ AI_POWERED`);
                    return;
                }

                console.log(`⚡ AI quyết định - pump: ${pumpValue}, light: ${lightValue}`);

                // Xử lý cho switch (pump)
                if (freshDevice.adaDevName === 'switch') {
                    const desiredStatus = pumpValue === 1 ? 'ON' : 'OFF';
                    const desiredPower = pumpValue === 1 ? pumpPower : 0;

                    // Chỉ thực hiện nếu trạng thái khác với mong muốn
                    if (freshDevice.status !== desiredStatus) {
                        console.log(`🔄 [AI] ${deviceName} chuyển từ ${freshDevice.status} → ${desiredStatus} (power: ${desiredPower})`);
                        await applyDeviceAction(freshDevice, desiredStatus, desiredPower);
                    } else {
                        // Nếu status đúng nhưng power khác, cập nhật power
                        if (pumpValue === 1 && freshDevice.power !== String(desiredPower)) {
                            console.log(`⚙️ [AI] ${deviceName} cập nhật power từ ${freshDevice.power} → ${desiredPower}`);
                            await db.Device.update(
                                { power: String(desiredPower) },
                                { where: { id: deviceId } }
                            );
                        }
                        console.log(`✓ [AI] ${deviceName} đã ở trạng thái ${desiredStatus}, không cần thay đổi`);
                    }
                }

                // Xử lý cho switch1 (light)
                if (freshDevice.adaDevName === 'switch1') {
                    const desiredStatus = lightValue === 1 ? 'ON' : 'OFF';
                    const desiredPower = lightValue === 1 ? lightPower : 0;

                    // Chỉ thực hiện nếu trạng thái khác với mong muốn
                    if (freshDevice.status !== desiredStatus) {
                        console.log(`🔄 [AI] ${deviceName} chuyển từ ${freshDevice.status} → ${desiredStatus} (power: ${desiredPower})`);
                        await applyDeviceAction(freshDevice, desiredStatus, desiredPower);
                    } else {
                        // Nếu status đúng nhưng power khác, cập nhật power
                        if (lightValue === 1 && freshDevice.power !== String(desiredPower)) {
                            console.log(`⚙️ [AI] ${deviceName} cập nhật power từ ${freshDevice.power} → ${desiredPower}`);
                            await db.Device.update(
                                { power: String(desiredPower) },
                                { where: { id: deviceId } }
                            );
                        }
                        console.log(`✓ [AI] ${deviceName} đã ở trạng thái ${desiredStatus}, không cần thay đổi`);
                    }
                }
            } catch (err) {
                console.error("❌ AI_POWER ERROR:", err.message);
                if (err.response) {
                    console.error("Response data:", err.response.data);
                }
            }
        };

        sensorEmitter.on("sensorData", listener);
        activeAutoListeners.set(deviceId, listener);

        console.log(`🎧 Listening AI_POWER for ${deviceName}`);

        // Đánh giá ngay sau khi khởi tạo nếu đã có đủ dữ liệu
        setTimeout(async () => {
            if (!Object.values(latestData).some(v => v === null || v === undefined)) {
                console.log(`🚀 [AI] Đánh giá ngay sau khởi tạo cho ${deviceName}`);
                // Trigger listener với sensor đầu tiên để đánh giá
                const firstSensor = systemSensors[0];
                if (firstSensor && latestData[firstSensor] !== null) {
                    await listener({ sensorName: firstSensor, value: latestData[firstSensor] });
                }
            }
        }, 500);
    } else {
        console.log(`⚠️ Thiết bị ${deviceName} (${adaDevName}) không thể áp dụng chế độ AI`);
        return { EC: 2, EM: `Thiết bị ${deviceName} không thể áp dụng chế độ AI`, DT: '' };
    }
};


const refreshScheduleWatcher = async (deviceId) => {
    try {
        const device = await db.Device.findByPk(deviceId);
        if (!device) return;
        if (device.mode !== 'SCHEDULE') return;
        await registerRealtimeSchedule(device);
    } catch (err) {
        console.error(`❌ Error refreshing schedule watcher for device ${deviceId}:`, err);
    }
};

// Map để track thời gian gửi Telegram message gần nhất cho mỗi device (tránh gửi trùng lặp)
const lastTelegramMessageTime = new Map();
const TELEGRAM_COOLDOWN_MS = 5 * 1000; // 5 giây cooldown

// Map để lock việc applyDeviceAction cho mỗi device (tránh gửi MQTT trùng lặp)
const deviceActionLocks = new Map();
const LOCK_TIMEOUT_MS = 5 * 1000; // 10 giây timeout để tránh lock vĩnh viễn

// ======================================================
// 🔹 Hành động ON/OFF chung (MQTT + DB + emit FE)
//    options:
//      - skipCooldown: true -> bỏ cooldown trong publishSafeToFeed (dùng cho SCHEDULE)
// ======================================================
const applyDeviceAction = async (device, action, power, options = {}) => {
    // 🔒 Kiểm tra lock để tránh gọi trùng lặp
    if (deviceActionLocks.has(device.id)) {
        console.log(`🔒 ${device.deviceName} đang trong quá trình xử lý, bỏ qua lần gọi này.`);
        return false;
    }

    // 🔒 Set lock với timeout để tránh lock vĩnh viễn
    deviceActionLocks.set(device.id, true);
    const lockTimeout = setTimeout(() => {
        console.warn(`⚠️ Lock timeout cho device ${device.id}, tự động release.`);
        deviceActionLocks.delete(device.id);
    }, LOCK_TIMEOUT_MS);

    try {
        if (!device.adaDevName) {
            console.warn(`⚠️ ${device.deviceName} chưa có adaDevName.`);
            return false;
        }

        const newStatus = action === 'ON' ? 'ON' : 'OFF';

        // 🔄 Reload device từ DB để tránh race condition
        const freshDevice = await db.Device.findByPk(device.id);
        if (!freshDevice) {
            console.warn(`⚠️ Device ${device.id} không tồn tại.`);
            return false;
        }

        // 🔍 Nếu trạng thái không thay đổi thì bỏ qua
        if (freshDevice.status === newStatus) {
            console.log(`⚙️ ${freshDevice.deviceName} đã ở trạng thái ${newStatus}, không gửi MQTT.`);
            return false;
        }

        // 📤 Gửi MQTT tới Adafruit IO
        const success = await publishSafeToFeed(freshDevice, newStatus, power, options);
        if (!success) {
            console.warn(`⚠️ Không thể gửi tín hiệu ${newStatus} đến ${freshDevice.deviceName}`);
            return false;
        }

        // 💾 Cập nhật DB sau khi gửi thành công
        await db.Device.update(
            {
                status: newStatus,
                power: power ? power : '100',
                updatedAt: new Date()
            },
            { where: { id: freshDevice.id } }
        );
        console.log(`💾 DB cập nhật ${freshDevice.deviceName} → ${newStatus}`);
        // 🧾 Lưu log mỗi khi thiết bị đổi trạng thái
        if (freshDevice.mode !== 'MANUAL') {
            await db.Log.create({
                dev_Id: freshDevice.id,
                value: newStatus,
                time: new Date(),
                description:
                    freshDevice.mode === 'AUTO'
                        ? 'Thiết bị được tác động bởi Rule tự động.'
                        : freshDevice.mode === 'SCHEDULE'
                            ? 'Thiết bị được bật/tắt theo lịch.'
                            : freshDevice.mode === 'AI_POWERED'
                                ? 'Thiết bị được điều khiển bởi AI.'
                                : 'Thiết bị thay đổi trạng thái.',
                mode:
                    freshDevice.mode === 'AUTO'
                        ? 'AUTO'
                        : freshDevice.mode === 'SCHEDULE'
                            ? 'SCHEDULE'
                            : freshDevice.mode === 'AI_POWERED'
                                ? 'AI_POWERED'
                                : 'NULL',
            });
        }
        console.log(`🧾 Log lưu lại: ${freshDevice.deviceName} - ${newStatus}`);

        // Kiểm tra cooldown để tránh gửi Telegram message trùng lặp
        const lastTime = lastTelegramMessageTime.get(freshDevice.id) || 0;
        const now = Date.now();
        const shouldSendTelegram = now - lastTime >= TELEGRAM_COOLDOWN_MS;

        if (freshDevice.mode === 'AUTO' && shouldSendTelegram) {
            // 🔔 Gửi thông báo Telegram cho tất cả user
            const users = await db.Users.findAll({
                where: { teleChatID: { [Op.ne]: null } },
                attributes: ['teleChatID']
            });
            const message = `⚙️ Thiết bị ${freshDevice.deviceName} đã chuyển sang trạng thái ${newStatus} ở chế độ AUTO`;
            for (const user of users) {
                if (user.teleChatID) {
                    sendTelegramMessage(user.teleChatID, message)
                        .catch(err => console.error(`❌ Lỗi gửi Telegram tới ${user.teleChatID}:`, err));
                }
            }
            lastTelegramMessageTime.set(freshDevice.id, now);
        }
        if (freshDevice.mode === 'AI_POWERED' && shouldSendTelegram) {
            // 🔔 Gửi thông báo Telegram cho tất cả user
            const users = await db.Users.findAll({
                where: { teleChatID: { [Op.ne]: null } },
                attributes: ['teleChatID']
            });
            const message = `⚙️ Thiết bị ${freshDevice.deviceName} đã chuyển sang trạng thái ${newStatus} ở chế độ AI_POWERED`;
            for (const user of users) {
                if (user.teleChatID) {
                    sendTelegramMessage(user.teleChatID, message)
                        .catch(err => console.error(`❌ Lỗi gửi Telegram tới ${user.teleChatID}:`, err));
                }
            }
            lastTelegramMessageTime.set(freshDevice.id, now);
        }
        return true;

    } catch (err) {
        console.error(`❌ applyDeviceAction error (${device.deviceName}):`, err);
        return false;
    } finally {
        // 🔓 Release lock sau khi hoàn thành (dù thành công hay thất bại)
        clearTimeout(lockTimeout);
        deviceActionLocks.delete(device.id);
    }
};

// ======================================================
// 🔹 Hàm so sánh điều kiện rule
// ======================================================
const checkCondition = (v, op, c) => {
    const a = Number(v), b = Number(c);
    const result = (
        op === '>' ? a > b :
            op === '<' ? a < b :
                op === '>=' ? a >= b :
                    op === '<=' ? a <= b :
                        op === '==' ? a === b :
                            op === '!=' ? a !== b : false
    );
    console.log(`🔍 So sánh: ${a} ${op} ${b} → ${result}`);
    return result;
};

// Hàm tự khởi động lại các thiết bị AUTO khi server khởi động
export async function initAutoDevices() {
    try {
        const autoDevices = await db.Device.findAll({
            where: { mode: 'AUTO' },
        });

        if (!autoDevices.length) {
            console.log('⚙️ Không có thiết bị nào ở chế độ AUTO khi khởi động.');
            return;
        }

        console.log(`🔄 Khởi động lại AUTO mode cho ${autoDevices.length} thiết bị...`);
        for (const device of autoDevices) {
            await registerRealtimeAuto(device);
        }
    } catch (err) {
        console.error('❌ Lỗi khi initAutoDevices:', err);
    }
};

export async function initAIDevice() {
    try {
        const aiDevices = await db.Device.findAll({
            where: { mode: 'AI_POWERED' }
        })
        if (!aiDevices.length) {
            console.log('⚙️ Không có thiết bị nào ở chế độ AI_POWERED khi khởi động.');
            return
        }

        console.log(`Khởi động lại AI_POWERED cho ${aiDevices.length} thiết bị...`);
        for (const d of aiDevices) {
            await registerAiPowerMode(d);
        }
    }
    catch (e) {

    }
}
const deleteScheduleDevice = async (mode, scheduleId) => {
    try {

        if (mode !== 'MANUAL' || mode !== 'SCHEDULE') {
            return {
                EM: 'Do not have permission to do this',
                EC: 2,
                DT: '',
            };
        } else {
            let schedule = await db.Schedule.findOne({
                where: { id: scheduleId },
            });
            if (schedule) {
                await schedule.destroy();
                return {
                    EM: 'Delete schedule success',
                    EC: 0,
                    DT: '',
                };
            } else {
                return {
                    EM: 'Schedule is not exist',
                    EC: 2,
                    DT: '',
                };
            }
        }

    } catch (e) {
        console.error('❌ Error deleteRuleService:', e);
        return {
            EM: 'Error deleteRuleService',
            EC: 2,
            DT: '',
        };
    }
}
const createNewDeviceService = async (inputData) => {
    try {
        if (!inputData.adaDevName || !inputData.deviceName) {
            return {
                EM: 'Missing adaDevName or deviceName',
                EC: 1,
                DT: '',
            };
        }
        let adaDeviceName = await db.Device.findOne({
            where: { adaDevName: inputData.adaDevName },
            raw: true,
        })
        let deviceName = await db.Device.findOne({
            where: { deviceName: inputData.deviceName },
            raw: true
        })
        console.error("Check check ")
        if (adaDeviceName || deviceName) {
            return {
                EM: 'AdaDevName or deviceName has already exist',
                EC: 1,
                DT: '',
            };
        }
        let device = await db.Device.create({
            adaDevName: inputData.adaDevName,
            deviceName: inputData.deviceName,
            description: inputData.description,
            status: inputData.status ? inputData.status : 'OFF',
            power: inputData.power ? inputData.power : '100',
            mode: inputData.mode ? inputData.mode : 'MANUAL',
        })
        return {
            EC: 0,
            EM: "Device created successfully",
            DT: '',
        };
    }
    catch (e) {
        console.log('Error in createNewDeviceService: ', e);
        return {
            EM: 'Error createNewDeviceService',
            EC: 2,
            DT: '',
        };
    }
}
const updateDeviceInforService = async (inputData) => {
    try {
        // Tìm device bằng id
        if (!inputData.id) {
            return {
                EM: 'Missing required parameter: id',
                EC: 1,
                DT: '',
            };
        }

        let device = await db.Device.findByPk(inputData.id);

        if (!device) {
            return {
                EM: 'Update device error. Not found device',
                EC: 2,
                DT: '',
            };
        }

        // Kiểm tra nếu adaDevName mới khác với adaDevName cũ
        // và adaDevName mới đã được sử dụng bởi device khác
        if (inputData.adaDevName && inputData.adaDevName !== device.adaDevName) {
            const existingDevice = await db.Device.findOne({
                where: {
                    adaDevName: inputData.adaDevName,
                    id: { [Op.ne]: device.id } // Không phải chính device này
                },
            });

            if (existingDevice) {
                return {
                    EM: 'AdaDevName has already been used by another device',
                    EC: 1,
                    DT: '',
                };
            }
        }

        // Chuẩn bị dữ liệu cập nhật
        const updateData = {};
        if (inputData.adaDevName) updateData.adaDevName = inputData.adaDevName;
        if (inputData.deviceName) updateData.deviceName = inputData.deviceName;
        if (inputData.description !== undefined) updateData.description = inputData.description;
        if (inputData.status) updateData.status = inputData.status;
        if (inputData.power !== undefined) updateData.power = inputData.power;

        // Cập nhật device
        await device.update(updateData);

        return {
            EM: 'Update success',
            EC: 0,
            DT: '',
        };
    } catch (e) {
        console.error('❌ Error updateDeviceInforService:', e);
        return {
            EM: 'Error updateDeviceInforService',
            EC: -1,
            DT: '',
        };
    }
}
const deleteDeviceService = async (adaDevName) => {
    try {
        let device = await db.Device.findOne({
            where: { adaDevName: adaDevName },
        });
        if (device) {
            await device.destroy();
            return {
                EM: 'Delete device success',
                EC: 0,
                DT: '',
            };
        } else {
            return {
                EM: 'Device is not exist',
                EC: 2,
                DT: '',
            };
        }
    } catch (e) {
        console.error('❌ Error deleteDeviceService:', e);
        return {
            EM: 'Error deleteDeviceService',
            EC: 2,
            DT: '',
        };
    }
}
const getDeviceLogsService = async (dev_Id, limit, offset, timeStart, timeEnd) => {
    try {
        let { count, rows } = await db.Log.findAndCountAll({
            where: {
                dev_Id: dev_Id,
                time: {
                    [Op.between]: [new Date(timeStart), new Date(timeEnd)],
                },
            },
            attributes: ['id', 'dev_Id', 'time', 'value', 'description', 'mode'],
            order: [['time', 'DESC']],
            limit,
            offset,
            raw: true,
        });
        if (!rows || rows.length === 0) {
            return {
                EM: 'No data found for this device',
                EC: 1,
                DT: { logs: [], totalPages: 0, currentPage: 1 },
            };
        };
        let totalPages = Math.ceil(count / limit);
        return {
            EC: 0,
            EM: 'Get device log success',
            DT: {
                logs: rows,
                totalRecords: count,
                totalPages,
                currentPage: Math.floor(offset / limit) + 1,
            },
        };
    }
    catch (e) {
        console.error('❌ Error getDeviceLogsService:', e);
        return {
            EM: 'Error getDeviceLogsService',
            EC: 2,
            DT: '',
        };
    }
}
const getDeviceStaPowRunCurService = async (id) => {
    try {
        let device = await db.Device.findOne({
            where: { id: id },
            attributes: ['id', 'deviceName', 'adaDevName', 'power', 'status'],
            raw: true
        })
        if (!device) {
            return {
                EM: 'Device not found',
                EC: 1,
                DT: ''
            };
        }

        let lastLog = await db.Log.findOne({
            where: { dev_Id: id },
            order: [['time', 'DESC']],
            attributes: ['value', 'time'],
            raw: true
        })
        let runtimeLog = null;
        console.log("Check check lastLog: ", lastLog)
        if (device.status === 'ON') {
            runtimeLog = lastLog ? lastLog.time : null;
        }
        return {
            EM: 'Get device status successfully',
            EC: 0,
            DT: {
                id: device.id,
                deviceName: device.deviceName,
                adaDevName: device.adaDevName,
                status: device.status,
                power: device.power,
                runtimeLog: runtimeLog,
            },
        };
    }
    catch (e) {
        console.error('❌ Error getDeviceStaPowRunCurService:', e);
        return {
            EM: 'Error getDeviceStaPowRunCurService',
            EC: 2,
            DT: '',
        };
    }
}

const getDeviceOnOffStatsService = async (id, startDate, endDate) => {
    try {
        // ✅ Kiểm tra thiết bị có tồn tại không
        const device = await db.Device.findOne({ where: { id }, raw: true });
        if (!device) {
            return { EM: "Device not found", EC: 1, DT: "" };
        }

        // ✅ Chuẩn bị thời gian: startDate từ đầu ngày, endDate đến cuối ngày
        const startDateObj = new Date(startDate);
        startDateObj.setHours(0, 0, 0, 0);
        
        const endDateObj = new Date(endDate);
        endDateObj.setHours(23, 59, 59, 999); // Đến cuối ngày để bao gồm cả ngày cuối
        
        // ✅ Truy vấn log trong khoảng thời gian
        const logs = await db.Log.findAll({
            where: {
                dev_Id: id,
                time: {
                    [Op.between]: [startDateObj, endDateObj]
                },
            },
            attributes: ['value', 'time'],
            raw: true
        });

        // ✅ Gom nhóm theo ngày (dùng moment-timezone để đảm bảo đúng múi giờ)
        const dailyStats = {};
        for (const log of logs) {
            // Chuyển sang múi giờ VN và lấy ngày
            const logDate = moment(log.time).tz('Asia/Ho_Chi_Minh');
            const dateKey = logDate.format('YYYY-MM-DD');
            if (!dailyStats[dateKey]) {
                dailyStats[dateKey] = { onCount: 0, offCount: 0 };
            }
            if (log.value === "ON") dailyStats[dateKey].onCount++;
            else if (log.value === "OFF") dailyStats[dateKey].offCount++;
        }

        // ✅ Chuyển object thành mảng (bao gồm cả ngày cuối)
        const start = moment(startDate).tz('Asia/Ho_Chi_Minh').startOf('day');
        const end = moment(endDate).tz('Asia/Ho_Chi_Minh').startOf('day');
        const result = [];
        const current = start.clone();
        
        // Bao gồm cả ngày cuối cùng
        while (current.isSameOrBefore(end)) {
            const dateKey = current.format('YYYY-MM-DD');
            const stats = dailyStats[dateKey]
                ? dailyStats[dateKey]
                : { onCount: null, offCount: null };
            result.push({ date: dateKey, ...stats });
            current.add(1, 'day');
        }
        return {
            EM: "Get ON/OFF stats successfully",
            EC: 0,
            DT: result
        };
    } catch (err) {
        console.error("❌ Error getDeviceOnOffStatsService:", err);
        return { EM: "Error getDeviceOnOffStatsService", EC: 2, DT: "" };
    }
};
// Hàm refresh AUTO mode cho device (dùng khi rule/setRule bị xóa)
export const refreshAutoModeForDevice = async (deviceId) => {
    try {
        const device = await db.Device.findByPk(deviceId);
        if (!device || device.mode !== 'AUTO') {
            return;
        }
        console.log(`🔄 Refreshing AUTO mode cho device ${device.deviceName} sau khi xóa rule`);
        await registerRealtimeAuto(device);
    } catch (err) {
        console.error(`❌ Lỗi khi refresh AUTO mode cho device ${deviceId}:`, err);
    }
};

export default {
    getAllDevice,
    toggleDeviceService,
    controlDeviceFromTelegram,
    getExacDeviceInforService,
    changeModeService,
    refreshScheduleWatcher,
    deleteScheduleDevice, createNewDeviceService, updateDeviceInforService,
    deleteDeviceService, getDeviceLogsService, getDeviceStaPowRunCurService, getDeviceOnOffStatsService
};
