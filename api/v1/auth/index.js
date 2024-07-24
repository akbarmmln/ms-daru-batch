const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/login', controller.getLogin);
router.post('/pre-register', controller.getPreRegister);

module.exports = router;