'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Schedule', 'timeStart', {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.changeColumn('Schedule', 'timeEnd', {
      type: Sequelize.TIME,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // revert back to DATE if needed
    await queryInterface.changeColumn('Schedule', 'timeStart', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('Schedule', 'timeEnd', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};
