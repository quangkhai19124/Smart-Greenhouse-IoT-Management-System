'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserNotif', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userID: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      notifID: {
        type: Sequelize.INTEGER,
        references: { model: 'Notification', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      status: { 
        type: Sequelize.ENUM('READ', 'UNREAD'),
        defaultValue: 'UNREAD',
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
    await queryInterface.dropTable('UserNotif');
  },
};
