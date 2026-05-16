import express from 'express';

import setRuleController from '../controller/setRuleController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiSetRuleRoute(app) {
    // Check user has been already login
    router.use(JWTAction.checkUserJWT);

    /**
     * @swagger
     * /api/v1/setRule/createSetRule:
     *   post:
     *     summary: Create rules of a set
     *     tags: [Set Rules]
     *     description: "Create a new set rule BEFORE add Rules."
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - status
     *               - dev_Id
     *               - setType
     *             properties:
     *               status:
     *                 type: string
     *                 enum: [ON, OFF]
     *                 example: "OFF"
     *               dev_Id:
     *                 type: integer
     *                 example: 1
     *               power:
     *                 type: integer
     *                 example: 100
     *               setType:
     *                 type: string
     *                 enum: [AUTO_CONTROL, NOTIFICATION]
     *                 example: "AUTO_CONTROL"
     *                 description: "Loại set rule: AUTO_CONTROL (điều khiển thiết bị) hoặc NOTIFICATION (thông báo)"
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    router.post('/createSetRule', JWTAction.checkPermission(['user', 'admin']), setRuleController.createSetRule);

    /**
     * @swagger
     * /api/v1/setRule/getRulesOfSet:
     *   get:
     *     summary: Get rules of set
     *     tags: [Set Rules]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: setId
     *         description: Set rule id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    router.get('/getRulesOfSet', JWTAction.checkPermission(['user', 'admin']), setRuleController.getRulesOfSet);
   
    /**
     * @swagger
     * /api/v1/setRule/updateRulesOfSet:
     *   put:
     *     summary: Update rules of a set
     *     tags: [Set Rules]
     *     description: "Update rules of a set be created. Delete all rule with same satID then create new ones."
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: query
     *         name: setID
     *         schema:
     *           type: string
     *         required: true
     *         example: "1"
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               emailNotification:
     *                 type: string
     *                 example: "ON"
     *               rules:
     *                 type: array
     *                 items:
     *                   type: object
     *                   properties:
     *                     sensorID:
     *                       type: integer
     *                       example: 1
     *                     logicOperator:
     *                       type: string
     *                       example: "AND"
     *                     operator:
     *                       type: string
     *                       example: ">"
     *                     condition:
     *                       type: integer
     *                       example: 35
     *     responses:
     *       200:
     *         description: Success
     *       401:
     *         description: Unauthorized
     */
    router.put('/updateRulesOfSet', JWTAction.checkPermission(['user', 'admin']), setRuleController.updateRulesOfSet);
    
    /**
     * @swagger
     * /api/v1/setRule/deleteSetRule:
     *   delete:
     *     summary: Delete set rule by ID
     *     tags: [Set Rules]
     *     description: Xóa một set rule theo ID
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
     *               setID:
     *                 type: integer
     *                 example: 3
     *                 description: "ID của set rule cần xóa"
     *     responses:
     *       200:
     *         description: Delete set rule success
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
     *                   example: "Delete set rule success"
     *                 DT:
     *                   type: string
     *                   example: ""
     *       404:
     *         description: Set rule not found
     *       500:
     *         description: Internal server error
     */
    router.delete('/deleteSetRule', JWTAction.checkPermission(['user', 'admin']), setRuleController.deleteSetRule);
    return app.use('/api/v1/setRule', router);
}
