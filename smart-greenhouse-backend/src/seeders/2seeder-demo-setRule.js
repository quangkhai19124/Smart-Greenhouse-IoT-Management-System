'use strict';
const now = new Date();

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('setRule', [
            {
                power: 100,
                status: 'ON',      // ✅ PHẢI ĐÚNG CHUỖI ENUM
                dev_Id: 1,          // ID có thật trong Device
                description: 'Automatic rule set for device 1',
                createdAt: now,
                updatedAt: now,
            },
            {
                power: 50,
                status: 'OFF',     // ✅ PHẢI ĐÚNG ENUM
                dev_Id: 1,
                description: 'Manual rule set for device 1',
                createdAt: now,
                updatedAt: now,
            },
            {
                power: 0,
                status: 'OFF',     // ✅ PHẢI ĐÚNG ENUM
                dev_Id: null,
                description: 'Notification rule apply on sensor',
                createdAt: now,
                updatedAt: now,
            },
        ]);
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('setRule', null, {});
    },
};
