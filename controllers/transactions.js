const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');
// const Transaction = require('../models/transaction')
module.exports = {
  create,
};

function create(req, res) {
  Portfolio.findById(req.body.portfolioId, function (err, portfolio) {
    Stock.findById(req.params.id, function (err, stock) {
      req.body.ticker = stock.ticker;
      portfolio.transactions.push(req.body);
      portfolio.save(function (err) {
        if (err) console.log(err);
        res.redirect(`/portfolios/${req.body.portfolioId}`);
      });
    });
  });
}

// async function getStock(){
//     const response = await fetch(`https://query1.finance.yahoo.com/v7/finance/quote?lang=en-US&region=US&corsDomain=finance.yahoo.com&symbols=TSLA`);
//     var data = await response.json();
//     console.log(data)
//     }
