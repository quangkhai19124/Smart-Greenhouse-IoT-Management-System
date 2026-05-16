// // routes/sensorDataRoutes.js
import express from 'express';

import sensorDataController from '../controller/sensorDataController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();
export default function initApiIotRoute(app) {
  // Check user has been already login
  router.use(JWTAction.checkUserJWT);

  // Get new feed name for device
  /**
 * @swagger
 * /api/v1/sensor/getNewSensorFeedName:
 *   get:
 *     summary: Lấy tên feed mới cho sensor (dùng khi tạo sensor mới)
 *     tags: [Sensor]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tên feed mới được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   example: "Get feed name success"
 *                 EC:
 *                   type: integer
 *                   example: 0
 *                 DT:
 *                   type: string
 *                   example: "feed_dht20humi"
 */
  router.get('/getNewSensorFeedName', JWTAction.checkPermission(['user', 'admin']), sensorDataController.getNewSensorFeedName);

  // Create a new Sensor
  /**
   * @swagger
   * /api/v1/sensor/createSensor:
   *   post:
   *     summary: Tạo mới một sensor
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - sensorName
   *               - name
   *             properties:
   *               sensorName:
   *                 type: string
   *                 example: "dht20humi"
   *               name:
   *                 type: string
   *                 example: "humidity"
   *               description:
   *                 type: string
   *                 example: "Cảm biến độ ẩm môi trường"
   *               status:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Kết quả tạo sensor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                 EC:
   *                   type: integer
   *                 DT:
   *                   type: string
   */
  router.post('/createSensor', JWTAction.checkPermission(['admin']), sensorDataController.createSensor);
  // Lấy tất cả sensor
  /**
   * @swagger
   * /api/v1/sensor/getAllSensor:
   *   get:
   *     summary: Lấy danh sách tất cả sensor
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Danh sách các sensor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                 EC:
   *                   type: integer
   *                 DT:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                       sensorName:
   *                         type: string
   *                       name:
   *                         type: string
   *                       description:
   *                         type: string
   *                       status:
   *                         type: boolean
   */

  router.get('/getAllSensor', JWTAction.checkPermission(['user', 'admin']), sensorDataController.getAllSensor);

  // Update information sensor
  /**
   * @swagger
   * /api/v1/sensor/updateSensorInfor:
   *   put:
   *     summary: Cập nhật thông tin sensor
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
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
   *                 example: 1
   *               sensorName:
   *                 type: string
   *                 example: "dht20humi"
   *               name:
   *                 type: string
   *                 example: "humidity"
   *               description:
   *                 type: string
   *                 example: "Cảm biến đo độ ẩm"
   *               status:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Kết quả cập nhật
   */
  router.put('/updateSensorInfor', JWTAction.checkPermission(['admin']), sensorDataController.updateSensorInfor);

  // Delete sensor
  /**
   * @swagger
   * /api/v1/sensor/deleteSensor:
   *   delete:
   *     summary: Xóa một sensor theo ID
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
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
   *                 example: 3
   *     responses:
   *       200:
   *         description: Kết quả xóa sensor
   */
  router.delete('/deleteSensor', JWTAction.checkPermission(['admin']), sensorDataController.deleteSensor);

  // Get max min average
  /**
   * @swagger
   * /api/v1/sensor/maxminaverageSensor:
   *   get:
   *     summary: Lấy giá trị lớn nhất, nhỏ nhất và trung bình của sensor trong khoảng thời gian
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: ID của sensor
   *       - in: query
   *         name: timeStart
   *         schema:
   *           type: string
   *           example: "2025-10-01 00:00:00"
   *       - in: query
   *         name: timeEnd
   *         schema:
   *           type: string
   *           example: "2025-10-07 23:59:59"
   *     responses:
   *       200:
   *         description: Thống kê sensor trong khoảng thời gian
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                 EC:
   *                   type: integer
   *                 DT:
   *                   type: object
   *                   properties:
   *                     sensorName:
   *                       type: string
   *                     name:
   *                       type: string
   *                     description:
   *                       type: string
   *                     maxValue:
   *                       type: number
   *                     minValue:
   *                       type: number
   *                     avgValue:
   *                       type: number
   */

  router.get('/maxminaverageSensor', JWTAction.checkPermission(['user', 'admin']), sensorDataController.getMaxMinAverageSensor)

  /**
   * @swagger
   * /api/v1/sensor/getSensorLogs:
   *   get:
   *     summary: Lấy log dữ liệu cảm biến trong khoảng thời gian có phân trang
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: sensorId
   *         required: true
   *         schema:
   *           type: integer
   *         description: ID của sensor
   *       - in: query
   *         name: timeStart
   *         required: true
   *         schema:
   *           type: string
   *           example: "2025-10-15 00:00:00"
   *         description: Thời gian bắt đầu
   *       - in: query
   *         name: timeEnd
   *         required: true
   *         schema:
   *           type: string
   *           example: "2025-10-21 23:59:59"
   *         description: Thời gian kết thúc
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           example: 1
   *         description: Trang hiện tại (mặc định = 1)
   *     responses:
   *       200:
   *         description: Danh sách log cảm biến có phân trang
   */
  router.get('/getSensorLogs', JWTAction.checkPermission(['admin', 'user']), sensorDataController.getSensorLogs);
  /**
   * @swagger
   * /api/v1/sensor/getDailyTime:
   *   get:
   *     summary: Lấy giá trị trung bình mỗi ngày của sensor trong khoảng thời gian
   *     tags: [Sensor]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: sensorId
   *         required: true
   *         schema:
   *           type: integer
   *       - in: query
   *         name: timeStart
   *         required: true
   *         schema:
   *           type: string
   *           example: "2025-10-15 00:00:00"
   *       - in: query
   *         name: timeEnd
   *         required: true
   *         schema:
   *           type: string
   *           example: "2025-10-21 23:59:59"
   *     responses:
   *       200:
   *         description: Trung bình mỗi ngày của sensor
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                 EC:
   *                   type: integer
   *                 DT:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       date:
   *                         type: string
   *                         example: "2025-10-02"
   *                       averageValue:
   *                         type: number
   *                         example: 25.63
   */
  router.get('/getDailyTime', JWTAction.checkPermission(['admin', 'user']), sensorDataController.getDailyTime);

  return app.use('/api/v1/sensor', router);
}
