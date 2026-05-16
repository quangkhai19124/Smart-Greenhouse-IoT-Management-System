'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'Device',
      { adaDevName: 'switch1' },
      { id: 2 }
    );

    await queryInterface.bulkUpdate(
      'Device',
      { adaDevName: 'switch' },
      { id: 3 }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkUpdate(
      'Device',
      { adaDevName: 'switch' },
      { id: 2 }
    );

    await queryInterface.bulkUpdate(
      'Device',
      { adaDevName: 'switch' },
      { id: 3 }
    );
  }
};
