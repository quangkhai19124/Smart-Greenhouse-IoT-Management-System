import { Model, fn, col, Op, where, literal } from 'sequelize';

import db from '../models/index.js';
import { raw } from 'body-parser';
import { unsubscribeFromFeed } from '../mqtt/adaService.js';
import moment from 'moment-timezone';

import { getDeviceFeeds, getSensorFeeds } from '../mqtt/adaService.js'

const getNewDeviceFeedName = async () => {
  let adaDevNames = [];
  adaDevNames = await db.Device.findAll({
    attributes: ['adaDevName'],
    group: ['adaDevName'],
    raw: true,
  }); ``

  const deviceFeeds = await getDeviceFeeds();

  console.log("Check check deviceFeeds: ", deviceFeeds);

  const existingNames = adaDevNames.map(d => d.adaDevName);

  const result = deviceFeeds
    .map(feed => feed.name)
    .filter(name => !existingNames.includes(name))
  return {
    EM: 'Get new device feed names successfully',
    EC: 0,
    DT: result,
  };
};

const getNewSensorFeedName = async () => {
  let sensorName = [];
  sensorName = await db.Sensor.findAll({
    attributes: ['sensorName'],
    group: ['sensorName'],
    raw: true,
  }); ``

  const sensorFeeds = await getSensorFeeds();

  const existingNames = sensorName.map(d => d.sensorName);

  const result = sensorFeeds
    .map(feed => feed.name)
    .filter(name => !existingNames.includes(name))
  return {
    EM: 'Get new sensor feed names successfully',
    EC: 0,
    DT: result,
  };
};

const checkSensorNameExist = async (sensorName, name) => {
  let exist = await db.Sensor.findOne({
    where: {
      [Op.or]: [{ sensorName: sensorName }, { name: name }],
    },
    raw: true,
  });

  if (exist) {
    return true;
  } else {
    return false;
  }
};

const createSensorService = async (inputData) => {
  try {
    console.log('Check check inputData: ', inputData);
    if (!inputData.sensorName || !inputData.name) {
      return {
        EM: 'Missing sensorName(VD: dht20humi) or name (VD: humidity)',
        EC: 1,
        DT: '',
      };
    }
    let checkSensorNameorNameExist = await checkSensorNameExist(
      inputData.sensorName,
      inputData.name,
    );
    if (checkSensorNameorNameExist) {
      return {
        EM: 'SensorName or name has existed please change your SensorName or name',
        EC: 1,
        DT: '',
      };
    }
    await db.Sensor.create({
      sensorName: inputData.sensorName,
      name: inputData.name,
      description: inputData.description,
      status: inputData.status,
    });
    return {
      EM: 'Create a new sensor success',
      EC: 0,
      DT: '',
    };
  } catch (e) {
    console.error('❌ Error in createSensorService:', e);
    return {
      EM: 'Error in createSensorService',
      EC: 2,
      DT: '',
    };
  }
};

const getAllSensorService = async () => {
  try {
    let data = await db.Sensor.findAll({
      attributes: ['id', 'sensorName', 'name', 'description', 'status'],
    });
    if (!data) {
      return {
        EM: 'Error in get Sensor infor',
        EC: 1,
        DT: '',
      };
    }
    return {
      EM: 'Get all sensor infor success',
      EC: 0,
      DT: data,
    };
  } catch (e) {
    console.error('❌ Error getAllSensor:', e);
    return {
      EM: 'Error getAllSensor',
      EC: 2,
      DT: '',
    };
  }
};

const updateSensorInforService = async (inputData) => {
  try {
    if (!inputData.id) {
      return {
        EM: 'Update error. Sensor input not found',
        EC: 1,
        DT: '',
      };
    }
    let sensor = await db.Sensor.findOne({
      where: { id: inputData.id },
    });
    if (sensor) {
      await sensor.update({
        sensorName: inputData.sensorName,
        name: inputData.name,
        description: inputData.description,
        status: inputData.status,
      });
      return {
        EM: 'Update success',
        EC: 0,
        DT: '',
      };
    } else {
      //Not found
      return {
        EM: 'Update error. Not found sensor',
        EC: 2,
        DT: '',
      };
    }
  } catch (e) {
    console.error('❌ Error updateSensorInforService:', e);
    return {
      EM: 'Error updateSensorInforService',
      EC: 2,
      DT: '',
    };
  }
};

