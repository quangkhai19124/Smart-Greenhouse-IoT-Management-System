import ruleService from '../service/ruleService.js';
const deleteRule = async (req, res) => {
    try {
        let change = await ruleService.deleteRuleService(req.body.id);
        return res.status(200).json(change);
    }
    catch (e) {
        console.log('Check error in deleteRule: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}
export default {
    deleteRule
};
