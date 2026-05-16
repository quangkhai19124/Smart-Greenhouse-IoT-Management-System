'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Schedule', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      timeStart: {
        type: Sequelize.DATE,
      },
      timeEnd: {
        type: Sequelize.DATE,
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      },
      actionDay: {
        type: Sequelize.STRING,
      },
      power: {
        type: Sequelize.INTEGER,
      },
      dev_Id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
    await queryInterface.dropTable('Schedule');
  },
};
