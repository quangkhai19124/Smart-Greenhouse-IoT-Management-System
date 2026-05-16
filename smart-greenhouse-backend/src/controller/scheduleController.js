import scheduleService from '../service/scheduleService.js';
const createSchedule = async (req, res) => {
    try {
        let result = await scheduleService.createScheduleService(req.body.dev_Id, req.body.power);
        return res.status(200).json(result);
    }
    catch (e) {
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const updateSchedule = async (req, res) => {
    try {
        let result = await scheduleService.updateScheduleService(req.query, req.body);
        return res.status(200).json(result);
    }
    catch (e) {
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const deleteSchedule = async (req, res) => {
    try {
        if(!req.body.dev_Id || !req.body.schedId) {
            return res.status(500).json({
                EM: 'Missing required parameter',
                EC: 1,
                DT: '',
            });
        }
        // let check = await scheduleService.checkModeToDelete(req.body);
        // if(check.EC == 0) {
        //     let result = await scheduleService.deleteScheduleService(req.body);
        //     return res.status(200).json(result);
        // }
        // else {
        //     return res.status(400).json(check);
        // }
        let result = await scheduleService.deleteScheduleService(req.body);
        return res.status(200).json(result);

    }
    catch (e) {
        console.log('Check error in deleteSchedule: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

export default {
    createSchedule,
    updateSchedule,
    deleteSchedule
};
