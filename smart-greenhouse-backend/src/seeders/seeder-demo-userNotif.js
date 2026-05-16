'use strict';
module.exports = {
    async up(queryInterface) {
        await queryInterface.bulkInsert('UserNotif', [
            { id: 1, userID: 1, notifID: 1, status: "UNREAD", createdAt: new Date(), updatedAt: new Date() },
            { id: 2, userID: 1, notifID: 2, status: "UNREAD", createdAt: new Date(), updatedAt: new Date() },
            { id: 3, userID: 2, notifID: 1, status: "UNREAD", createdAt: new Date(), updatedAt: new Date() },
            { id: 4, userID: 2, notifID: 2, status: "UNREAD", createdAt: new Date(), updatedAt: new Date() },
        ]);
    },
    async down(queryInterface) {
        await queryInterface.bulkDelete('UserNotif', null, {});
    },
};
