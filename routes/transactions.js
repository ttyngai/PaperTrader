var express = require('express');
var router = express.Router();
const transactionsCtrl = require('../controllers/transactions');
const isLoggedIn = require('../config/auth');

router.post('/stocks/:id/transactions', isLoggedIn, transactionsCtrl.create);
module.exports = router;
