const Stock = require('../models/stock');
const Portfolio = require('../models/portfolio');
const StockPrice = require('../stockPrice');

module.exports = {
  index,
  show,
  create,
  hide,
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
    // pass in array of tickers
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
function hide(req, res) {
  Stock.findById(req.params.id, function (err, stock) {
    stock.hide = true;
    stock.save();
    res.redirect('/stocks');
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
      //Charting data options (icebox)
      let validRanges = [
        '1d',
        '5d',
        '1mo',
        '3mo',
        '6mo',
        '1y',
        '2y',
        '5y',
        '10y',
        'ytd',
        'max',
      ];
      const chartParsed = await StockPrice.getChartData(
        stock.ticker,
        `1m`,
        `1d`
      );

      // let testTime = new Date().getTimezoneOffset() / 60;
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
    console.log('re.body', req.body);
    const stock = new Stock(req.body);
    stock.user = req.user._id;
    stock.save(function (err) {
      res.redirect(`/stocks`);
    });
  }
}
