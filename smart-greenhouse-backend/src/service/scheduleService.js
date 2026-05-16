import { where } from 'sequelize';
import db from '../models/index';
import DeviceService from './deviceService.js';

const createScheduleService = async (dev_Id, power) => {
    try {
        let newSched = await db.Schedule.create({
            timeStart: null,
            timeEnd: null,
            status: "INACTIVE",
            actionDay: null,
            power: power,
            dev_Id: dev_Id,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        await DeviceService.refreshScheduleWatcher(dev_Id);
        return {
            EM: 'Create schedule success',
            EC: 0,
            DT: {
                schedId: newSched.id
            },
        };
    } catch (e) {
        console.error('Error createScheduleService:', e);
        return {
            EM: 'Error createScheduleService',
            EC: 2,
            DT: '',
        };
    }
};

const updateScheduleService = async (query, body) => {

    const { dev_Id, schedId } = query;
    const { timeStart, timeEnd, actionDay } = body;

    try {
        // Lấy schedule cũ để giữ nguyên power nếu không có trong body
        const oldSchedule = await db.Schedule.findOne({
            where: {
                id: schedId,
                dev_Id: dev_Id
            }
        });

        if (!oldSchedule) {
            return {
                EM: 'Schedule not found',
                EC: 1,
                DT: '',
            };
        }

        // Giữ nguyên power từ schedule cũ nếu không có trong body
        const power = body.power !== undefined ? body.power : oldSchedule.power;
        const actionDay_str = actionDay ? actionDay.toString() : oldSchedule.actionDay;
        
        // Nếu có timeStart, timeEnd, actionDay thì tự động set status = 'ACTIVE'
        // Nếu không có trong body thì giữ nguyên status cũ
        let status = body.status !== undefined ? body.status : oldSchedule.status;
        
        // Tự động set ACTIVE nếu có đầy đủ thông tin schedule
        const hasTimeStart = timeStart !== undefined && timeStart !== null;
        const hasTimeEnd = timeEnd !== undefined && timeEnd !== null;
        const hasActionDay = actionDay !== undefined && actionDay !== null;
        
        if (hasTimeStart && hasTimeEnd && hasActionDay && body.status === undefined) {
            status = 'ACTIVE';
            console.log(`✅ Tự động set status = ACTIVE cho schedule ${schedId} vì có đầy đủ thông tin`);
        }

        // UPDATE thay vì DELETE và CREATE để tránh duplicate và giữ nguyên ID
        await db.Schedule.update(
            {
                timeStart: timeStart !== undefined ? timeStart : oldSchedule.timeStart,
                timeEnd: timeEnd !== undefined ? timeEnd : oldSchedule.timeEnd,
                status: status,
                actionDay: actionDay_str,
                power: power,
                updatedAt: new Date()
            },
            {
                where: {
                    id: schedId,
                    dev_Id: dev_Id
                }
            }
        );

        await DeviceService.refreshScheduleWatcher(dev_Id);
        return {
            EM: 'Update schedule success',
            EC: 0,
            DT: {
                schedId: schedId
            },
        };
    } catch (e) {
        console.error('Error updateScheduleService:', e);
        return {
            EM: 'Error updateScheduleService',
            EC: 2,
            DT: '',
        };
    }
};

const checkModeToDelete = async (body) => { // Not use 
    const { dev_Id, schedId } = body;

    try {

        const check = await db.Device.findOne({
            where: {
                id: dev_Id
            },
            attributes: [ 'mode' ]
        })

        if(check.mode == "SCHEDULE") {
            return {
                EM: 'Delete schedule fail, device is running in SCHEDULE mode. Change to other then try again',
                EC: 1,
                DT: '',
            }
        }

        return {
            EM: 'Running mode accepted',
            EC: 0,
            DT: '',
        }
    } catch (e) {
        console.error('Error checkModeToDelete:', e);
        return {
            EM: 'Error deleteScheduleService -> checkModeToDelete',
            EC: 2,
            DT: '',
        };
    }
};

const deleteScheduleService = async (body) => {

    const { dev_Id, schedId } = body;

    try {

        const check = await db.Device.findOne({
            where: {
                id: dev_Id
            },
            attributes: [ 'mode' ]
        })

        // if(check.mode == "SCHEDULE") {
        //     return {
        //         EM: 'Delete schedule fail, device is running in SCHEDULE mode. Change to other then try again',
        //         EC: 1,
        //         DT: '',
        //     }
        // }

        const removeSched = await db.Schedule.destroy({
            where: {
                id: schedId,
                dev_Id: dev_Id
            }
        });

        return {
            EM: 'Delete schedule success',
            EC: 0,
            DT: schedId,
        };
    } catch (e) {
        console.error('Error deleteScheduleService:', e);
        return {
            EM: 'Error deleteScheduleService',
            EC: 2,
            DT: '',
        };
    }
};

export default {
    createScheduleService,
    updateScheduleService,
    checkModeToDelete,
    deleteScheduleService
}
