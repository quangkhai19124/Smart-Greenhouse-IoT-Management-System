'use strict';
module.exports = {
  async up(queryInterface) {

    const formatTime = (date) =>
      date.toTimeString().split(' ')[0]; // 'HH:MM:SS'

    const now = new Date();

    await queryInterface.bulkInsert('Schedule', [
      {
        id: 1,
        dev_Id: 1,
        timeStart: formatTime(now),
        timeEnd: formatTime(new Date(now.getTime() + 60 * 60 * 1000)),
        status: 'ACTIVE',
        power: 100,
        actionDay: "Tuesday",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        dev_Id: 2,
        timeStart: formatTime(now),
        timeEnd: formatTime(new Date(now.getTime() + 60 * 60 * 1000)),
        status: 'ACTIVE',
        power: 100,
        actionDay: ["Monday", "Wednesday", "Friday"].toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        dev_Id: 1,
        timeStart: formatTime(now),
        timeEnd: formatTime(new Date(now.getTime() + 60 * 60 * 1000)),
        status: 'ACTIVE',
        power: 100,
        actionDay: ["Monday", "Wednesday", "Friday"].toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      ,
      {
        id: 4,
        dev_Id: 1,
        timeStart: formatTime(now),
        timeEnd: formatTime(new Date(now.getTime() + 60 * 60 * 1000)),
        status: 'ACTIVE',
        power: 100,
        actionDay: ["Monday", "Friday", "Sunday"].toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]);
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('Schedule', null, {});
  },
};

