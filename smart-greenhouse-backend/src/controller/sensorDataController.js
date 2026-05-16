import mqttService from '../service/mqttService.js';
import MqttService from '../service/mqttService.js';

const getNewSensorFeedName = async (req, res) => {
  try {
    const result = await MqttService.getNewSensorFeedName();
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in getNewSensorFeedName: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};

const createSensor = async (req, res) => {
  try {
    if (!req.body || !req.body.sensorName || !req.body.name) {
      return res.status(200).json({
        EM: 'Missing sensorName(VD: dht20humi) or name (VD: humidity)',
        EC: 1,
        DT: '',
      });
    }
    const result = await MqttService.createSensorService(req.body);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in createSensor: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const getAllSensor = async (req, res) => {
  try {
    console.log('Check check in getAllSensor');
    const result = await MqttService.getAllSensorService();
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in getAllSensor: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};

const updateSensorInfor = async (req, res) => {
  try {
    const result = await MqttService.updateSensorInforService(req.body);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in updateSensorInfor: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const deleteSensor = async (req, res) => {
  try {
    if (!req.body || !req.body.id) {
      return res.status(200).json({
        EM: 'Missing required parameters',
        EC: 1,
        DT: '',
      });
    }
    const result = await MqttService.deleteSensorService(req.body.id);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in deleteSensor: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};
const getMaxMinAverageSensor = async (req, res) => {
  try {
    if (!req.query || !req.query.id || !req.query.timeStart || !req.query.timeEnd) {
      return res.status(200).json({
        EM: 'Missing required parameters',
        EC: 1,
        DT: '',
      });
    }
    if (new Date(req.query.timeStart) > req.query.timeEnd) {
      return res.status(200).json({
        EM: 'Invalid time range: start time is greater than end time',
        EC: 1,
        DT: '',
      });
    }
    let data = await MqttService.getMaxMinAverageSensorService(req.query.id, req.query.timeStart, req.query.timeEnd);
    return res.status(200).json(data);
  }
  catch (e) {
    console.log('Error in getMaxMinAverageSensor: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: '',
    });
  }
};
const getSensorLogs = async (req, res) => {
  try {
    if (!req.query || !req.query.sensorId || !req.query.timeStart || !req.query.timeEnd) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    const pageNumber = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (pageNumber - 1) * limit;

    const result = await MqttService.getSensorLogsService(req.query.sensorId, limit, offset, req.query.timeStart, req.query.timeEnd);

    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.error('❌ Error in getSensorLogs:', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: '',
    });
  }
};

const getDailyTime = async (req, res) => {
  try {
    if (!req.query || !req.query.sensorId || !req.query.timeStart || !req.query.timeEnd) {
      return res.status(200).json({
        EC: 1,
        EM: 'Missing required parameter',
        DT: '',
      });
    }
    let result = await mqttService.getDailyTimeAverageService(req.query.sensorId, req.query.timeStart, req.query.timeEnd);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  }
  catch (e) {
    console.log('Error from getDailyTime: ', e);
    return res.status(500).json({
      EC: -1,
      EM: 'Error from server.',
      DT: ''
    })
  }
}

export default {
  getNewSensorFeedName,
  deleteSensor,
  createSensor, getAllSensor,
  updateSensorInfor,
  getMaxMinAverageSensor, getSensorLogs, getDailyTime
};
