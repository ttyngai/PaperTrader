const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');

module.exports = {
  create,
};

function create(req, res) {
  Portfolio.findById(req.body.portfolioId, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/stocks');
    }
    Stock.findById(req.params.id, function (err, stock) {
      req.body.ticker = stock.ticker;
      if (req.body.button === 'sell') {
        req.body.shares = req.body.shares * -1;
      }

      portfolio.transactions.push(req.body);
      portfolio.save(function (err) {
        if (err) console.log(err);
        res.redirect(`/stocks/${req.params.id}/${req.body.portfolioId}`);
      });
    });
  });
}
