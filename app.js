
const helmet = require('helmet')
const cors = require('cors')
const xss = require('xss-clean')
const rateLimit = require('express-rate-limit')

const express = require("express");
const app = express();
const favorites = require('./routes/favorites');
const users = require('./routes/users')
const userUtility = require('./routes/userUtility')
const admin = require('./routes/admin/admin')
const adminValidate = require('./routes/admin/validate')
const connectDB = require('./db/connect')
require('dotenv').config();
const authenticateUser = require('./middleware/authentication')
const notFound = require('./middleware/notfound');
const errorHandlerMiddleware = require("./middleware/error-handler.js");
//middleware
app.set('trust proxy', 1);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 100 requests per windowMs
  })
);

  app.use(express.json());
  app.use(
    helmet({
      contentSecurityPolicy: false,
    })
  );
  app.use(cors());
  app.use(xss());

app.use(express.static('./public'))
app.use(express.json());


//routes

app.use('/api/v1/validate', adminValidate);
app.use('/api/v1/auth', users);
app.use('/api/v1/auth/favorites', authenticateUser, favorites);
app.use('/api/v1', authenticateUser, userUtility);
app.use('/api/v1/admin', authenticateUser, admin);
app.use(notFound);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000;

const start = async (portNum) =>{
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(portNum, console.log(`Server is listening on ${port}...`));
    } catch (error) {
        console.log(error);
    }
}

start(port);

