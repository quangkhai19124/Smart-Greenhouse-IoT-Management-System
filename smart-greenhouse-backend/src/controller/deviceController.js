import { Chat } from '@google/genai';
import DeviceService from '../service/deviceService.js';
import MqttService from '../service/mqttService.js';
import deviceService from '../service/deviceService.js';

const getNewDeviceFeedName = async (req, res) => {
  try {
    const result = await MqttService.getNewDeviceFeedName();
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in getNewDeviceFeedName: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
};

const getAllDevice = async (req, res) => {
  try {
    let devices = await DeviceService.getAllDevice();
    return res.status(200).json(devices);
  } catch (e) {
    console.log('Check error in getAllDevice: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: [],
    });
  }
}
const toggleDevice = async (req, res) => {
  try {
    if (!req.query || !req.query.id) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    let toggle = await DeviceService.toggleDeviceService(req.query.id);
    return res.status(200).json(toggle);
  }
  catch (e) {
    console.log('Check error in toggleDevice: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: [],
    });
  }
}
const getExacDeviceInfor = async (req, res) => {
  try {
    if (!req.query || !req.query.id) {
      return res.status(500).json({
        EM: 'Missing required parameter1',
        EC: 1,
        DT: '',
      });
    }
    let deviceIinfo = await DeviceService.getExacDeviceInforService(req.query.id);
    return res.status(200).json(deviceIinfo);
  }
  catch (e) {
    console.log('Check error in getExacDeviceInfor: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: [],
    });
  }
}
const changeMode = async (req, res) => {
  try {
    if (!req.body || !req.body.mode || !req.body.id) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    let change = await DeviceService.changeModeService(req.body.mode, req.body.id);
    return res.status(200).json(change);
  }
  catch (e) {
    console.log('Check error in changeMode: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: [],
    });
  }
}
const deleteScheduleDevice = async (req, res) => {
  try {
    if (!req.body || !req.body.mode || !req.body.id) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    let schedule = await DeviceService.deleteScheduleDevice(req.body.mode, req.body.id);
    return res.status(200).json(schedule);
  }
  catch (e) {
    console.log('Check error in deleteScheduleDevice: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: [],
    });
  }
}
const createNewDevice = async (req, res) => {
  try {
    if (!req.body || !req.body.adaDevName || !req.body.description || !req.body.deviceName) {
      return res.status(400).json({
        EC: 1,
        EM: 'Missing required parameter',
        DT: ''
      });
    }
    let device = await DeviceService.createNewDeviceService(req.body);
    return res.status(200).json({
      EM: device.EM,
      EC: device.EC,
      DT: device.DT
    });
  }
  catch (e) {
    console.log('Error in create new device: ', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: ''
    })
  }
}
const editDeviceInfor = async (req, res) => {
  try {
    if (!req.body || (!req.body.id && !req.body.adaDevName)) {
      return res.status(400).json({
        EM: 'Missing required parameter: id or adaDevName',
        EC: 1,
        DT: '',
      });
    }
    const result = await DeviceService.updateDeviceInforService(req.body);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (e) {
    console.error('❌ Error editDeviceInfor:', e);
    return res.status(500).json({
      EM: 'Error in server',
      EC: -1,
      DT: '',
    });
  }
}
const deleteDevice = async (req, res) => {
  try {
    if (!req.body || !req.body.adaDevName) {
      return res.status(200).json({
        EM: "Missing required parameter",
        EC: 1,
        DT: '',
      });
    }
    const result = await DeviceService.deleteDeviceService(req.body.adaDevName);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.log('Error in deleteDevice: ', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: '-1',
      DT: '',
    });
  }
}
const getDeviceLogs = async (req, res) => {
  try {
    if (!req.query || !req.query.dev_Id || !req.query.timeStart || !req.query.timeEnd) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    const pageNumber = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (pageNumber - 1) * limit;

    const result = await DeviceService.getDeviceLogsService(req.query.dev_Id, limit, offset, req.query.timeStart, req.query.timeEnd);

    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  } catch (err) {
    console.error('❌ Error in getDeviceLogs:', err);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: '',
    });
  }
};
const getDeviceStatusPowerRuntimeCurrent = async (req, res) => {
  try {
    if (!req.query || !req.query.id) {
      return res.status(200).json({
        EM: 'Missing required parameter',
        EC: 1,
        DT: '',
      });
    }
    let result = await deviceService.getDeviceStaPowRunCurService(req.query.id);
    return res.status(200).json({
      EM: result.EM,
      EC: result.EC,
      DT: result.DT,
    });
  }
  catch (e) {
    console.error('❌ Error in getDeviceStatusPowerRuntime:', e);
    return res.status(500).json({
      EM: 'Error from server',
      EC: -1,
      DT: '',
    });
  }
}
const getDeviceOnOffStats = async (req, res) => {
  try {
    const { id, timeStart, timeEnd } = req.query;
    if (!id || !timeStart || !timeEnd) {
      return res.status(200).json({
        EM: "Missing required parameters",
        EC: 1,
        DT: ""
      });
    }

    const result = await deviceService.getDeviceOnOffStatsService(id, timeStart, timeEnd);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error getDeviceOnOffStats:", err);
    return res.status(500).json({
      EM: "Error from server",
      EC: -1,
      DT: ""
    });
  }
};

export default {
  getAllDevice, toggleDevice, getExacDeviceInfor, changeMode, deleteScheduleDevice,
  createNewDevice, editDeviceInfor, deleteDevice, getNewDeviceFeedName,
  getDeviceLogs, getDeviceStatusPowerRuntimeCurrent, getDeviceOnOffStats
};
