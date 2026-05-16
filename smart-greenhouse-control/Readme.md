# Smart Greenhouse Prediction API

Hệ thống API dự đoán cho mô hình nhà kính, sử dụng các mô hình Machine Learning (.pkl) để dự đoán trạng thái bật/tắt của thiết bị, công suất và thời gian hoạt động còn lại. API được xây dựng bằng FastAPI.

--------------------------------------

## 1. Cài đặt môi trường

Cài đặt đúng phiên bản thư viện để đảm bảo load được mô hình:

```bash
pip install numpy==1.26.4 scikit-learn==1.6.1 joblib fastapi uvicorn pandas

```

---

## 2. Chạy server API

Trong thư mục chứa file `main.py`, chạy:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server chạy tại:

```
http://localhost:8000
```

---

## 3. Endpoint API

### URL

```
POST http://localhost:8000/predict
```


### Request Header

```
Content-Type: application/json
```

### Request Body (JSON)

```json
{
  "temperature": 30,
  "humidity": 55,
  "soil_moisture": 5,
  "light": 500
}
```

### Giải thích tham số:

* temperature: nhiệt độ (°C)
* humidity: độ ẩm không khí (%)
* soil_moisture: độ ẩm đất (%)
* light: cường độ ánh sáng (lux)

---

## 4. Response (JSON)

Ví dụ:

```json
{
  "pump": 1,
  "pump_power": 44.29,
  "pump_duration": 58.96,
  "light": 0,
  "light_power": 0,
  "light_duration": 0
}
```

### Giải thích dữ liệu trả về:

* pump: 1 bật, 0 tắt
* pump_power: công suất máy bơm (W)
* pump_duration: thời gian dự đoán sẽ còn hoạt động (giây)
* light: 1 bật, 0 tắt
* light_power: công suất đèn (W)
* light_duration: thời gian dự đoán sẽ còn hoạt động (giây)

Nếu thiết bị tắt thì power = 0 và duration = 0.

---

## 5. Test bằng Postman

* Chọn phương thức POST
* URL: `http://localhost:8000/predict`
* Body → Raw → JSON
* Dán nội dung request và gửi.

---

## 6. Cấu trúc thư mục dự án (gợi ý)

```
smart-greenhouse-control/
│── main.py
│── pump_switch.pkl
│── pump_power.pkl
│── pump_duration.pkl
│── light_switch.pkl
│── light_power.pkl
│── light_duration.pkl
│── README.md
```

---

## 7. Ghi chú

* Tất cả file `.pkl` phải nằm cùng thư mục với `main.py`.
* Nếu cập nhật mô hình mới chỉ cần thay file `.pkl`, không cần chỉnh code API.

