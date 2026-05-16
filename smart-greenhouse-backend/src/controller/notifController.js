import notifService from '../service/notificationService';

const getNotif = async (req, res) => {
    try {
        const user = req.user;
        let notifs = await notifService.getNotif(user.email);
        return res.status(200).json(notifs);
    }
    catch (e) {
        console.log('Check error in getNotif: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

const markAsRead = async (req, res) => {
    try {
        const user = req.user;
        let result = await notifService.markNotifAsRead(user.email, req.body.notifID);
        return res.status(200).json(result);
    }
    catch (e) {
        console.log('Check error in markAsRead: ', e);
        return res.status(500).json({
            EM: 'Error from server',
            EC: -1,
            DT: [],
        });
    }
}

export default {
    getNotif,
    markAsRead
};
