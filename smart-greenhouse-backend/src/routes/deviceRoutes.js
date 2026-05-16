import express from 'express';

import deviceController from '../controller/deviceController.js';
import JWTAction from '../middleware/JWTAction.js';
const router = express.Router();

export default function initApiIotRoute(app) {
  router.use(JWTAction.checkUserJWT);
  /**
   * @swagger
   * tags:
   *   name: Device
   *   description: Device management
   */

  // Get new feed name for device
  /**
   * @swagger
   * /api/v1/device/getNewDeviceFeedName:
   *   get:
   *     tags:
   *       - Device
   *     summary: Get new feed name for device
   *     responses:
   *       200:
   *         description: Success
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Get new device feed name successfully
   *                 EC:
   *                   type: integer
   *                   example: 0
   *                 DT:
   *                   type: string
   *                   example: new_device_feed_12345
   *       500:
   *         description: Server Error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Error from server
   *                 EC:
   *                   type: integer
   *                   example: -1
   *                 DT:
   *                   type: array
   *                   items: []
   */
  router.get('/getNewDeviceFeedName', JWTAction.checkPermission(['user', 'admin']), deviceController.getNewDeviceFeedName);

  // Get all Device
  /**
    * @swagger
    * /api/v1/device/getAllDevice:
    *   get:
    *     summary: Get all devices (with optional pagination)
    *     tags: [Device]
    *     security:
    *       - BearerAuth: []
    *     parameters:
    *       - in: query
    *         name: page
    *         schema:
    *           type: integer
    *         description: Page number
    *         example: 1
    *       - in: query
    *         name: limit
    *         schema:
    *           type: integer
    *         description: Items per page
    *         example: 10
    *     responses:
    *       200:
    *         description: List of all devices
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
    *                       deviceName:
    *                         type: string
    *                       status:
    *                         type: string
    *                       mode:
    *                         type: string
    *                       description:
    *                         type: string
    *       500:
    *         description: Server error
    */
  router.get('/getAllDevice', JWTAction.checkPermission(['user', 'admin']), deviceController.getAllDevice);

  /**
   * @swagger
   * /api/v1/device/toggleDevice:
   *   put:
   *     summary: Toggle device status (Manual Mode)
   *     description: >
   *       Bật hoặc tắt thiết bị theo **chế độ thủ công (MANUAL)**.  
   *       - Chỉ người dùng có quyền `user` hoặc `admin` mới được phép.  
   *       - Nếu thiết bị đang ON thì chuyển sang OFF, ngược lại sẽ bật.  
   *       - Gửi tín hiệu MQTT đến Adafruit IO và lưu log vào DB.
   *     tags:
   *       - Device
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         description: ID của thiết bị cần bật/tắt
   *         schema:
   *           type: integer
   *           example: 1
   *     responses:
   *       200:
   *         description: Kết quả bật/tắt thiết bị
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Device "Lamp 1" turned OFF
   *                 EC:
   *                   type: integer
   *                   example: 0
   *                 DT:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     status:
   *                       type: string
   *                       example: OFF
   *       400:
   *         description: Thiếu tham số id
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Missing required parameter
   *                 EC:
   *                   type: integer
   *                   example: 1
   *                 DT:
   *                   type: string
   *                   example: ''
   *       403:
   *         description: Không có quyền điều khiển (mode != MANUAL)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Mode do not have permission to control device
   *                 EC:
   *                   type: integer
   *                   example: 1
   *                 DT:
   *                   type: string
   *                   example: ''
   *       404:
   *         description: Không tìm thấy thiết bị
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Can not find device with deviceId
   *                 EC:
   *                   type: integer
   *                   example: 1
   *                 DT:
   *                   type: string
   *                   example: ''
   *       500:
   *         description: Lỗi server nội bộ
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Error from server
   *                 EC:
   *                   type: integer
   *                   example: -1
   *                 DT:
   *                   type: array
   *                   items: {}
   */
  router.put('/toggleDevice', JWTAction.checkPermission(['user', 'admin']), deviceController.toggleDevice);

  /**
   * @swagger
   * /api/v1/device/getExacDeviceInfor:
   *   get:
   *     summary: Get detailed information of a specific device
   *     tags: [Device]
   *     description: Trả về thông tin chi tiết của thiết bị bao gồm cơ chế điều khiển, danh sách luật bật/tắt, các lịch trình và trạng thái AI.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         description: ID của thiết bị cần lấy thông tin
   *         schema:
   *           type: object
   *           properties:
   *             id:
   *               type: integer
   *               format: int32
   *               example: 1
   *     responses:
   *       200:
   *         description: Device information retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Get device info successfully
   *                 EC:
   *                   type: integer
   *                   example: 0
   *                 DT:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     deviceName:
   *                       type: string
   *                       example: May bom 1
   *                     status:
   *                       type: string
   *                       enum: [ON, OFF]
   *                       example: ON
   *                     mode:
   *                       type: string
   *                       enum: [MANUAL, AUTO, AI_POWERED, SCHEDULE]
   *                       example: AUTO
   *                     isAIPowered:
   *                       type: boolean
   *                       example: false
   *                     setRules:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           power:
   *                             type: number
   *                             example: 100
   *                           status:
   *                             type: string
   *                             enum: [ON, OFF]
   *                             example: ON
   *                           rules:
   *                             type: array
   *                             items:
   *                               type: object
   *                               properties:
   *                                 id:
   *                                   type: integer
   *                                   example: 5
   *                                 operator:
   *                                   type: string
   *                                   example: ">"
   *                                 condition:
   *                                   type: string
   *                                   example: "temp > 35"
   *                                 action:
   *                                   type: string
   *                                   example: "OFF"
   *                     schedules:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 3
   *                           timeStart:
   *                             type: string
   *                             example: "06:00"
   *                           timeEnd:
   *                             type: string
   *                             example: "07:00"
   *                           actionDay:
   *                             type: string
   *                             example: "Mon,Wed"
   *                           status:
   *                             type: string
   *                             example: "ACTIVE"
   *                           power:
   *                             type: number
   *                             example: 80
   *       400:
   *         description: Missing or invalid deviceId
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Device not found
   *       500:
   *         description: Internal server error
   */
  router.get('/getExacDeviceInfor', JWTAction.checkPermission(['user', 'admin']), deviceController.getExacDeviceInfor);
  /**
   * @swagger
   *  /api/v1/device/changeMode:
   *   put:
   *     summary: Thay đổi chế độ hoạt động của thiết bị
   *     description: 
   *       API cho phép người dùng (role = `user` hoặc `admin`) thay đổi chế độ điều khiển của thiết bị như MANUAL, AUTO, SCHEDULE hoặc AI_POWERED.  
   *       Khi đổi mode, hệ thống sẽ tự động dừng các listener cũ (AUTO, SCHEDULE) và cập nhật MQTT tương ứng.
   *     tags:
   *       - Device
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
   *               - mode
   *             properties:
   *               id:
   *                 type: integer
   *                 example: 1
   *                 description: ID của thiết bị cần thay đổi chế độ
   *               mode:
   *                 type: string
   *                 enum: [MANUAL, AUTO, SCHEDULE, AI_POWERED]
   *                 example: MANUAL
   *                 description: Chế độ mới cần chuyển sang
   *     responses:
   *       200:
   *         description: Kết quả thay đổi chế độ thiết bị
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EC:
   *                   type: integer
   *                   description: Mã lỗi (0 = thành công)
   *                   example: 0
   *                 EM:
   *                   type: string
   *                   description: Thông báo kết quả
   *                   example: "Đã chuyển sang chế độ MANUAL"
   *                 DT:
   *                   type: object
   *                   description: Thông tin thiết bị sau khi thay đổi
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     deviceName:
   *                       type: string
   *                       example: "Máy bơm nước 1"
   *                     mode:
   *                       type: string
   *                       example: "MANUAL"
   *                     status:
   *                       type: string
   *                       example: "OFF"
   *       400:
   *         description: Thiếu tham số hoặc dữ liệu không hợp lệ
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EC:
   *                   type: integer
   *                   example: 1
   *                 EM:
   *                   type: string
   *                   example: "Missing required parameter"
   *       500:
   *         description: Lỗi từ server
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
   *                   example: "Error from server"
   */
  router.put('/changeMode', JWTAction.checkPermission(['user', 'admin']), deviceController.changeMode);

  /**
   * @swagger
   * /api/v1/device/deleteScheduleDevice:
   *   delete:
   *     summary: Delete schedule of device (manual mode only)
   *     tags: [Device]
   *     description: Xóa lịch (Schedule) của thiết bị. Chỉ cho phép khi thiết bị đang ở chế độ MANUAL.
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: body
   *         name: body
   *         required: true
   *         schema:
   *           type: object
   *           required:
   *             - id
   *             - mode
   *           properties:
   *               mode:
   *                 type: string
   *                 enum: [MANUAL, AUTO, SCHEDULE, AI_POWERED]
   *                 example: AUTO
   *                 description: "Chế độ hiện tại của thiết bị"
   *               id:
   *                 type: integer
   *                 example: 1
   *                 description: "ID của thiết bị cần xóa"
   *     responses:
   *       200:
   *         description: Delete schedule success
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
   *                   example: "Delete schedule success"
   *                 DT:
   *                   type: string
   *                   example: ""
   *       403:
   *         description: Mode is not MANUAL
   *       404:
   *         description: Schedule not found
   *       500:
   *         description: Internal server error
   */
  router.delete('/deleteScheduleDevice', JWTAction.checkPermission(['user', 'admin']), deviceController.deleteScheduleDevice);

  /**
   * @swagger
   * /api/v1/device/createNewDevice:
   *   post:
   *     summary: Create a new device
   *     description: API for adding a new IoT device to the system.
   *     tags: [Device]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: body
   *         schema:
   *           type: object
   *           properties:
   *               adaDevName:
   *                 type: string
   *                 description: Adafruit Device ID
   *                 example: "Adafruit_TempSensor01"
   *               deviceName:
   *                 type: string
   *                 description: The name of the device
   *                 example: "Temperature Sensor"
   *               description:
   *                 type: string
   *                 description: Description of the device
   *                 example: "Monitor greenhouse temperature"
   *               status:
   *                 type: string
   *                 enum: [ON, OFF]
   *                 description: Device display status on dashboard
   *                 example: "ON"
   *               mode:
   *                 type: string
   *                 enum: [MANUAL, AUTO, AI_POWERED, SCHEDULE]
   *                 description: Device control mode
   *                 example: "AUTO"
   *     responses:
   *       200:
   *         description: Device created successfully
   *         content:
   *           application/json:
   *             example:
   *               EC: 0
   *               EM: "Device created successfully"
   *               DT:
   *                 id: 12
   *                 adaDevName: "Adafruit_TempSensor01"
   *                 deviceName: "Temperature Sensor"
   *                 description: "Monitor greenhouse temperature"
   *                 status: "ON"
   *                 mode: "AUTO"
   *       400:
   *         description: Missing required field or invalid input
   *         content:
   *           application/json:
   *             example:
   *               EC: -1
   *               EM: "Missing required field: deviceName"
   *       409:
   *         description: Device with same Adafruit ID already exists
   *         content:
   *           application/json:
   *             example:
   *               EC: -1
   *               EM: "Device with this Adafruit ID already exists"
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               EC: -1
   *               EM: "Internal server error"
   */
  router.post('/createNewDevice', JWTAction.checkPermission(['admin']), deviceController.createNewDevice)

  /**
   * @swagger
   * /api/v1/device/editDeviceInfor:
   *   put:
   *     summary: Update device information
   *     description: Update existing device details such as name, description, and status by Adafruit Device ID.
   *     tags: [Device]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: body
   *         schema:
   *             type: object
   *             required:
   *               - adaDevName
   *             properties:
   *               adaDevName:
   *                 type: string
   *                 description: Adafruit Device ID (used as the identifier for updating)
   *                 example: "Adafruit_TempSensor01"
   *               deviceName:
   *                 type: string
   *                 description: The updated device name
   *                 example: "Updated Temperature Sensor"
   *               description:
   *                 type: string
   *                 description: Description of the device
   *                 example: "Updated description for greenhouse temperature sensor"
   *               status:
   *                 type: string
   *                 enum: [ON, OFF]
   *                 description: Whether the device should be shown on the dashboard
   *                 example: "OFF"
   *     responses:
   *       200:
   *         description: Device update result
   *         content:
   *           application/json:
   *             examples:
   *               success:
   *                 summary: Update successful
   *                 value:
   *                   EC: 0
   *                   EM: "Update success"
   *                   DT: ""
   *               notFound:
   *                 summary: Device not found
   *                 value:
   *                   EC: 2
   *                   EM: "Update device error. Not found device"
   *                   DT: ""
   *               missingParam:
   *                 summary: Missing required parameter
   *                 value:
   *                   EC: 1
   *                   EM: "Missing required parameter"
   *                   DT: ""
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               EC: -1
   *               EM: "Error updateDeviceInforService"
   *               DT: ""
   */
  router.put('/editDeviceInfor', JWTAction.checkPermission(['admin']), deviceController.editDeviceInfor)

  // Xóa device
  /**
   * @swagger
   * /api/v1/device/deleteDevice:
   *   delete:
   *     summary: Delete a device (admin only)
   *     description: Permanently remove a device from the system by its adaDevName. Only admin users can perform this action.
   *     tags: [Device]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: body
   *         name: adaDevName
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *               adaDevName:
   *                 type: string
   *                 example: "Adafruit_TempSensor01"
   *     responses:
   *       200:
   *         description: Deletion result
   *         content:
   *           application/json:
   *             examples:
   *               success:
   *                 summary: Device deleted successfully
   *                 value:
   *                   EC: 0
   *                   EM: "Delete device success"
   *                   DT: ""
   *               notFound:
   *                 summary: Device not found
   *                 value:
   *                   EC: 2
   *                   EM: "Device is not exist"
   *                   DT: ""
   *               missingParam:
   *                 summary: Missing required parameter
   *                 value:
   *                   EC: 1
   *                   EM: "Missing required parameter"
   *                   DT: ""
   *       403:
   *         description: Forbidden — admin access required
   *         content:
   *           application/json:
   *             example:
   *               EC: 3
   *               EM: "Permission denied"
   *               DT: ""
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             example:
   *               EC: -1
   *               EM: "Error from server"
   *               DT: ""
   */
  router.delete('/deleteDevice', JWTAction.checkPermission(['admin']), deviceController.deleteDevice);
  /**
 * @swagger
 * /api/v1/device/getDeviceLogs:
 *   get:
 *     summary: Lấy danh sách log của thiết bị trong khoảng thời gian
 *     description: Trả về danh sách log (bật/tắt, mô tả, thời gian) của thiết bị kèm phân trang.
 *     tags: [Device]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dev_Id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thiết bị
 *       - in: query
 *         name: timeStart
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Thời gian bắt đầu (ISO 8601)
 *       - in: query
 *         name: timeEnd
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Thời gian kết thúc (ISO 8601)
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang (pagination)
 *     responses:
 *       200:
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 EM:
 *                   type: string
 *                   example: Get device log success
 *                 EC:
 *                   type: integer
 *                   example: 0
 *                 DT:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           dev_Id:
 *                             type: integer
 *                             example: 1
 *                           time:
 *                             type: string
 *                             example: "2025-11-02T09:00:00Z"
 *                           description:
 *                             type: string
 *                             example: "Device turned ON"
 *                     totalRecords:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 2
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 */
  router.get('/getDeviceLogs', JWTAction.checkPermission(['admin', 'user']), deviceController.getDeviceLogs);
  /**
   * @swagger
   * /api/v1/device/getDeviceStatusPowerRuntime:
   *   get:
   *     summary: Lấy trạng thái, công suất và thời điểm hoạt động gần nhất của thiết bị
   *     description: Trả về thông tin trạng thái hiện tại (ON/OFF), công suất và log thời gian gần nhất khi thiết bị bật.
   *     tags: [Device]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của thiết bị
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Get device status successfully
   *                 EC:
   *                   type: integer
   *                   example: 0
   *                 DT:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: integer
   *                       example: 1
   *                     deviceName:
   *                       type: string
   *                       example: "Máy bơm 1"
   *                     adaDevName:
   *                       type: string
   *                       example: "switch"
   *                     status:
   *                       type: string
   *                       enum: [ON, OFF]
   *                       example: "ON"
   *                     power:
   *                       type: string
   *                       example: "100"
   *                     runtimeLog:
   *                       type: string
   *                       format: date-time
   *                       example: "2025-11-02T10:10:07Z"
   */

  router.get('/getDeviceStatusPowerRuntime', JWTAction.checkPermission(['admin', 'user']), deviceController.getDeviceStatusPowerRuntimeCurrent);
  /**
   * @swagger
   * /api/v1/device/getDeviceOnOffStats:
   *   get:
   *     summary: Lấy thống kê số lần bật/tắt của thiết bị theo ngày
   *     description: Trả về số lần ON/OFF của thiết bị trong mỗi ngày của khoảng thời gian. Nếu ngày nào không có dữ liệu thì giá trị sẽ là null.
   *     tags: [Device]
   *     security:
   *       - BearerAuth: []
   *     parameters:
   *       - in: query
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID của thiết bị
   *       - in: query
   *         name: timeStart
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Ngày bắt đầu (yyyy-MM-dd)
   *       - in: query
   *         name: timeEnd
   *         required: true
   *         schema:
   *           type: string
   *           format: date
   *         description: Ngày kết thúc (yyyy-MM-dd)
   *     responses:
   *       200:
   *         description: Thành công
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 EM:
   *                   type: string
   *                   example: Get ON/OFF stats successfully
   *                 EC:
   *                   type: integer
   *                   example: 0
   *                 DT:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       date:
   *                         type: string
   *                         example: "2025-11-01"
   *                       onCount:
   *                         type: integer
   *                         nullable: true
   *                         example: 3
   *                       offCount:
   *                         type: integer
   *                         nullable: true
   *                         example: 2
   */
  router.get('/getDeviceOnOffStats', JWTAction.checkPermission(['admin', 'user']), deviceController.getDeviceOnOffStats);


  return app.use('/api/v1/device', router);
}
