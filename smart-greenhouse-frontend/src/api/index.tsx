export const API_BASE_URL = import.meta.env.API_BASE_URL;
export const API_PROXY_NAME = import.meta.env.API_PROXY_NAME;
export const API_BASE  = `${API_PROXY_NAME}/api/v1`;
export const API_LOGIN = `${API_BASE}/login`;

// Device
export const API_DEVICE = `${API_BASE}/device`;
export const API_GET_ALL_DEVICES = `${API_DEVICE}/getAllDevice`;
export const API_TOGGLE_DEVICE = `${API_DEVICE}/toggleDevice`;
export const API_GET_DEVICE_STATUS = `${API_DEVICE}/getDeviceStatusPowerRuntime`;
export const API_GET_DEVICE_DATA_LOGS = `${API_DEVICE}/getDeviceLogs`;
export const API_GET_DEVICE_TOGGLE_COUNT = `${API_DEVICE}/getDeviceOnOffStats`;
export const API_GET_DEVICE_SETTING = `${API_DEVICE}/getExacDeviceInfor`;
export const API_UPDATE_DEVICE_MODE = `${API_DEVICE}/changeMode`;

// Sensor
export const API_SENSOR = `${API_BASE}/sensor`;
export const API_GET_ALL_SENSORS = `${API_SENSOR}/getAllSensor`;
export const API_GET_SENSOR_DATA = `${API_SENSOR}/maxminaverageSensor`;
export const API_GET_DAILY_SENSOR_DATA = `${API_SENSOR}/getDailyTime`;
export const API_GET_SENSOR_DATA_LOGS = `${API_SENSOR}/getSensorLogs`;

// sensorNotif
export const API_SENSOR_NOTIF = `${API_BASE}/sensorNotif`;
export const API_GET_ALL_SENSOR_NOTIFS = `${API_SENSOR_NOTIF}/getRulesOfSensor`;
export const API_UPDATE_SENSOR_NOTIF = `${API_SENSOR_NOTIF}/updateRulesOfSensor`;

// profile
export const API_GET_ME = `${API_BASE}/me`;
export const API_UPDATE_PROFILE = `${API_BASE}/user/updateProfile`;

// schedule
export const API_SCHEDULE = `${API_BASE}/schedule`;
export const API_DELETE_DEVICE_SCHEDULE = `${API_SCHEDULE}/deleteSchedule`;
export const API_UPDATE_DEVICE_SCHEDULE = `${API_SCHEDULE}/updateSchedule`;
export const API_CREATE_DEVICE_SCHEDULE = `${API_SCHEDULE}/createSchedule`;

// setRule
export const API_SET_RULE = `${API_BASE}/setRule`;
export const API_CREATE_SET_RULE = `${API_SET_RULE}/createSetRule`;
export const API_GET_RULES_OF_SET = `${API_SET_RULE}/getRulesOfSet`;
export const API_UPDATE_RULES_OF_SET = `${API_SET_RULE}/updateRulesOfSet`;
export const API_DELETE_SET_RULE = `${API_SET_RULE}/deleteSetRule`;

// notification
export const API_NOTIF = `${API_BASE}/notif`;
export const API_GET_NOTIF = `${API_NOTIF}/getNotif`;
export const API_MARK_NOTIF_AS_READ = `${API_NOTIF}/markAsRead`;