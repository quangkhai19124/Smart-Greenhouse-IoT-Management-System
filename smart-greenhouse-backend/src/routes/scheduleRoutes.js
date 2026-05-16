// // routes/sensorDataRoutes.js
import express from 'express';

import scheduleController from '../controller/scheduleController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiScheduleRoute(app) {
    // Check user has been already login
    router.use(JWTAction.checkUserJWT);

    /**
     * @swagger
     * /api/v1/schedule/createSchedule:
     *   post:
     *     summary: Create a new schedule for specific device.
     *     tags: [Schedule]
     *     description: "Create a new schedule for specific device."
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               dev_Id:
     *                 type: string
     *                 example: "1"
     *               power:
     *                 type: integer
     *                 example: 100
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    router.post('/createSchedule', JWTAction.checkPermission(['user', 'admin']), scheduleController.createSchedule);

    /**
     * @swagger
     * /api/v1/schedule/updateSchedule:
     *   put:
     *     tags: [Schedule]
     *     summary: Update one schedule of a device
     *     description: Update one schedule of a device by specifying both device ID and schedule ID.
     *     parameters:
     *       - in: query
     *         name: dev_Id
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID of the device
     *       - in: query
     *         name: schedId
     *         schema:
     *           type: integer
     *         required: true
     *         description: ID of the schedule to update
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               actionDay:
     *                 type: array
     *                 items:
     *                   type: string
     *                 example: ["Monday", "Wednesday", "Friday"]
     *               timeStart:
     *                 type: string
     *                 example: "10:30:00"
     *               timeEnd:
     *                 type: string
     *                 example: "11:30:00"
     *               status:
     *                 type: string
     *                 example: "INACTIVE"
     *               power:
     *                 type: string
     *                 example: 90
     *     responses:
     *       200:
     *         description: Successful operation
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 EM:
     *                   type: string
     *                   description: Message
     *                 EC:
     *                   type: integer
     *                   description: Error code
     *                 DT:
     *                   type: object
     *                   description: Data payload
     */
    router.put('/updateSchedule', JWTAction.checkPermission(['user', 'admin']), scheduleController.updateSchedule);
    
    /**
     * @swagger
     * /api/v1/schedule/deleteSchedule:
     *   delete:
     *     summary: Delete Schedule by ID
     *     tags: [Schedule]
     *     description: Xóa một schedule điều khiển theo ID.
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - id
     *             properties:
     *               schedId:
     *                 type: integer
     *                 example: 5
     *                 description: "ID của schedule cần xóa"
     *               dev_Id:
     *                 type: integer
     *                 example: 1
     *                 description: "ID của Device co schedule cần xóa"
     *     responses:
     *       200:
     *         description: Delete rule success
     *       404:
     *         description: Rule not found
     *       500:
     *         description: Internal server error
     */    
    router.delete('/deleteSchedule', JWTAction.checkPermission(['user', 'admin']), scheduleController.deleteSchedule);
    return app.use('/api/v1/schedule', router);
}
