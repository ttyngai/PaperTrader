const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');
// const Transaction = require('../models/transaction')
module.exports = {
  create,
};

function create(req, res) {
  console.log('Create Transaction', req.body, req.params.id);
  Portfolio.findById(req.body.portfolioId, function (err, portfolio) {
    console.log('portfolio Name', portfolio.name);

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
