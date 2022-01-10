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
  toggleTechnicals,
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
  // Icebox: if user not logged in, show page with sampleWatchList in DB

  // Check to see if it's first time login, populates with sample watch list
  if (req.user.firstTime) {
    for (i = 0; i < sampleTicker.length; i++) {
      const stock = new Stock(sampleTicker[i]);
      stock.user = req.user._id;
      stock.save();
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
      const futures = [];
      const nonFutures = [];
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
  req.user.chartSettings.timeframe = req.body.button;
  req.user.save(function () {
    res.redirect(`/stocks/${req.params.stockId}`);
  });
}
// toggle technical analysis on stock charts
function toggleTechnicals(req, res) {
  if (req.body.button == 0) {
    req.user.chartSettings.volume = !req.user.chartSettings.volume;
  }
  if (req.body.button == 1) {
    req.user.chartSettings.sma1 = !req.user.chartSettings.sma1;
  }
  if (req.body.button == 2) {
    req.user.chartSettings.sma2 = !req.user.chartSettings.sma2;
  }
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
      const ticker = [];
      const obj = {};
      obj['ticker'] = stock.ticker;
      ticker.push(obj);
      const quote = await StockPrice.getStock(ticker, false);
      // Charting data options
      const chartParsed = await StockPrice.getChartData(
        stock.ticker,
        req.user.chartSettings.timeframe
      );
      // find min and max of chart data
      let chartMin, chartMax, chartVolumeMax;
      chartParsed.forEach(function (candle, idx) {
        if (idx === 0) {
          chartMax = candle[4];
          chartMin = candle[1];
          chartVolumeMax = candle[5];
        }
        if (candle[4] > chartMax) {
          chartMax = candle[4];
        }
        if (candle[1] < chartMin) {
          chartMin = candle[1];
        }
        if (candle[5] > chartVolumeMax) {
          chartVolumeMax = candle[5];
        }
      });
      let currency;
      console.log('quote', quote);
      res.render('stocks/show', {
        title: 'Stocks',
        stock,
        portfolios,
        quote,
        req,
        chartParsed,
        preselectPortfolio,
        chartMin,
        chartMax,
        chartVolumeMax,
      });
    });
  });
}

async function create(req, res) {
  // Secret function: delete own account if `DELETE${req.user.email}` is typed into req.body.ticker, also cleans all stocks of deleted accounts
  if (req.body.ticker === `delete:${req.user.email}`) {
    deleteMyAccount(req);
  }
  // Removes any data not belonging to any users. Calls cleanDb function to clean database of all unused data if "cleanDb" is typed into req.body.ticker.
  if (req.body.ticker === 'cleanDb') {
    cleanDb(Stock);
    cleanDb(Portfolio);
  }
  // Begin create
  // Check stock exist
  let check;
  const ticker = [];
  const obj = {};
  req.body.ticker = req.body.ticker.toUpperCase();
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

// Deletes account and cleans database of stocks
function deleteMyAccount(req) {
  req.user.remove(function () {
    cleanDb(Stock);
    cleanDb(Portfolio);
  });
}

// Removes any specified model in db not owned by any user(Or user has been deleted)
function cleanDb(modelName) {
  User.find({}, function (err, users) {
    modelName.find({}, function (err, datas) {
      datas.forEach(function (data) {
        let isUsed;
        // Take Each data...
        users.forEach(function (user) {
          // ...find if user exists
          if (user._id.toString() === data.user.toString()) {
            // datas sets to found if data's user id matches an existing user in db
            isUsed = true;
          }
        });
        // if user of data.user is not found in db, removes the data from db
        if (!isUsed) {
          data.remove();
        }
      });
    });
  });
}
