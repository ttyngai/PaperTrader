const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');

module.exports = {
  create,
  delete: deleteTransaction,
};

function create(req, res) {
  Portfolio.findById(req.body.portfolioId, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/stocks');
    }
    // Find stock to be transacted
    Stock.findById(req.params.id, function (err, stock) {
      // Remove $ infront of price if user added it
      if (req.body.price.charAt(0) == '$') {
        req.body.price = req.body.price.substring(1);
      }
      req.body.ticker = stock.ticker;
      req.body.stockId = req.params.id;
      // Swaps positive to negative if sell button was hit
      if (req.body.button === 'sell') {
        req.body.shares = req.body.shares * -1;
      }
      portfolio.transactions.push(req.body);
      portfolio.save(function (err) {
        if (err) {
          return res.redirect('back');
        }
        res.redirect(`/portfolios/${req.body.portfolioId}`);
      });
    });
  });
}
// Remove transactions
function deleteTransaction(req, res) {
  Portfolio.find(req.user._id, function (err, portfolios) {
    portfolios.forEach(function (p, pIdx) {
      p.transactions.forEach(function (t, tIdx) {
        if (req.params.id === t._id.toString()) {
          portfolios[pIdx].transactions[tIdx].remove();
          portfolios[pIdx].save();
        }
      });
    });
    res.redirect(`/portfolios/${req.params.portfolioId}`);
  });
}
