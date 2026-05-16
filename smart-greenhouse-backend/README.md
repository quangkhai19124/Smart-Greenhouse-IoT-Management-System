# Smart Greenhouse Backend
# Smart Greenhouse Backend

Backend for Smart Greenhouse System.

## Features
* RESTful API for greenhouse management
* MQTT integration for IoT devices
* User authentication and authorization
* Device, sensor, rule, and schedule management
* Real-time notifications (Telegram, WebSocket)
* Swagger API documentation

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment variables
Create a `.env` file in the root directory:
```env
PORT=8081
REACT_URL=http://localhost:3000

# Database configuration
MYSQL_ROOT_PASSWORD=mock_root_password
MYSQL_DATABASE=mock_database
MYSQL_USER=mock_user
MYSQL_PASSWORD=mock_password
MYSQL_PORT=3306
MYSQL_HOST=127.0.0.1

# DockerHub username (optional for local)
DOCKER_USERNAME=mock_docker_user

# App credentials
AIO_USERNAME=mock_aio_username
AIO_KEY=mock_aio_key
JWT_SECRET=mock_jwt_secret
JWT_EXPRIRES_IN=7d

# Integrations
TELEGRAM_BOT_TOKEN=mock_telegram_token
TELEGRAM_WEBHOOK_URL=https://example.com/telegram/webhook
GEMINI_API_KEY=mock_gemini_key
AI_POWER_API=https://mock-ai-power.api
```

### 3. Database setup
- Create the database:
	```sql
	CREATE DATABASE IOT;
	USE IOT;
	```
- Run migrations:
	```bash
	npm run migrate
	```
- (Optional) Seed sample data:
	```bash
	npm run seed
	```

### 4. Start the server
```bash
npm start
```

## API Documentation
Deployed Swagger docs: [http://api.smartgreenhouse.site/api-docs](http://api.smartgreenhouse.site/api-docs)

## Scripts
* `npm start` — Start development server with nodemon
* `npm run prod` — Start server in production mode
* `npm run migrate` — Run database migrations
* `npm run seed` — Seed database with sample data
* `npm run lint` — Lint code

## Tech Stack
* Node.js, Express.js
* Sequelize (MySQL)
* MQTT, Socket.io
* Swagger (OpenAPI)
* Telegram Bot

## Folder Structure
```
src/               Source code
	config/            Configuration files
	controller/        Route controllers
	middleware/        Express middlewares
	migrations/        Sequelize migrations
	models/            Sequelize models
	mqtt/              MQTT integration
	routes/            API routes
	seeders/           Database seeders
	service/           Business logic/services
	utils/             Utility functions
```

## License
MIT