var express = require('express');
var router = express.Router();
const stocksCtrl = require('../controllers/stocks');
const isLoggedIn = require('../config/auth');
const fetch = require('node-fetch');

// POST "/portfolios" - Create Route
router.post('/', stocksCtrl.create);

//GET "/portfolios", index route
router.get('/', stocksCtrl.index);

//GET "/portfolios/:id", show route
router.get('/:id', stocksCtrl.show);

module.exports = router;

function getStock(ticker) {
  const url =
    'https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=TSLA';

  let info;
  // if there is a username, we will make a request!
  fetch(`${url}`)
    .then((res) => res.json())
    .then((data) => {
      info = data;
      console.log('info:', info.quoteResponse.result);
    });
}
