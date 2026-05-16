'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Rule', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      logicOperator: { type: Sequelize.STRING },
      operator: {
        allowNull: false,
        type: Sequelize.ENUM('>', '<', '=', '!=')
      },
      condition: { type: Sequelize.FLOAT },
      setID: {
        type: Sequelize.INTEGER,
        references: { model: 'setRule', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sensorID: {
        type: Sequelize.INTEGER,
        references: { model: 'Sensor', key: 'id' },
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
    await queryInterface.dropTable('Rule');
  },
};
