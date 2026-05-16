'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Log', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dev_Id: {
        primaryKey: true,
        allowNull: false,
        type: Sequelize.INTEGER,
        references: { model: 'Device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      value: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      time: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Log');
  },
};
