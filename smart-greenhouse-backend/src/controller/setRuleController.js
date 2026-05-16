import setRuleService from '../service/setRuleService.js';

const getRulesOfSet = async (req, res) => {
    try {
        let rules = await setRuleService.getRulesOfSetService(req.query.setId);
        return res.status(200).json(rules);
    }
    catch (e) {
        console.log('Check error in getRulesOfSet: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const updateRulesOfSet = async (req, res) => {
    try {
        if (!req.query.setID || !req.body.emailNotification || !req.body.rules) {
            return res.status(200).json({
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            });
        }
        const setInfo = {
            setID: req.query.setID,
            emailNotification: req.body.emailNotification
        }
        let update = await setRuleService.updateSetService(setInfo, req.body.rules);
        return res.status(200).json(update);
    }
    catch (e) {
        console.log('Check error in updateRulesOfSet: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const createSetRule = async (req, res) => {
    try {
        if (!req.body.power || !req.body.status || !req.body.dev_Id || !req.body.setType) {
            return res.status(200).json({
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            });
        }
        let create = await setRuleService.createSetRule(req.body);
        return res.status(200).json(create);
    }
    catch (e) {
        console.log('Check error in createSetRule: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const deleteSetRule = async (req, res) => {
    try {
        if (!req.body.setID) {
            return res.status(200).json({
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            });
        }
        let deleted = await setRuleService.deleteSetRuleService(req.body.setID);
        return res.status(200).json(deleted);
    }
    catch (e) {
        console.log('Check error in deleteSetRule: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

export default {
    getRulesOfSet,
    updateRulesOfSet,
    deleteSetRule,
    createSetRule
};
