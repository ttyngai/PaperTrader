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
    // Check for negative shares
    if (req.body.shares <= 0) {
      return res.redirect(`/stocks/${req.params.id}/${req.body.portfolioId}`);
    }
    Stock.findById(req.params.id, function (err, stock) {
      req.body.ticker = stock.ticker;
      req.body._id = req.params.id;
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
