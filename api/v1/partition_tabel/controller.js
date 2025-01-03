'use strict';

const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const { fire } = require("../../../config/firebase");
const firestore = fire.firestore();
const initializeDatabases = require('../../../config/db').connect;
const seq_ms_payment = initializeDatabases.ms_payment;

// const sequelizeAccount = require('../../../config/db').sequelizeAccount;
// const sequelizeAuth = require('../../../config/db').sequelizeAuth;

// exports.partition = async function () {
// 	try {
// 		const doc = firestore.collection('daru').doc('register_partition');
// 		doc.onSnapshot(async docSnapshot => {
// 			if (docSnapshot.exists) {
// 				const data = docSnapshot.data()
// 				if (data.partition.length > 0) {
// 					for (let i=0; i<data.partition.length; i++) {
// 						const partitionName = data.partition[i].tabel
// 						const sqlAccount = `CREATE TABLE IF NOT EXISTS adr_account_${partitionName} (
// 							"id" varchar(100) NOT NULL,
// 							"created_dt" datetime(3) DEFAULT NULL,
// 							"created_by" varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
// 							"modified_dt" datetime(3) DEFAULT NULL,
// 							"modified_by" varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
// 							"is_deleted" tinyint(1) DEFAULT NULL,
// 							"nama" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"kk" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"mobile_number" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"email" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"alamat" longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
// 							"blok" varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"nomor_rumah" varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"rt" varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"rw" varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							PRIMARY KEY ("id"),
// 							KEY "adr_account_202407_kk_IDX" ("kk")
// 						);`
// 						await sequelizeAccount.query(sqlAccount);

// 						const sqlAuth = `CREATE TABLE IF NOT EXISTS adr_login_${partitionName} (
// 							"id" varchar(100) NOT NULL,
// 							"created_dt" datetime(3) DEFAULT NULL,
// 							"created_by" varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
// 							"modified_dt" datetime(3) DEFAULT NULL,
// 							"modified_by" varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
// 							"is_deleted" tinyint(1) DEFAULT NULL,
// 							"account_id" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"pin" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
// 							"available_counter" tinyint(1) DEFAULT NULL,
// 							"next_available" datetime DEFAULT NULL,
// 							PRIMARY KEY ("id")
// 						);`
// 						await sequelizeAuth.query(sqlAuth);
// 					}
// 				}
// 			}
// 		}, err => {
// 			console.log(`Encountered error: ${err}`);
// 		});

// 	} catch (e) {
// 		console.log(`function partition error: ${e}`);
// 	}
// }

exports.daily_snapshot_va = async function () {
  const date = moment().format('YYYYMMDDHHmmssSSS')
  const transaction = await seq_ms_payment.transaction();
  try {
    logger.infoWithContext('running daily snapshot va')
    const sqlQueryCreateSnapshot = `CREATE TABLE IF NOT EXISTS ms_payment.snapshots_${date} (
      "id" INT PRIMARY KEY AUTO_INCREMENT,
      "va_number" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
      "balance" decimal(24,2) DEFAULT '0.00',
      "account_id" varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL
    );`
    await seq_ms_payment.query(`${sqlQueryCreateSnapshot}`);
    
    await seq_ms_payment.query(`LOCK TABLES ms_payment.snapshots_${date} WRITE, ms_payment.adr_va READ;`, { transaction });

    const sqlQuerySnapshot = `INSERT INTO ms_payment.snapshots_${date} (id, va_number, balance, account_id)
      SELECT ROW_NUMBER() OVER () AS id, va_number, balance, account_id FROM ms_payment.adr_va;`
    await seq_ms_payment.query(`${sqlQuerySnapshot}`, { transaction });

    await seq_ms_payment.query('UNLOCK TABLES;', { transaction });
    await transaction.commit()
    logger.infoWithContext('end daily snapshot va')
  } catch (e) {
    if (transaction) {
      transaction.rollback();
    }
    logger.errorWithContext({ error: e, message: 'error coba...' })
  }
}