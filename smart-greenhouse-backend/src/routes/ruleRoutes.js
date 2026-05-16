// // routes/sensorDataRoutes.js
import express from 'express';

import ruleController from '../controller/ruleController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiRuleRoute(app) {
    // Check user has been already login
    router.use(JWTAction.checkUserJWT);
    /**
     * @swagger
     * /api/v1/rule/deleteRule:
     *   delete:
     *     summary: Delete rule by ID
     *     tags: [Rule]
     *     description: Xóa một rule điều khiển theo ID (chỉ cho phép admin hoặc user có quyền).
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
     *               id:
     *                 type: integer
     *                 example: 5
     *                 description: "ID của rule cần xóa"
     *     responses:
     *       200:
     *         description: Delete rule success
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
     *                   example: "Delete rule success"
     *                 DT:
     *                   type: string
     *                   example: ""
     *       404:
     *         description: Rule not found
     *       500:
     *         description: Internal server error
     */
    router.delete('/deleteRule', JWTAction.checkPermission(['user', 'admin']), ruleController.deleteRule);
    return app.use('/api/v1/rule', router);
}
