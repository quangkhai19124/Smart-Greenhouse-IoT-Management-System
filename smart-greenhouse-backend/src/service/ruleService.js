import db from '../models/index';
import { refreshAutoModeForDevice } from './deviceService.js';

const updateRuleService = async (ruleId, newData) => {
    try {
        let rule = await db.Rule.findOne({
            where: { id: ruleId },
        });
        if (rule) {
            await rule.update(newData);
            return {
                EM: 'Update rule success',
                EC: 0,
                DT: rule,
            };
        } else {
            return {
                EM: 'Rule is not exist',
                EC: 2,
                DT: '',
            };
        }
    } catch (e) {
        console.error('❌ Error updateRuleService:', e);
        return {
            EM: 'Error updateRuleService',
            EC: 2,
            DT: '',
        };
    }
};

const createRuleService = async (data) => {
    try {
        let newRule = await db.Rule.create(data);
        return {
            EM: 'Create rule success',
            EC: 0,
            DT: newRule,
        };
    } catch (e) {
        console.error('❌ Error createRuleService:', e);
        return {
            EM: 'Error createRuleService',
            EC: 2,
            DT: '',
        };
    }
};

const deleteRuleService = async (ruleId) => {
    try {
        let rule = await db.Rule.findOne({
            where: { id: ruleId },
            include: [{
                model: db.setRule,
                attributes: ['dev_Id']
            }]
        });
        if (rule) {
            // Lấy deviceId từ setRule trước khi xóa
            const deviceId = rule.setRule?.dev_Id;
            
            await rule.destroy();
            
            // Refresh AUTO mode nếu device đang ở mode AUTO
            if (deviceId) {
                await refreshAutoModeForDevice(deviceId);
            }
            
            return {
                EM: 'Delete rule success',
                EC: 0,
                DT: '',
            };
        } else {
            return {
                EM: 'rule is not exist',
                EC: 2,
                DT: '',
            };
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
export default {
    deleteRuleService
}
