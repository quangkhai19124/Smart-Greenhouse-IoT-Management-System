cách kết nối đến mqtt BE
import { io as Client } from "socket.io-client";
const testClient = Client("http://localhost:8081");
testClient.on("connect", () => {
    console.log("🧪 Test Client đã kết nối tới BE:", testClient.id);
});

// Nghe dữ liệu của realtime của các sensor các lấy dữ liệu VD data.lightsensor
testClient.on("sensorData", (data) => {
    console.log("🧪 Test Client nhận được sensorData:", data);
});
// Giá trị trung bình trong 24h theo từng khung h gần nhất
testClient.on("sensorHourlyAvg", (data) => {
    console.log("🧪 Test Client nhận được sensorHourlyAvg:", data);
});

testClient.on("disconnect", () => {
    console.log("❌ Test Client đã ngắt kết nối");
});

cách lấy data của sensorData
data này được gửi nhiều lần khi dữ liệu nào thay đổi nên dùng sensorData.sensorName để so sánhs
kiểu dữ liệu của là 
🧪 Test Client nhận được sensorData: {
  sensorName: 'dht20temp',
  value: 27.09,
  time: '2025-10-01T05:47:50.125Z'
}
🧪 Test Client nhận được sensorData: {
  sensorName: 'lightsensor',
  value: 447,
  time: '2025-10-01T05:47:50.136Z'
}
🧪 Test Client nhận được sensorData: {
  sensorName: 'dht20humi',
  value: 58.48,
  time: '2025-10-01T05:47:50.131Z'
}
🧪 Test Client nhận được sensorData: {
  sensorName: 'soilhumi',
  value: 58.06,
  time: '2025-10-01T05:47:50.133Z'
}
kiểu dữ liệu của avg vẽ chart
muốn truy suất vào từng dữ liệu thì dùng mảng data[0]
của sensorHourlyAvg VD khung 12h vd data: 
  {
    time: '21:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '22:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '23:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '00:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '01:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '02:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '03:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '04:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '05:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '06:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '07:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '08:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '09:00',
    dht20temp: 27.62,
    dht20humi: 59.38,
    soilhumi: 61.09,
    lightsensor: 402.33
  },
  {
    time: '10:00',
    dht20temp: 27.43,
    dht20humi: 59.89,
    soilhumi: 60.34,
    lightsensor: 395.45
  },
  {
    time: '11:00',
    dht20temp: 27.37,
    dht20humi: 59.99,
    soilhumi: 61.18,
    lightsensor: 412.47
  },
  {
    time: '12:00',
    dht20temp: 27.35,
    dht20humi: 59.89,
    soilhumi: 60.06,
    lightsensor: 400.97
  },
  {
    time: '13:00',
    dht20temp: 27.4,
    dht20humi: 59.73,
    soilhumi: 59.72,
    lightsensor: 402.12
  },
  {
    time: '14:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '15:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '16:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '17:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '18:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '19:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  },
  {
    time: '20:00',
    dht20temp: null,
    dht20humi: null,
    soilhumi: null,
    lightsensor: null
  }
]