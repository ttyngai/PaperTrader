var express = require('express');
var router = express.Router();
const transactionsCtrl = require('../controllers/transactions');

router.post('/stocks/:id/transactions', transactionsCtrl.create);
module.exports = router;
