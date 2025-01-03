'use strict';
const Sequelize = require('sequelize');
const connection_pool = require('../setting').mysql_connections_pool;
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
const sequelizeInstances = {};

const createSequelizeInstance = (settings, privateKey) => {
  return new Sequelize(settings.dbname, settings.username, settings.password, {
    operatorsAliases,
    host: settings.host,
    port: settings.port,
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
};

try {
  const connectionsPool = JSON.parse(connection_pool);
  for (let i = 0; i < connectionsPool.length; i++) {
      const sequelize = createSequelizeInstance(connectionsPool[i], privateKey);
      sequelize.authenticate()
        .then(() => {
          logger.infoWithContext(`Connection has been established successfully (${connectionsPool[i].dbname}).`);
        })
        .catch(err => {
          logger.errorWithContext({ error: err, message: `Unable to connect to the database (${connectionsPool[i].dbname})` });
        });
        sequelizeInstances[connectionsPool[i].name] = sequelize
  }
} catch (error) {
  logger.errorWithContext({ error, message: 'Error initializing databases' });
}

module.exports = {
  connect: sequelizeInstances
}