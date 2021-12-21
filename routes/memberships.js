var express = require('express');
var router = express.Router();
const membershipsCtrl = require('../controllers/memberships');

// Premium upgrade
router.get('/', membershipsCtrl.premium);

module.exports = router;
