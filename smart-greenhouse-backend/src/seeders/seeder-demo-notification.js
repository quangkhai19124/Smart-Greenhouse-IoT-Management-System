'use strict';
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('Notification', [
      {
        id: 1,
        title: 'High Temperature Alert',
        message: 'Temperature exceeded 35°C',
        type: 'warning',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        title: 'Low Humidity Warning',
        message: 'Humidity dropped below 40%',
        type: 'alert',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Notification', null, {});
  },
};
