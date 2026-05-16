import express from 'express';

import notifController from '../controller/notifController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiNotifRoute(app) {
    // Check user has been already login
    router.use(JWTAction.checkUserJWT);
    /**
     * @swagger
     * /api/v1/notif/getNotif:
     *   get:
     *     summary: Get notifications
     *     tags: [Notification]
     *     description: Lấy danh sách thông báo của người dùng.
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Get notifications success
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 EC:
     *                   type: integer
     *                   example: 0
     *                 EM:
     *                   type: string
     *                   example: "Get notifications success"
     *                 DT:
     *                   type: string
     *                   example: ""
     *       404:
     *         description: Notification not found
     *       500:
     *         description: Internal server error
     */
    router.get('/getNotif', JWTAction.checkPermission(['user', 'admin']), notifController.getNotif);

    /** 
     * @swagger
     * /api/v1/notif/markAsRead:
     *   post:
     *     summary: Mark notification as read
     *     tags: [Notification]
     *     description: Đánh dấu thông báo là đã đọc.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - notifID
     *             properties:
     *               notifID:
     *                 type: integer
     *                 example: 1
     *     responses:
     *       200:
     *         description: Notification marked as read successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 EC:
     *                   type: integer
     *                   example: 0
     *                 EM:
     *                   type: string
     *                   example: "Notification marked as read"
     *                 DT:
     *                   type: object
     *       500:
     *         description: Internal server error
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 EC:
     *                   type: integer
     *                   example: -1
     *                 EM:
     *                   type: string
     *                   example: "Server error"
     *                 DT:
     *                   type: null
     */

    router.post('/markAsRead', JWTAction.checkPermission(['user', 'admin']), notifController.markAsRead);
    return app.use('/api/v1/notif', router);
}
