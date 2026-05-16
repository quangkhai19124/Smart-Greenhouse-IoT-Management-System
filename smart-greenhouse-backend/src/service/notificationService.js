import db from '../models/index';

const getNotif = async (email) => {
    try {
        let user = await db.Users.findOne({
            where: { email: email },
        });
        let notifs = await db.UserNotif.findAll({
            attributes: ['notifID', 'status'],
            where: { userID: user.id },
            include: [
                {
                    model: db.Notification,
                    attributes: ['title', 'message', 'createdAt'],
                },
            ],
            order: [['id', 'DESC']],
        });
        if (notifs) {
            let result = notifs.map(n => {
                return {
                    id: n.id,
                    notifID: n.notifID,
                    status: n.status,
                    content: {
                        title: n.Notification?.title,
                        message: n.Notification?.message,
                        createdAt: n.Notification?.createdAt,
                    }
                }
            });
            return {
                EM: 'Get notifications successfully',
                EC: 0,
                DT: result,
            };
        } else {
            return {
                EM: 'No notifications found',
                EC: 2,
                DT: '',
            };
        }
    } catch (e) {
        console.error('Error getNotifService:', e);
        return {
            EM: 'Error getNotifService',
            EC: 2,
            DT: '',
        };
    }
}

const markNotifAsRead = async (email, notifID) => {
    try {
        let user = await db.Users.findOne({
            where: { email: email },
        });

        let check = await db.UserNotif.findOne({
            where: { userID: user.id, notifID: notifID, status: "UNREAD" }
        })

        if (!check) {
            return {
                EM: 'Notification not found or already read',
                EC: 0,
                DT: '',
            };
        }
        let result = await db.UserNotif.update(
            { status: 'READ' },
            {
                where: {
                    userID: user.id,
                    notifID: notifID,
                },
            }
        );
        if (result) {
            return {
                EM: 'Notification marked as read',
                EC: 0,
                DT: '',
            };
        } else {
            return {
                EM: 'Notification not found or already read',
                EC: 1,
                DT: '',
            };
        }
    } catch (e) {
        console.error('Error markNotifAsReadService:', e);
        return {
            EM: 'Error markNotifAsReadService',
            EC: -1,
            DT: '',
        };
    }
}

export default {
    getNotif,
    markNotifAsRead
}
