var express = require('express');
var router = express.Router();
const portfoliosCtrl = require('../controllers/portfolios');
const isLoggedIn = require('../config/auth');

// POST "/movies" - Create Route
router.get('/new', portfoliosCtrl.new);
// POST "/movies" - Create Route
router.post('/', portfoliosCtrl.create);

//GET "/portfolios", index route
router.get('/', portfoliosCtrl.index);

module.exports = router;
