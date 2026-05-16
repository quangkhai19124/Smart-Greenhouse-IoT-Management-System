// src/mqtt/sensorEmitter.js
import { EventEmitter } from 'events';

/**
 * sensorEmitter đóng vai trò trung gian giữa:
 *  - adaService (nơi nhận dữ liệu sensor từ MQTT)
 *  - deviceService (nơi xử lý AUTO mode)
 *
 * Khi MQTT nhận dữ liệu mới -> adaService emit 'sensorData'
 * Các device đang bật AUTO sẽ lắng nghe sự kiện này.
 */
const sensorEmitter = new EventEmitter();
sensorEmitter.setMaxListeners(50);
export default sensorEmitter;
