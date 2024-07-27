'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const schedule = require('node-schedule');
const {partition} = require('./api/v1/partition_tabel/controller');

// Constants
let PORT = process.env.PORT
app.listen(PORT);

// partition();

schedule.scheduleJob('*/5 * * * * *', () => {
    logger.infoWithContext('START ON FOR ALL FUNCTIONS');
});