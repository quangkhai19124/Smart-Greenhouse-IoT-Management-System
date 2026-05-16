
Chuyển api của adaService sang port 6000

Các api tồn tại liên quan đến sensor
methor: POST :  http://localhost:8081/api/v1/sensor/createSensor
methor: GET :   http://localhost:8081/api/v1/sensor/getAllSensor
methor: PUT:    http://localhost:8081/api/v1/sensor/updateSensorInfor
methor: DELETE: http://localhost:8081/api/v1/sensor/deleteSensor

create
cách kết nối
http://localhost:8081/api/v1/sensor/createSensor
dữ liệu truyền vào phải có là sensorName, name
    VD
    sensorName: test
    name: test
    description: abcde
dữ liệu trả về khi tạo thêm sensor mới thành công : 
{
    "EM": "Create a new sensor success",
    "EC": 0,
    "DT": ""
}



read
cách kết nối
http://localhost:8081/api/v1/sensor/getAllSensor
không cần truyền dữ liệu vào
dữ liệu trả về khi lấy danh sách thành công
{
    "EM": "Get all sensor infor success",
    "EC": 0,
    "DT": [
        {
            "id": 1,
            "sensorName": "dht20humi",
            "name": "humidity",
            "description": "humidity",
            "status": "on"
        },
        {
            "id": 2,
            "sensorName": "soilhumi",
            "name": "soil_humidity",
            "description": "soil_humidity",
            "status": "on"
        },
        {
            "id": 3,
            "sensorName": "lightsensor",
            "name": "lightsensor",
            "description": "light",
            "status": "on"
        },
        {
            "id": 4,
            "sensorName": "dht20temp",
            "name": "dht20temp",
            "description": "temperature",
            "status": "on"
        },
        {
            "id": 6,
            "sensorName": "test",
            "name": "test",
            "description": "Test lúc 5/",
            "status": null
        }
    ]
}


update
cách kết nối
http://localhost:8081/api/v1/sensor/updateSensorInfor
cần truyền id của sensor muốn chỉnh sửa và thay đổi thông tin muốn thay đổi
VD  
{
    id:6,
    name: test1,
}
dữ liệu trả về khi tạo update sensor mới thành công : 
{
    "EM": "Update success",
    "EC": 0,
    "DT": ""
}

delete
cách kết nối
http://localhost:8081/api/v1/sensor/deleteSensor
cần truyền id của sensor muốn xóa
VD  
{
    id:6
}
dữ liệu trả về khi tạo delete sensor mới thành công : 
{
    "EM": "Delete sensor success",
    "EC": 0,
    "DT": ""
}