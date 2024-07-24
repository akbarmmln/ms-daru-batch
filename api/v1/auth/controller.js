'use strict';

const rsmg = require('../../../response/rs');
const utils = require('../../../utils/utils');
const moment = require('moment');
const uuidv4 = require('uuid').v4;
const logger = require('../../../config/logger');
const formats = require('../../../config/format');
const mailer = require('../../../config/mailer');
const adrVerifikasi = require('../../../model/adr_verifikasi');
const adrLogin = require('../../../model/adr_login');
const bcrypt = require('bcryptjs');
const saltRounds = 12;
const connectionDB = require('../../../config/db').Sequelize;
const axios = require('axios');

exports.getLogin = async function (req, res) {
  try {
    const kk = req.body.kk;
    const pin = req.body.pin;

    const findVerif = await adrVerifikasi.findOne({
      raw: true,
      where: {
        kk: kk
      }
    })
    if (!findVerif) {
      return res.status(200).json(rsmg('90001', null));
    }

    if (findVerif && findVerif.is_registered == 1) {
      const account_id = findVerif.account_id;
      if (formats.isEmpty(account_id)) {
        return res.status(200).json(rsmg('90002', null));
      }

      const splitId = account_id.split('-');
      const splitIdLenght = splitId.length
      const partition = splitId[splitIdLenght - 1]

      let dataAccount = await axios({
        method: 'POST',
        url: process.env.MS_ACCOUNT_URL + '/api/v1/account',
        data: {
          id: 'fa5d61a1-4278-4665-abe5-f1431f8c3bbf-202407'
        }
      });
      console.log('dataAccountdataAccount', dataAccount.data)
      if (dataAccount.data.code != '000000') {
        return res.status(200).json(dataAccount.data);
      }

      const tabelLogin = adrLogin(partition)
      const dataAccountLogin = await tabelLogin.findOne({
        raw: true,
        where: {
          account_id: `${account_id}`
        }
      })
      if (!dataAccountLogin) {
        return res.status(200).json(rsmg('90002', null));
      }

      const payloadEnkripsiLogin = {
        id: dataAccountLogin.account_id,
        kk: dataAccount.data.data.dataAccount.kk,
        mobile_number: dataAccount.data.data.dataAccount.mobile_number
      }
      const pinRegistered = dataAccountLogin.pin;
      const checkPin = await bcrypt.compare(pin, pinRegistered);

      if (checkPin) {
        const hash = await utils.enkrip(payloadEnkripsiLogin);
        const token = await utils.signin(hash);
  
        res.set('Access-Control-Expose-Headers', 'access-token');
        res.set('access-token', token);
  
        return res.status(200).json(rsmg('000000', null));
      } else {
        throw '90003'
      }
    } else {
      return res.status(200).json(rsmg('90002', null));
    }
  } catch (e) {
    logger.error('error POST /api/v1/account...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v1/account...', e);
  }
}

exports.getPreRegister = async function (req, res) {
  try {
    const kk = req.body.kk;

    const dataVerif = await adrVerifikasi.findOne({
      raw: true,
      where: {
        kk: kk
      }
    })

    if (!dataVerif) {
      return res.status(200).json(rsmg('90001', null));
    }

    if (dataVerif && dataVerif.is_registered == 1) {
      return res.status(200).json(rsmg('90004', null));
    }

    return res.status(200).json(rsmg('000000', dataVerif));
  } catch (e) {
    logger.error('error POST /api/v1/account/pre-register...', e);
    return utils.returnErrorFunction(res, 'error POST /api/v1/account/pre-register...', e);
  }
}