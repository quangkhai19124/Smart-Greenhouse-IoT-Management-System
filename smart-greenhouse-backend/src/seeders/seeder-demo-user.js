'use strict';

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      'Users',
      [
        {
          role: 'admin',
          username: 'admin',
          email: 'admin@gmail.com',
          password: '$2b$10$jkas4AQCw3FUGo0Vq7PhWevXsQMXAcmI.fOVE7L/rH9xWmSWSF..a',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          role: 'user',
          username: 'user',
          email: 'user@gmail.com',
          password: '$2b$10$jkas4AQCw3FUGo0Vq7PhWevXsQMXAcmI.fOVE7L/rH9xWmSWSF..a',
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};
