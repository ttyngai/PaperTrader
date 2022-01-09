const Stock = require('../models/stock');
const Portfolio = require('../models/portfolio');
const StockPrice = require('../stockPrice');
const User = require('../models/user');
module.exports = {
  index,
  show,
  create,
  hideOrDelete,
  changeTimeframe,
};
// For first time users, populates the watch list with sample tickers.
const sampleTicker = [
  { ticker: 'AAPL' },
  { ticker: 'AMZN' },
  { ticker: 'AMD' },
  { ticker: 'MSFT' },
  { ticker: 'FB' },
  { ticker: 'HD' },
  { ticker: 'KHC' },
  { ticker: 'NVDA' },
  { ticker: 'TM' },
  { ticker: 'JPM' },
  { ticker: 'BA' },
  { ticker: 'QQQ' },
  { ticker: 'SPY' },
  { ticker: 'NFLX' },
  { ticker: 'DIS' },
  { ticker: 'ZM' },
  { ticker: 'WMT' },
  { ticker: 'COKE' },
  { ticker: 'TSLA' },
];
async function index(req, res) {
  //Check to see if it's first time login, populates with sample watch list
  if (req.user.firstTime) {
    for (i = 0; i < sampleTicker.length; i++) {
      const stock = new Stock(sampleTicker[i]);
      stock.user = req.user._id;
      await stock.save();
    }
    req.user.firstTime = false;
    req.user.save(function (err) {
      res.redirect('/stocks');
    });
  }
  // Not first time user, proceed to show list
  else {
    // Pass in array of tickers
    Stock.find({ user: req.user }, async function (err, stocksFound) {
      // Sort alphabetically
      stocksFound.sort(function (a, b) {
        if (a.ticker > b.ticker) return 1;
        if (a.ticker < b.ticker) return -1;
      });
      // Seperate futures
      let futures = [];
      let nonFutures = [];
      stocksFound.forEach(function (stock) {
        stock.ticker.includes('=')
          ? futures.push(stock)
          : nonFutures.push(stock);
      });
      const stocksSorted = futures.concat(nonFutures);
      const stocks = await StockPrice.getStock(stocksSorted, false);
      // Check if all are hidden(empty), allow watchlist to show "No symbols added"
      let listNotEmpty = false;
      stocks.forEach(function (s) {
        if (!s.hide) {
          listNotEmpty = true;
        }
      });
      res.render('stocks/index', {
        title: 'Stocks',
        stocks,
        listNotEmpty,
        req,
      });
    });
  }
}
// Change timeframe on stock charts
function changeTimeframe(req, res) {
  req.user.preferredTimeframe = req.body.button;
  req.user.save(function () {
    res.redirect(`/stocks/${req.params.stockId}`);
  });
}
// Hide stock if in transaction, delete if never transacted
function hideOrDelete(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    Portfolio.find({ user: req.user._id }, function (err, portfolios) {
      let found;
      portfolios.forEach(function (p) {
        //Protect route unless from logged in user
        if (!p.user.equals(req.user._id)) {
          return res.redirect('/portfolios');
        }
        p.transactions.forEach(function (t) {
          if (t.stockId === stock._id.toString()) {
            found = true;
          }
        });
      });
      // If used in transaction before, will hide but not delete
      if (found) {
        stock.hide = true;
        stock.save();
      }
      // If not used in transaction before, will delete to not clutter up db
      else {
        stock.remove();
      }
      res.redirect('/stocks');
    });
  });
}
async function show(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    //Protect route unless from logged in user
    if (!stock.user.equals(req.user._id)) {
      return res.redirect('/stocks');
    }
    let preselectPortfolio = 0;
    if (req.params.portfolioId) {
      preselectPortfolio = req.params.portfolioId;
    }
    Portfolio.find({ user: req.user._id }, async function (err, portfolios) {
      let ticker = [];
      let obj = {};
      obj['ticker'] = stock.ticker;
      ticker.push(obj);
      const quote = await StockPrice.getStock(ticker, false);
      // Charting data options
      // Time Mode '1':5m/1d/time, '2':15m/5d/date, '3':1h/1mo/date, '4':1d/6mo/date, '5':1wk/2y/month
      const chartParsed = await StockPrice.getChartData(
        stock.ticker,
        req.user.preferredTimeframe
      );
      res.render('stocks/show', {
        title: 'Stocks',
        stock,
        portfolios,
        quote,
        req,
        chartParsed,
        preselectPortfolio,
      });
    });
  });
}
async function create(req, res) {
  // Admin function - if "cleanStocks" is entered, removes garbage stocks not used by any user
  if (req.user.isAdmin == true && req.body.ticker === 'cleanStocks') {
    User.find({}, function (err, users) {
      Stock.find({}, function (err, stocks) {
        stocks.forEach(function (stock) {
          let isUsed;
          // Take Each stock
          users.forEach(function (user) {
            // Find if user exists
            if (user._id.toString() === stock.user.toString()) {
              isUsed = true;
            }
          });
          if (!isUsed) {
            console.log('Not used', stock.ticker);
            stock.remove();
          }
        });
      });
    });
  }

  let check;
  req.body.ticker = req.body.ticker.toUpperCase();
  // Check stock exist
  let ticker = [];
  let obj = {};
  obj['ticker'] = req.body.ticker;
  ticker.push(obj);
  check = await StockPrice.getStock(ticker, true);
  // Check stock duplicate
  const duplicate = await Stock.findOne({
    $and: [{ ticker: req.body.ticker }, { user: req.user._id }],
  });
  // If not a real stock, return to same page
  if (!check) {
    res.redirect('/stocks');
  }
  //If duplicated, sets hide to false
  if (duplicate) {
    Stock.findOne(
      {
        $and: [{ ticker: req.body.ticker }, { user: req.user._id }],
      },
      function (err, stock) {
        stock.hide = false;
        stock.save();
        res.redirect(`/stocks`);
      }
    );
  }
  // Is a stock, not a duplicate, create new entry
  if (check && !duplicate) {
    const stock = new Stock(req.body);
    stock.user = req.user._id;
    stock.save(function (err) {
      res.redirect(`/stocks`);
    });
  }
}
