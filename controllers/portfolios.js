const Portfolio = require('../models/portfolio');
const Stock = require('../models/stock');
const StockPrice = require('../stockPrice');

module.exports = {
  index,
  show,
  create,
  delete: deletePortfolio,
  edit,
  update,
};

async function index(req, res) {
  const portfolios = await Portfolio.find({ user: req.user });
  res.render('portfolios/index', { title: 'Portfolios', portfolios, req });
}
// Create new portfolio
function create(req, res) {
  const portfolio = new Portfolio(req.body);
  portfolio.user = req.user._id;
  portfolio.userName = req.user.name;
  portfolio.userAvatar = req.user.avatar;
  portfolio.save(function (err) {
    if (err) {
      console.log(err);
      return res.redirect('/portfolios/new');
    }
    res.redirect(`/portfolios`);
  });
}
//Displays selected portfolio with all transactions and current holdings calculated
function show(req, res) {
  Portfolio.findById(req.params.id, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }
    Stock.find({ user: req.user._id }, async function (err, stocks) {
      let holdings = calculateHoldings(portfolio);
      let tickers = [];
      holdings.forEach(function (s) {
        tickers.push(s.ticker, holdings);
      });
      let prices = [];
      if (holdings[0]) {
        prices = await StockPrice.getStockNoId(tickers);
        prices[0].forEach(function (p, idx) {
          p.shares = holdings[idx].shares;
          p.avgPrice = holdings[idx].avgCost;
          // Match and attach _id to prices[0] to be passed onto render in show
          stocks.forEach(function (s) {
            if (s.ticker === p.symbol) {
              p._id = s._id;
            }
          });
        });
      }
      res.render(`portfolios/show`, {
        title: 'Portfolios',
        portfolio,
        prices,
        req,
      });
    });
  });
}

// Renders edit page with specified portfolio id
function edit(req, res) {
  Portfolio.findById({ _id: req.params.id }, function (err, portfolio) {
    //Protect route unless from logged in user
    if (!portfolio.user.equals(req.user._id)) {
      return res.redirect('/portfolios');
    }
    res.render('portfolios/edit', { title: 'Edit portfolio', portfolio, req });
  });
}

// Updates portfolio name and redirects back to this portfolio
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
// Deletes selected portfolio and redirect to portfolio page
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

// Calculate holdings based on portfolio's transaction. Summarizes the net shares(removes 0 share holdings), returns avg price of each holdings remaining
function calculateHoldings(portfolio) {
  let gatheredSum = [];
  // New t.price is purchased price
  portfolio.transactions.forEach(function (t) {
    t.cost = t.shares * t.price;
  });
  //loop through full array and each object to find ticker
  portfolio.transactions.forEach(function (t) {
    let idxOfTickerSum;
    let exist = false;
    //finds whether stock already exist and remembering it's index
    for (i = 0; i < gatheredSum.length; i++) {
      if (t.ticker == gatheredSum[i].ticker) {
        // Found, sets exist and rememebers it's index
        exist = true;
        idxOfTickerSum = i;
      }
    }
    // If doens't exist, makes a new one
    if (!exist) {
      let objSum = {
        ticker: t.ticker,
        shares: t.shares,
        costSum: t.cost,
      };
      gatheredSum.push(objSum);
    }
    // exists, combines shares and prices
    else {
      gatheredSum[idxOfTickerSum]['shares'] += t.shares;
      gatheredSum[idxOfTickerSum]['costSum'] += t.cost;
      //if shares becomes 0, deletes stock from holdings (Why keep stocks with zero shares?)
      if (gatheredSum[idxOfTickerSum]['shares'] === 0) {
        gatheredSum.splice(idxOfTickerSum, 1);
      }
    }
  });
  // calculates average share price
  gatheredSum.forEach(function (t) {
    t.avgCost = t.costSum / t.shares;
  });
  return gatheredSum;
}
