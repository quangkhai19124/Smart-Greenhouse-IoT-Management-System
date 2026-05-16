import express from 'express';
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';
import cookiesParser from 'cookie-parser';
import session from 'express-session';
import configCors from './config/cors';
import { connection } from './config/connectDB.js';
import initApiRoute from './routes/api.js';
import initApiSetRuleRoute from './routes/setRuleRoutes.js';
import initApiIotRoute from './routes/sensorDataRoutes.js';
import initApiDeviceRoute from './routes/deviceRoutes.js';
import initApiRuleRoute from './routes/ruleRoutes.js';
import initApiScheduleRoute from './routes/scheduleRoutes.js';
import initApiSensorRoute from './routes/sensorRoutes.js';
import initApiNotifRoute from './routes/notifRoutes.js';
import { initAdaService } from './mqtt/adaService.js';
import { initAutoDevices, initAIDevice } from './service/deviceService.js'
import { initTelegramService } from './service/telegramService.js'
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 8081;

//config cors
configCors(app);

//config cookies-parser
app.use(cookiesParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

//config body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routes
app.use(express.json());

initTelegramService(app);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Smart Greenhouse API",
      version: "1.0.0",
      description: "API documentation for Smart Greenhouse project",
    },
    // servers: [
    //   {
    //     url: `http://localhost:${PORT}/`,
    //   }
    // ],
  },
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

//test connection db
connection();

// //init iot route
initApiIotRoute(app);

//init web route
initApiRoute(app);
initApiDeviceRoute(app);
initApiSetRuleRoute(app);
initApiRuleRoute(app);
initApiSensorRoute(app);
initApiScheduleRoute(app);
initApiNotifRoute(app);
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});
global.io = io;
initAdaService(io);
// Ensure setTimeout is available in the Node.js global scope
global.setTimeout(() => initAutoDevices(), 4000);
global.setTimeout(() => initAIDevice(), 4000);
server.listen(PORT, () => {
  console.log('Back end running on the port: ' + PORT);
});
app.use((req, res) => {
  return res.status(404).send('404 not found');
});