'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    await queryInterface.bulkInsert('Sensor', [
      {
        id: 1,
        sensorName: 'dht20humi',
        description: 'Cam bien do am',
        name: 'humidity',
        status: 'on',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        sensorName: 'soilhumi',
        description: 'Cam bien do am dat',
        name: 'soil_humidity',
        status: 'on',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 3,
        sensorName: 'lightsensor',
        description: 'Cam bien anh sang',
        name: 'lightsensor',
        status: 'on',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 4,
        sensorName: 'dht20temp',
        description: 'Cam bien nhiet do',
        name: 'dht20temp',
        status: 'on',
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Sensor', null, {});
  },
};
