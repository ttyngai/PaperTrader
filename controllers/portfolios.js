const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');
const calculateHoldings = require('../calculateHoldings');
const StockPrice = require('../stockPrice');
// const Transaction = require('../models/transaction')
module.exports = {
  index,
  new: newPortfolio,
  show,
  create,
  delete: deletePortfolio,
  edit,
  update,
};

async function index(req, res) {
  const portfolios = await Portfolio.find({ user: req.user });

  res.render('portfolios/index', { title: 'All Portfolios', portfolios });
}

function newPortfolio(req, res) {
  res.render('portfolios/new', { title: 'New Portfolio' });
}
function create(req, res) {
  const portfolio = new Portfolio(req.body);
  portfolio.user = req.user._id;
  portfolio.userName = req.user.name;
  portfolio.userAvatar = req.user.avatar;
  portfolio.save(function (err) {
    // one way to handle errors
    if (err) {
      console.log(err);
      return res.redirect('/portfolios/new');
    }
    res.redirect(`/portfolios/${portfolio._id}`);
  });
}

function show(req, res) {
  Portfolio.findById(req.params.id, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }

    Stock.find({ user: req.user._id }, async function (err, stocks) {
      let holdings = calculateHoldings.calculateHoldings(portfolio);
      let tickers = [];
      holdings.forEach(function (s) {
        tickers.push(s.ticker, holdings);
      });
      let prices = [];
      if (holdings[0]) {
        prices = await StockPrice.getStockNoId(tickers);

        prices[0].forEach(function (p, idx) {
          p.shares = holdings[idx].shares;
          p.price = holdings[idx].price;

          // console.log('check stock p', p);

          stocks.forEach(function (s) {
            if (s.ticker === p.symbol) {
              p._id = s._id;
            }
          });
        });
      }
      console.log('what stocks is', stocks);
      console.log('what prices[0] is', prices[0]);

      res.render(`portfolios/show`, {
        title: 'Portfolio:',
        portfolio,
        prices,
      });
    });
  });
}

function edit(req, res) {
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }
    res.render('portfolios/edit', { title: 'Edit portfolio', portfolio });
  });
}

function update(req, res) {
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }
    portfolio.name = req.body.name;
    portfolio.save();
    res.redirect(`/portfolios/${req.params.id}`);
  });
}
function deletePortfolio(req, res) {
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }
    portfolio.remove();
    res.redirect('/portfolios');
  });
}
