'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('setRule', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      power: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('ON', 'OFF'),
        allowNull: false,
        defaultValue: 'OFF',
      },
      emailNotification: {
        type: Sequelize.ENUM('ON', 'OFF'),
        defaultValue: 'OFF',
        allowNull: false,
      },
      dev_Id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Device', // phải đúng tên bảng Device
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
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

  async down(queryInterface, Sequelize) {
    // ✅ Xóa ENUM an toàn khi rollback (tránh lỗi "TYPE doesn't exist")
    await queryInterface.dropTable('setRule');
    if (queryInterface.sequelize.options.dialect === 'mysql') {
      await queryInterface.sequelize.query('DROP TABLE IF EXISTS `setRule`;');
    } else {
      await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_setRule_status";');
    }
  },
};
