'use strict';
const Sequelize = require('sequelize');
const settings_account = require('../setting').mysql_account;
const settings_auth = require('../setting').mysql_auth;
const logger = require('./logger');
const Op = Sequelize.Op;
const operatorsAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
};
const privateKey = process.env.SSL_SEQUELIZE;

const sequelizeAccount = new Sequelize(settings_account.dbname, settings_account.username, settings_account.password, {
  operatorsAliases,
  host: settings_account.hostname,
  port: settings_account.port,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: privateKey.replace(/\\n/gm, '\n')
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+07:00'
});

const sequelizeAuth = new Sequelize(settings_auth.dbname, settings_auth.username, settings_auth.password, {
  operatorsAliases,
  host: settings_auth.hostname,
  port: settings_auth.port,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: privateKey.replace(/\\n/gm, '\n')
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  timezone: '+07:00'
});

sequelizeAccount.authenticate()
  .then(() => {
    logger.infoWithContext('Connection has been established successfully (account).');
  })
  .catch(err => {
    logger.errorWithContext({ error: err, message: 'Unable to connect to the database (account):' });
  });

  sequelizeAuth.authenticate()
  .then(() => {
    logger.infoWithContext('Connection has been established successfully (auth).');
  })
  .catch(err => {
    logger.errorWithContext({ error: err, message: 'Unable to connect to the database (auth):' });
  });

module.exports = {
  sequelizeAccount: sequelizeAccount,
  sequelizeAuth: sequelizeAuth
}