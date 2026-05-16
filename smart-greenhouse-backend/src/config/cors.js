require('dotenv').config();
const configCors = (app) => {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.REACT_URL);
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    res.header('Access-Control-Allow-Methods', 'GET, POST ,PUT, DELETE, , OPTIONS, PATCH');
    //Cấu hình để gửi cookie
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
};
export default configCors;
