const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');

module.exports = {
  create,
};

function create(req, res) {
  console.log('req,body', req.params.id);
  Portfolio.findById(req.body.portfolioId, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/stocks');
    }

    Stock.findById(req.params.id, function (err, stock) {
      req.body.ticker = stock.ticker;
      req.body._id = req.params.id;
      // Swaps positive to negative if sell button was hit
      if (req.body.button === 'sell') {
        req.body.shares = req.body.shares * -1;
      }
      portfolio.transactions.push(req.body);
      portfolio.save(function (err) {
        if (err) console.log(err);
        res.redirect(`/portfolios/${req.body.portfolioId}`);
      });
    });
  });
}
