var express = require('express');
var router = express.Router();
const stocksCtrl = require('../controllers/stocks');

// POST "/stocks" - Create Route
router.post('/', stocksCtrl.create);

// Change timeframe
router.post('/changeTimeframe/:stockId', stocksCtrl.changeTimeframe);

// Toggle technicals
router.post('/toggleTechnicals/:stockId', stocksCtrl.toggleTechnicals);

//GET "/stocks", index route
router.get('/', stocksCtrl.index);

//GET "/stocks/:id", preselected portfolio ID
router.get('/:id/:portfolioId', stocksCtrl.show);

//GET "/stocks/:id", show route
router.get('/:id', stocksCtrl.show);

// Deleting a review to "/reviews/:id"
router.post('/:id', stocksCtrl.hideOrDelete);

module.exports = router;
