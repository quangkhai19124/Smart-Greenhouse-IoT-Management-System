import db from '../../models/index';

export const toVietnamTime = (isoString) => {
  if (!isoString) return null;

  const str = typeof isoString === "string" ? isoString : isoString.toISOString();

  const date = new Date(str.endsWith("Z") ? str : str + "Z");

  return date.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

export const getLatestSensorReadings = async () => {
  const sensors = await db.Sensor.findAll({
    attributes: ['id', 'name', 'sensorName', 'description', 'status'],
    order: [['id', 'ASC']]
  });

  const readings = [];
  for (const sensor of sensors) {
    const latestData = await db.SensorData.findOne({
      where: { SDsensorId: sensor.id },
      attributes: ['value', 'time'],
      order: [['time', 'DESC']]
    });

    if(sensor.status === 'on') {
      readings.push({
        name: sensor.name,
        value: latestData ? latestData.value : null,
        time: latestData ? toVietnamTime(latestData.time) : null
      });
    }
  }

  return readings;
};

export const getInfoUserService = async (teleChatID) => {
  const user = await db.Users.findOne({
    where: { teleChatID: teleChatID },
    attributes: ['id', 'username', 'email', 'role', 'teleChatID']
  });
  return user;
};

export const getAllDevice = async () => {
  const devices = await db.Device.findAll({
      attributes: ['id', 'adaDevName', 'deviceName', 'description', 'power', 'status', 'mode', 'updatedAt'],
      raw: true
  });

  return devices;
}