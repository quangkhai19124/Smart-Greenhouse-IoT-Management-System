'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate(
            'setRule',
            { setType: 'NOTIFICATION' },
            { id: 1 }
        );

        await queryInterface.bulkUpdate(
            'setRule',
            { setType: 'AUTO_CONTROL' },
            { id: 2 }
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkUpdate(
            'setRule',
            { setType: null },
            { id: 1 }
        );

        await queryInterface.bulkUpdate(
            'setRule',
            { setType: null },
            { id: 2 }
        );
    }
};
