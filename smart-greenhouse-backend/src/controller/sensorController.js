import sensorService from '../service/sensorService.js';

const getRulesOfSensorService = async (req, res) => {
    console.log('Check req.query.sensorID: ', req.query.sensorID);
    try {
        let rules = await sensorService.getRulesOfSensorService(req.query.sensorID);
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

const updateSensorNotifService = async (req, res) => {
    try {
        if (!req.query.sensorID || !req.body.rules) {
            return res.status(200).json({
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            });
        }
        let update = await sensorService.updateSensorNotifService(req.query.sensorID, req.body.rules);
        return res.status(200).json(update);
    }
    catch (e) {
        console.log('Check error in updateSensorNotifService: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

export default {
    getRulesOfSensorService,
    updateSensorNotifService
}
