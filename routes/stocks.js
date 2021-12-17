var express = require('express');
var router = express.Router();
const stocksCtrl = require('../controllers/stocks');
const isLoggedIn = require('../config/auth');

// POST "/stocks" - Create Route
router.post('/', stocksCtrl.create);

//GET "/stocks", index route
router.get('/', stocksCtrl.index);

//GET "/stocks/:id", show route
router.get('/:id', stocksCtrl.show);

// Deleting a review to "/reviews/:id"
router.delete('/:id', stocksCtrl.delete);

module.exports = router;
