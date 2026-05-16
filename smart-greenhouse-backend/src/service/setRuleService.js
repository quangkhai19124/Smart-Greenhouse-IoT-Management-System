import db from '../models/index';
import { sendTelegramMessage } from './telegramService.js'
import { Op, where } from 'sequelize';
import { refreshAutoModeForDevice } from './deviceService.js';

const createSetRule = async (body) => {

    const { power, status, dev_Id, setType } = body

    try {
        const newSetRule = await db.setRule.create({
            power: power || 100,
            status: status || "OFF",
            dev_Id: dev_Id,
            description: `Set rule to turn ${status} device ${dev_Id}`,
            emailNotification: "OFF",
            setType: setType,
            createdAt: new Date(),
            updatedAt: new Date()
        })

        return {
            EM: 'Create new set rule success',
            EC: 0,
            DT: {
                setID: newSetRule.id
            }
        };
    } catch (e) {
        console.error('Error createSetRule:', e);
        return {
            EM: 'Error creating set rule',
            EC: 2,
            DT: ''
        };
    }
};

const updateSetService = async (setInfo, rules) => {
    try {
        const emailNotification = setInfo.emailNotification;
        const setID = setInfo.setID;

        // Lấy deviceId từ setRule trước khi xóa rules
        const setRule = await db.setRule.findOne({
            where: { id: setID },
            attributes: ['dev_Id']
        });
        const deviceId = setRule?.dev_Id;

        if (emailNotification !== undefined) {
            await db.setRule.update(
                { emailNotification: emailNotification },
                { where: { id: setID } }
            );
        }

        const removeRules = await db.Rule.destroy({
            where: {
                setID: setID
            }
        })

        for (let rule of rules) {
            const createRule = await db.Rule.create({
                ...rule,
                setID: setID,
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }

        // Refresh AUTO mode nếu device đang ở mode AUTO
        if (deviceId) {
            await refreshAutoModeForDevice(deviceId);
        }

        return {
            EM: 'Update rules and notification settings success',
            EC: 0,
            DT: 'Success'
        };
    } catch (e) {
        console.error('Error updateRuleOfSet:', e);
        return {
            EM: 'Error updating rules',
            EC: 2,
            DT: ''
        };
    }
};

const getRulesOfSetService = async (setId = 1) => {
    let rules = await db.Rule.findAll({
        where: { setID: setId },
        attributes: [
            'id',
            'logicOperator', // AND, OR
            'operator', // < > = ...
            'condition', // value
        ],
        raw: true,
        include: [
            {
                model: db.Sensor,
                attributes: ['id', 'sensorName'],
                required: true
            }
        ],
        order: [['id', 'ASC']] //sort ascending, 1st rule has no logicOperator
    });
    let set = await db.setRule.findOne({
        where: { id: setId },
        attributes: ['id', 'emailNotification'],
        raw: true
    });
    rules = rules.map(({ ['Sensor.sensorName']: sensorName, ['Sensor.id']: sensorId, ...rest }) => ({
        ...rest,
        sensorName,
        sensorId
    }));

    // rules = {
    //     rules,
    //     emailNotification: set ? set.emailNotification : "example@gmail.com"
    // };
    return { rules, setInfo: set };
};

const notifyIfSetRuleSatisfied = async (set, avgValueMap = {}) => {
    try {
        const setType = set.dataValues?.setType;
        
        // Chỉ xử lý NOTIFICATION và AUTO_CONTROL
        if (setType !== 'NOTIFICATION' && setType !== 'AUTO_CONTROL') return;
        
        // Nếu là AUTO_CONTROL thì phải check emailNotification === 'ON' và device phải ở mode AUTO
        if (setType === 'AUTO_CONTROL') {
            if (set.dataValues.emailNotification !== 'ON') return;
            
            // Check device mode: chỉ gửi cảnh báo nếu device đang ở mode AUTO
            // Lấy deviceId từ dev_Id hoặc từ Device nếu có
            const deviceId = set.dataValues.dev_Id || set.dataValues.Device?.id;
            if (!deviceId) {
                console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL: không tìm thấy deviceId`);
                return;
            }
            
            // Lấy mode từ Device đã load hoặc query lại từ DB
            const deviceMode = set.dataValues.Device?.mode;
            if (deviceMode) {
                // Nếu đã có mode từ Device đã load, check trực tiếp
                if (deviceMode !== 'AUTO') {
                    console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho device ${deviceId}: device không ở mode AUTO (hiện tại: ${deviceMode})`);
                    return;
                }
            } else {
                // Nếu chưa có mode, query lại từ DB
                const device = await db.Device.findByPk(deviceId, { attributes: ['mode'] });
                if (!device || device.mode !== 'AUTO') {
                    console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho device ${deviceId}: device không ở mode AUTO (hiện tại: ${device?.mode || 'N/A'})`);
                    return;
                }
            }
        }
        
        // // Check status và emailNotification cho NOTIFICATION rules
        // if (setType === 'NOTIFICATION') {
        //     if (set.dataValues.status !== 'ON') {
        //         console.log(`⏭️ Bỏ qua cảnh báo NOTIFICATION cho setRule ${set.id}: status = ${set.dataValues.status}`);
        //         return;
        //     }
        //     if (set.dataValues.emailNotification !== 'ON') {
        //         console.log(`⏭️ Bỏ qua cảnh báo NOTIFICATION cho setRule ${set.id}: emailNotification = ${set.dataValues.emailNotification}`);
        //         return;
        //     }
        // }
        
        const deviceName = set.dataValues.Device?.deviceName;
        if (!deviceName) {

            // Lấy tất cả rule của set này
            const rules = await db.Rule.findAll({
                where: { setID: set.id },
                include: [{ model: db.Sensor, attributes: ['id', 'sensorName'] }]
            });

            if (!rules || rules.length === 0) return;

            let result = true;
            for (let i = 0; i < rules.length; i++) {
                const r = rules[i];
                const sensorValue = avgValueMap[r.Sensor.sensorName];
                const condition = parseFloat(r.condition);
                let satisfied = false;

                console.log(`🔍 SetRule ${set.id} - Rule ${i + 1}: ${r.Sensor.sensorName} ${r.operator} ${condition}, giá trị: ${sensorValue}`);

                switch (r.operator) {
                    case '>': satisfied = sensorValue > condition; break;
                    case '<': satisfied = sensorValue < condition; break;
                    case '=': satisfied = sensorValue === condition; break;
                    case '>=': satisfied = sensorValue >= condition; break;
                    case '<=': satisfied = sensorValue <= condition; break;
                }

                if (i === 0) result = satisfied;
                else {
                    if (r.logicOperator === 'AND') result = result && satisfied;
                    else if (r.logicOperator === 'OR') result = result || satisfied;
                }
            }

            console.log(`📊 SetRule ${set.id} - Kết quả đánh giá: ${result}`);

            if (!result) return; // ❌ Không thỏa cụm, không gửi

            // ✅ Cụm rule được thỏa → gửi tin nhắn Telegram
            const users = await db.Users.findAll({
                where: { teleChatID: { [Op.ne]: null } },
                attributes: ['teleChatID']
            });

            // Xây dựng message chi tiết với thông tin sensor và rule (Notification rule - không có device)
            let message = `CẢNH BÁO: Sensor đã vượt ngưỡng!\n\n`;
            
            // Liệt kê các rule đã thỏa với thông tin chi tiết
            message += `Chi tiết các điều kiện đã thỏa:\n`;
            for (let i = 0; i < rules.length; i++) {
                const r = rules[i];
                const sensorValue = avgValueMap[r.Sensor.sensorName];
                const condition = parseFloat(r.condition);
                const operatorText = {
                    '>': 'lớn hơn',
                    '<': 'nhỏ hơn',
                    '=': 'bằng',
                    '>=': 'lớn hơn hoặc bằng',
                    '<=': 'nhỏ hơn hoặc bằng'
                }[r.operator] || r.operator;
                
                message += `\n${i + 1}. Sensor "${r.Sensor.sensorName}"\n`;
                message += `   - Giá trị hiện tại: ${sensorValue.toFixed(2)}\n`;
                message += `   - Điều kiện: ${operatorText} ${condition}\n`;
                
                if (i > 0 && r.logicOperator) {
                    message += `   - Logic: ${r.logicOperator}\n`;
                }
            }

            for (const user of users) {
                await sendTelegramMessage(user.teleChatID, message)
                    .catch(err => console.error(`❌ Lỗi gửi Telegram:`, err));
            }

            return;
        };

        // Phần này xử lý AUTO_CONTROL rules (có device)
        // Không gửi nếu setRule đang tắt
        const setTypeCheck = set.dataValues?.setType;
        if (!set.dataValues || (setTypeCheck !== "NOTIFICATION" && setTypeCheck !== "AUTO_CONTROL") || set.dataValues.status !== 'ON') {
            console.log(`⏭️ Bỏ qua setRule ${set.id}: status = ${set.dataValues?.status || 'N/A'}, setType = ${setTypeCheck || 'N/A'}`);
            return;
        }
        
        // Nếu là AUTO_CONTROL thì phải check emailNotification === 'ON' và device phải ở mode AUTO
        if (setTypeCheck === 'AUTO_CONTROL') {
            if (set.dataValues.emailNotification !== 'ON') {
                console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho setRule ${set.id}: emailNotification = ${set.dataValues.emailNotification}`);
                return;
            }
            
            // Check device mode: chỉ gửi cảnh báo nếu device đang ở mode AUTO
            // Lấy deviceId từ dev_Id hoặc từ Device nếu có
            const deviceId = set.dataValues.dev_Id || set.dataValues.Device?.id;
            if (!deviceId) {
                console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho setRule ${set.id}: không tìm thấy deviceId`);
                return;
            }
            
            // Lấy mode từ Device đã load hoặc query lại từ DB
            const deviceMode = set.dataValues.Device?.mode;
            if (deviceMode) {
                // Nếu đã có mode từ Device đã load, check trực tiếp
                if (deviceMode !== 'AUTO') {
                    console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho setRule ${set.id} (device ${deviceId}): device không ở mode AUTO (hiện tại: ${deviceMode})`);
                    return;
                }
            } else {
                // Nếu chưa có mode, query lại từ DB
                const device = await db.Device.findByPk(deviceId, { attributes: ['mode'] });
                if (!device || device.mode !== 'AUTO') {
                    console.log(`⏭️ Bỏ qua cảnh báo AUTO_CONTROL cho setRule ${set.id} (device ${deviceId}): device không ở mode AUTO (hiện tại: ${device?.mode || 'N/A'})`);
                    return;
                }
            }
        }
        
        console.log(`🔍 Đang đánh giá setRule ${set.id} (setType: ${setTypeCheck})`);

        // Lấy tất cả rule của set này
        const rules = await db.Rule.findAll({
            where: { setID: set.id },
            include: [{ model: db.Sensor, attributes: ['id', 'sensorName'] }] // chỉ lấy tên sensor
        });

        if (!rules || rules.length === 0) return;

        // Lấy giá trị trung bình của các sensor nếu chưa có avgValueMap
        for (const r of rules) {
            const sensorName = r.Sensor.sensorName;
            if (avgValueMap[sensorName] === undefined) {
                const fifteenMinutesAgo = new Date(Date.now());
                const [avgData] = await db.SensorData.findAll({
                    attributes: [[db.sequelize.fn('AVG', db.sequelize.col('value')), 'avgValue']],
                    where: { SDsensorId: r.Sensor.id, time: { [Op.gte]: fifteenMinutesAgo } },
                    raw: true
                });
                avgValueMap[sensorName] = parseFloat(avgData?.avgValue) || 0;
            }
        }

        // Đánh giá logic của cụm (AND/OR)
        let result = true;
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i];
            const sensorValue = avgValueMap[r.Sensor.sensorName];
            const condition = parseFloat(r.condition);
            let satisfied = false;

            console.log(`🔍 SetRule ${set.id} - Rule ${i + 1}: ${r.Sensor.sensorName} ${r.operator} ${condition}, giá trị: ${sensorValue}`);

            switch (r.operator) {
                case '>': satisfied = sensorValue > condition; break;
                case '<': satisfied = sensorValue < condition; break;
                case '=': satisfied = sensorValue === condition; break;
                case '>=': satisfied = sensorValue >= condition; break;
                case '<=': satisfied = sensorValue <= condition; break;
            }

            if (i === 0) result = satisfied;
            else {
                if (r.logicOperator === 'AND') result = result && satisfied;
                else if (r.logicOperator === 'OR') result = result || satisfied;
            }
        }

        console.log(`📊 SetRule ${set.id} - Kết quả đánh giá: ${result}`);

        if (!result) return; // ❌ Không thỏa cụm, không gửi

        // ✅ Cụm rule được thỏa → gửi tin nhắn Telegram
        const users = await db.Users.findAll({
            where: { teleChatID: { [Op.ne]: null } },
            attributes: ['teleChatID']
        });

        // Xây dựng message chi tiết với thông tin sensor và rule
        // Kiểm tra setType để quyết định message
        const deviceNameForMessage = set.dataValues.Device?.deviceName;
        const setTypeForMessage = set.dataValues?.setType;
        
        let message = '';
        if (setTypeForMessage === 'AUTO_CONTROL' && deviceNameForMessage) {
            // Rule điều khiển thiết bị - có tên device
            message = `CẢNH BÁO: Cụm Rule của thiết bị "${deviceNameForMessage}" đã được THỎA!\n\n`;
        } else {
            // Notification rule - cảnh báo sensor
            message = `CẢNH BÁO: Sensor đã vượt ngưỡng!\n\n`;
        }
        
        // Liệt kê các rule đã thỏa với thông tin chi tiết
        message += `Chi tiết các điều kiện đã thỏa:\n`;
        for (let i = 0; i < rules.length; i++) {
            const r = rules[i];
            const sensorValue = avgValueMap[r.Sensor.sensorName];
            const condition = parseFloat(r.condition);
            const operatorText = {
                '>': 'lớn hơn',
                '<': 'nhỏ hơn',
                '=': 'bằng',
                '>=': 'lớn hơn hoặc bằng',
                '<=': 'nhỏ hơn hoặc bằng'
            }[r.operator] || r.operator;
            
            message += `\n${i + 1}. Sensor "${r.Sensor.sensorName}"\n`;
            message += `   - Giá trị hiện tại: ${sensorValue.toFixed(2)}\n`;
            message += `   - Điều kiện: ${operatorText} ${condition}\n`;
            
            if (i > 0 && r.logicOperator) {
                message += `   - Logic: ${r.logicOperator}\n`;
            }
        }

        for (const user of users) {
            await sendTelegramMessage(user.teleChatID, message)
                .catch(err => console.error(`❌ Lỗi gửi Telegram:`, err));
        }
    } catch (err) {
        console.error('🔥 Lỗi trong notifyIfSetRuleSatisfied:', err);
    }
};
const deleteSetRuleService = async (setID) => {
    try {
        // Lấy deviceId từ setRule trước khi xóa
        const setRule = await db.setRule.findOne({
            where: { id: setID },
            attributes: ['dev_Id']
        });
        
        const deviceId = setRule?.dev_Id;
        
        const deleteRules = await db.Rule.destroy({
            where: {
                setID: setID
            }
        });

        const deleteSet = await db.setRule.destroy({
            where: {
                id: setID
            }
        });

        // Refresh AUTO mode nếu device đang ở mode AUTO
        if (deviceId) {
            await refreshAutoModeForDevice(deviceId);
        }

        return {
            EM: 'Deleted set rule and rules in it.',
            EC: 0,
            DT: 'Success'
        };
    } catch (e) {
        console.error('Error deleteSetRuleService:', e);
        return {
            EM: 'Error  when trying to delete set rule',
            EC: 2,
            DT: ''
        };
    }
};

export default {
    getRulesOfSetService,
    updateSetService,
    deleteSetRuleService,
    notifyIfSetRuleSatisfied,
    createSetRule
}
