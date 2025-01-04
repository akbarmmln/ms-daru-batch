'use strict';
require('dotenv').config();
const app = require('./app');
const logger = require('./config/logger');
const schedule = require('node-schedule');
const partition = require('./api/v1/partition_tabel/controller');

// Constants
let PORT = process.env.PORT
app.listen(PORT);

schedule.scheduleJob(process.env.SCHE_TIME_CHECK_FUNCTION, () => {
    logger.infoWithContext('START ON FOR ALL FUNCTIONS');
});

schedule.scheduleJob(process.env.SCHE_TIME_DAILY_SNAP_VA, () => {
    partition.daily_snapshot_va();
});

schedule.scheduleJob(process.env.SCHE_TIME_PARTITION_USER_TRX, () => {
    partition.partition_user_trx();
});