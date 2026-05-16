'use strict';
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('Rule', [
            {
                id: 1,
                setID: 1,
                sensorID: 1,
                operator: '>',
                condition: 35,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 2,
                setID: 2,
                sensorID: 2,
                operator: '<',
                condition: 40,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: 3,
                setID: 3,
                sensorID: 1,
                operator: '<',
                condition: 40,
                createdAt: new Date(),
                updatedAt: new Date()
            },
        ]);
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('Rule', null, {});
    },
};
