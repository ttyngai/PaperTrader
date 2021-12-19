var express = require('express');
var router = express.Router();
const portfoliosCtrl = require('../controllers/portfolios');

// POST "/portfolios" - new form route
// router.get('/new', portfoliosCtrl.new);
// POST "/portfolios" - Create Route
router.post('/', portfoliosCtrl.create);

//GET "/portfolios", index route
router.get('/', portfoliosCtrl.index);

//GET "/portfolios/:id", show route
router.get('/:id', portfoliosCtrl.show);

//Get edit portfolio page
router.get('/:id/delete', portfoliosCtrl.confirmDelete);
//Update portfolio name
router.post('/:id', portfoliosCtrl.update);

//Delete portfolio
router.delete('/:id', portfoliosCtrl.delete);

module.exports = router;
