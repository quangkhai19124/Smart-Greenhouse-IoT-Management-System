import express from 'express';

import sensorController from '../controller/sensorController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiSetRuleRoute(app) {
    // Check user has been already login
    router.use(JWTAction.checkUserJWT);
    // Get rules of sensor
    /**
     * @swagger
     * /api/v1/sensorNotif/getRulesOfSensor:
     *   get:
     *     tags:
     *       - Sensor Notification
     *     summary: Get rules of sensor
     *     description: Get rules of sensor
     *     parameters:
     *       - in: query
     *         name: sensorID
     *         schema:
     *           type: string
     *         required: true
     *         description: The sensor ID
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
     *                   description: Error message
     *                 EC:
     *                   type: integer
     *                   description: Error code
     *                 DT:
     *                   type: array
     */
    router.get('/getRulesOfSensor', JWTAction.checkPermission(['user', 'admin']), sensorController.getRulesOfSensorService);

    /**
     * @swagger
     * /api/v1/sensorNotif/updateRulesOfSensor:
     *   put:
     *     tags:
     *       - Sensor Notification
     *     summary: Update rules of sensor
     *     description: Update rules of sensor
     *     parameters:
     *       - in: query
     *         name: sensorID
     *         schema:
     *           type: string
     *         required: true
     *         description: The sensor ID
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               rules:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     logicOperator:
     *                       type: string
     *                     operator:
     *                       type: string
     *                     condition:
     *                       type: string
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
     *                   description: Error message
     *                 EC:
     *                   type: integer
     *                   description: Error code
     *                 DT:
     *                   type: string
     */
    router.put('/updateRulesOfSensor', JWTAction.checkPermission(['user', 'admin']), sensorController.updateSensorNotifService);
    return app.use('/api/v1/sensorNotif', router);
}
