'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Device', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      description: { type: Sequelize.STRING },
      deviceName: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      adaDevName: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM('ON', 'OFF'),
      },
      mode: {
        type: Sequelize.ENUM('MANUAL', 'AUTO', 'AI_POWERED', 'SCHEDULE'),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('Device');
  },
};
