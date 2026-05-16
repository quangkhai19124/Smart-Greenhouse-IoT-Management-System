import db from '../models/index';

const updateSensorNotifService = async (sensorID, rules) => {
    try {

        const rulesWithNullDevice = await db.Rule.findOne({
            where: {
                sensorID: sensorID,
            },
            include: [
                {
                model: db.setRule,
                where: { dev_Id: null },
                required: true,
                },
            ],
        });

        console.log("rulesWithNullDevice: ", rulesWithNullDevice?.setID);

        let setRuleId = null;
        if (rulesWithNullDevice?.setID) {
            setRuleId = rulesWithNullDevice.setID;
            await db.Rule.destroy({
                where: {
                    sensorID: sensorID,
                    setID: rulesWithNullDevice.setID,
                }
            });
        } else {
            // tạo setRule mới cho notification
            const newSetRule = await db.setRule.create({
                dev_Id: null,
                emailNotification: 'ON',
                setType: 'NOTIFICATION',
                createdAt: new Date(),
                updatedAt: new Date()
            });
            setRuleId = newSetRule.id;
        }

        console.log("setRuleId: ", setRuleId);
    
        // Update or create rules
        for (let rule of rules) {
            await db.Rule.create({
                ...rule,
                sensorID: sensorID,
                setID: setRuleId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        if (rules?.length === 0) {
            await db.setRule.destroy({
                where: { id: setRuleId }
            });
        }

        return {
            EM: 'Update rules and notification settings success',
            EC: 0,
            DT: 'Success'
            // DT: updateResults
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

const getRulesOfSensorService = async (sensorID = 1) => {
    let rules = await db.Rule.findAll({
        where: { sensorID: sensorID },
        attributes: [
            'id',
            'logicOperator', // AND, OR
            'operator', // < > = ...
            'condition'
        ],
        include: [
            {
                model: db.Sensor,
                where: { id: sensorID },
                attributes: ['id', 'name']
            },
            {
                model: db.setRule,
                where: { dev_Id: null },
                attributes: []
            }
        ],
        raw: true,
        order: [['id', 'ASC']] //sort ascending, 1st rule has no logicOperator
    });

    return rules;
}

export default {
    getRulesOfSensorService,
    updateSensorNotifService
}