const deleteSensorService = async (inputId) => {
  try {
    let sensor = await db.Sensor.findOne({
      where: { id: inputId },
    });
    if (sensor) {
      await unsubscribeFromFeed(sensor.sensorName);
      await sensor.destroy();
      return {
        EM: 'Delete sensor success',
        EC: 0,
        DT: '',
      };
    } else {
      return {
        EM: 'sensor is not exist',
        EC: 2,
        DT: '',
      };
    }
  } catch (e) {
    console.error('❌ Error deleteSensorService:', e);
    return {
      EM: 'Error deleteSensorService',
      EC: 2,
      DT: '',
    };
  }
};
const getMaxMinAverageSensorService = async (id, timeStart, timeEnd) => {
  try {
    const range = await db.SensorData.findOne({
      where: { SDsensorId: id },
      attributes: [
        [fn('MIN', col('time')), 'minTime'],
        [fn('MAX', col('time')), 'maxTime'],
      ],
      raw: true,
    });
    if (!range || !range.minTime || !range.maxTime) {
      return {
        EM: 'No data available for this sensor',
        EC: 1,
        DT: '',
      };
    }
    const dbMinTime = new Date(range.minTime);
    const dbMaxTime = new Date(range.maxTime);
    const validStart = new Date(timeStart) < dbMinTime ? dbMinTime : new Date(timeStart);
    const validEnd = new Date(timeEnd) > dbMaxTime ? dbMaxTime : new Date(timeEnd);

    const result = await db.Sensor.findOne({
      where: { id: id },
      attributes: [
        'sensorName',
        'name',
        'description',
        [fn('MAX', col('SensorData.value')), 'maxValue'],
        [fn('MIN', col('SensorData.value')), 'minValue'],
        [fn('AVG', col('SensorData.value')), 'avgValue'],
      ],
      include: [
        {
          model: db.SensorData,
          attributes: [],
          where: {
            // ⚠️ Cột thời gian trong model SensorData của bạn là "time", KHÔNG phải "createAt"
            time: {
              [Op.between]: [validStart, validEnd],
            },
          },
        },
      ],
      group: ['Sensor.id'],
      raw: true,
    });
    console.log("Check check result: ", result);
    // ✅ Trả về kết quả có cấu trúc thống nhất
    if (!result) {
      return {
        EM: 'No sensor data found in given range',
        EC: 1,
        DT: '',
      };
    }

    return {
      EM: 'Get statistics successfully',
      EC: 0,
      DT: result,
    };
  } catch (e) {
    console.error('❌ Error getMaxMinAverageSensorService:', e);
    return {
      EM: 'Error getMaxMinAverageSensorService',
      EC: 2,
      DT: '',
    };
  }
};

const getSensorLogsService = async (sensorId, limit, offset, timeStart, timeEnd) => {
  try {
    let { count, rows } = await db.SensorData.findAndCountAll({
      where: {
        SDsensorId: sensorId,
        time: {
          [Op.between]: [new Date(timeStart), new Date(timeEnd)],
        },
      },
      attributes: ['id', 'SDsensorId', 'SDataId', 'time', 'value'],
      order: [['time', 'DESC']],
      limit,
      offset,
      raw: true,
    });
    if (!rows || rows.length === 0) {
      return {
        EM: 'No data found for this sensor',
        EC: 1,
        DT: { logs: [], totalPages: 0, currentPage: 1 },
      };
    };
    let totalPages = Math.ceil(count / limit);
    return {
      EC: 0,
      EM: 'Get sensor log success',
      DT: {
        logs: rows,
        totalRecords: count,
        totalPages,
        currentPage: Math.floor(offset / limit) + 1,
      },
    };
  }
  catch (e) {
    console.error('❌ Error getSensorLogsService:', e);
    return {
      EM: 'Error getSensorLogsService',
      EC: 2,
      DT: '',
    };
  }
}
const getDailyTimeAverageService = async (sensorId, timeStart, timeEnd) => {
  try {
    // Chuẩn bị thời gian: startDate từ đầu ngày, endDate đến cuối ngày
    const startDateObj = new Date(timeStart);
    startDateObj.setHours(0, 0, 0, 0);
    
    const endDateObj = new Date(timeEnd);
    endDateObj.setHours(23, 59, 59, 999); // Đến cuối ngày để bao gồm cả ngày cuối
    
    // Lấy dữ liệu trung bình thực tế từ DB
    const data = await db.SensorData.findAll({
      attributes: [
        [fn('DATE', col('time')), 'date'],
        [fn('AVG', col('value')), 'averageValue'],
      ],
      where: {
        SDsensorId: sensorId,
        time: {
          [Op.between]: [startDateObj, endDateObj],
        },
      },
      group: [literal('DATE(time)')],
      order: [[literal('DATE(time)'), 'ASC']],
      raw: true,
    });

    // ✅ Tạo map để dễ tra cứu
    const dataMap = new Map(
      data.map(item => [item.date, parseFloat(item.averageValue).toFixed(2)])
    );

    // ✅ Sinh danh sách tất cả các ngày trong khoảng timeStart - timeEnd (bao gồm cả ngày cuối)
    const start = moment(timeStart).tz('Asia/Ho_Chi_Minh').startOf('day');
    const end = moment(timeEnd).tz('Asia/Ho_Chi_Minh').startOf('day');
    const allDates = [];
    const current = start.clone();
    
    // Bao gồm cả ngày cuối cùng
    while (current.isSameOrBefore(end)) {
      allDates.push(current.format('YYYY-MM-DD'));
      current.add(1, 'day');
    }

    // ✅ Tạo mảng kết quả có ngày null nếu không có dữ liệu
    const result = allDates.map(date => ({
      date,
      averageValue: dataMap.has(date) ? dataMap.get(date) : null,
    }));

    return {
      EM: 'Get daily average successfully',
      EC: 0,
      DT: result,
    };
  } catch (e) {
    console.error('❌ Error getDailyAverageService:', e);
    return {
      EM: 'Error getDailyAverageService',
      EC: 2,
      DT: '',
    };
  }
};
export default {
  getNewDeviceFeedName,
  getNewSensorFeedName,
  createSensorService,
  getAllSensorService,
  updateSensorInforService,
  deleteSensorService, getMaxMinAverageSensorService,
  getSensorLogsService, getDailyTimeAverageService
};
