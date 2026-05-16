'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('Device', [
      {
        description: 'May bom nuoc khu vuc 1',
        deviceName: 'May bom 1',
        adaDevName: 'switch',
        status: "OFF",  // "ON" || "OFF"
        mode: 'MANUAL', // "MANUAL" || "AUTO" || "AI_POWERED" || "SCHEDULE"
        createdAt: now,
        updatedAt: now,
      },
      {
        description: 'Den khu vuc 1',
        deviceName: 'Den 100W',
        adaDevName: 'switch1', // "switch1"
        status: "OFF",  // "ON" || "OFF"
        mode: 'MANUAL',
        createdAt: now,
        updatedAt: now,
      }
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Device', null, {});
  },
};
