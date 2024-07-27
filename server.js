'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const schedule = require('node-schedule');

// Constants
let PORT = process.env.PORT
app.listen(PORT);

schedule.scheduleJob('*/5 * * * * *', () => {
    logger.infoWithContext('START ON FOR ALL FUNCTIONS');
});